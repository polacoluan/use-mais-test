<?php

namespace App\Services\Clerk;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use UnexpectedValueException;

class ClerkTokenVerifier
{
    /**
     * Verify the Clerk session token in the current request.
     *
     * @return array<string, mixed>
     */
    public function verifyRequest(Request $request): array
    {
        $token = $this->extractToken($request);

        if ($token === null) {
            throw new RuntimeException('Missing Clerk session token.');
        }

        [$header, $claims, $signingInput, $signature] = $this->parseToken($token);

        $publicKey = $this->resolvePublicKey($header, $claims);
        $algorithm = $this->resolveOpenSslAlgorithm($header);

        $isVerified = openssl_verify($signingInput, $signature, $publicKey, $algorithm);

        if ($isVerified !== 1) {
            throw new RuntimeException('Invalid Clerk session token signature.');
        }

        $this->validateTimeClaims($claims);
        $this->validateAuthorizedParty($claims);

        return $claims;
    }

    private function extractToken(Request $request): ?string
    {
        $bearerToken = $request->bearerToken();

        if (is_string($bearerToken) && $bearerToken !== '') {
            return $bearerToken;
        }

        $cookieToken = $request->cookie('__session');

        return is_string($cookieToken) && $cookieToken !== '' ? $cookieToken : null;
    }

    /**
     * @return array{0: array<string, mixed>, 1: array<string, mixed>, 2: string, 3: string}
     */
    private function parseToken(string $token): array
    {
        $segments = explode('.', $token);

        if (count($segments) !== 3) {
            throw new UnexpectedValueException('Malformed Clerk session token.');
        }

        [$headerSegment, $payloadSegment, $signatureSegment] = $segments;

        $header = $this->decodeJwtSegment($headerSegment);
        $claims = $this->decodeJwtSegment($payloadSegment);
        $signature = $this->base64UrlDecode($signatureSegment);

        return [$header, $claims, $headerSegment.'.'.$payloadSegment, $signature];
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeJwtSegment(string $segment): array
    {
        $decoded = json_decode($this->base64UrlDecode($segment), true);

        if (! is_array($decoded)) {
            throw new UnexpectedValueException('Unable to decode Clerk session token.');
        }

        return $decoded;
    }

    private function base64UrlDecode(string $value): string
    {
        $remainder = strlen($value) % 4;

        if ($remainder > 0) {
            $value .= str_repeat('=', 4 - $remainder);
        }

        $decoded = base64_decode(strtr($value, '-_', '+/'), true);

        if ($decoded === false) {
            throw new UnexpectedValueException('Invalid Clerk token encoding.');
        }

        return $decoded;
    }

    /**
     * @param  array<string, mixed>  $header
     * @param  array<string, mixed>  $claims
     */
    private function resolvePublicKey(array $header, array $claims): string
    {
        $jwtKey = config('services.clerk.jwt_key');

        if (is_string($jwtKey) && trim($jwtKey) !== '') {
            return $jwtKey;
        }

        $kid = $header['kid'] ?? null;

        if (! is_string($kid) || $kid === '') {
            throw new RuntimeException('Missing Clerk key identifier.');
        }

        $keys = $this->fetchJwks($claims);

        foreach ($keys as $key) {
            if (($key['kid'] ?? null) === $kid) {
                return $this->rsaJwkToPem($key);
            }
        }

        throw new RuntimeException('Unable to find a matching Clerk signing key.');
    }

    /**
     * @param  array<string, mixed>  $claims
     * @return array<int, array<string, mixed>>
     */
    private function fetchJwks(array $claims): array
    {
        $jwksUrl = $this->resolveJwksUrl($claims);
        $cacheKey = 'clerk:jwks:'.sha1($jwksUrl);

        /** @var array<string, mixed> $jwks */
        $jwks = Cache::remember($cacheKey, now()->addHours(6), function () use ($jwksUrl): array {
            return Http::acceptJson()->get($jwksUrl)->throw()->json();
        });

        $keys = $jwks['keys'] ?? null;

        if (! is_array($keys)) {
            throw new RuntimeException('Invalid Clerk JWKS response.');
        }

        return array_values(array_filter($keys, 'is_array'));
    }

    /**
     * @param  array<string, mixed>  $claims
     */
    private function resolveJwksUrl(array $claims): string
    {
        $issuer = $claims['iss'] ?? null;

        if (is_string($issuer) && filter_var($issuer, FILTER_VALIDATE_URL) !== false) {
            return rtrim($issuer, '/').'/.well-known/jwks.json';
        }

        return (string) config('services.clerk.jwks_url');
    }

    /**
     * @param  array<string, mixed>  $jwk
     */
    private function rsaJwkToPem(array $jwk): string
    {
        if (($jwk['kty'] ?? null) !== 'RSA') {
            throw new RuntimeException('Unsupported Clerk signing key type.');
        }

        $modulus = $this->base64UrlDecode((string) ($jwk['n'] ?? ''));
        $exponent = $this->base64UrlDecode((string) ($jwk['e'] ?? ''));

        if ($modulus === '' || $exponent === '') {
            throw new RuntimeException('Invalid Clerk signing key parameters.');
        }

        $modulus = $this->encodeAsn1Integer($modulus);
        $exponent = $this->encodeAsn1Integer($exponent);

        $rsaPublicKey = $this->encodeAsn1Sequence($modulus.$exponent);
        $bitString = $this->encodeAsn1BitString($rsaPublicKey);
        $algorithm = $this->encodeAsn1Sequence(
            $this->encodeAsn1ObjectIdentifier("\x2A\x86\x48\x86\xF7\x0D\x01\x01\x01")
            .$this->encodeAsn1Null()
        );
        $subjectPublicKeyInfo = $this->encodeAsn1Sequence($algorithm.$bitString);

        return "-----BEGIN PUBLIC KEY-----\n"
            .chunk_split(base64_encode($subjectPublicKeyInfo), 64, "\n")
            ."-----END PUBLIC KEY-----\n";
    }

    private function encodeAsn1Integer(string $value): string
    {
        if (ord($value[0]) > 0x7F) {
            $value = "\x00".$value;
        }

        return "\x02".$this->encodeAsn1Length(strlen($value)).$value;
    }

    private function encodeAsn1Sequence(string $value): string
    {
        return "\x30".$this->encodeAsn1Length(strlen($value)).$value;
    }

    private function encodeAsn1BitString(string $value): string
    {
        return "\x03".$this->encodeAsn1Length(strlen($value) + 1)."\x00".$value;
    }

    private function encodeAsn1ObjectIdentifier(string $value): string
    {
        return "\x06".$this->encodeAsn1Length(strlen($value)).$value;
    }

    private function encodeAsn1Null(): string
    {
        return "\x05\x00";
    }

    private function encodeAsn1Length(int $length): string
    {
        if ($length < 0x80) {
            return chr($length);
        }

        $encoded = '';

        while ($length > 0) {
            $encoded = chr($length & 0xFF).$encoded;
            $length >>= 8;
        }

        return chr(0x80 | strlen($encoded)).$encoded;
    }

    /**
     * @param  array<string, mixed>  $header
     */
    private function resolveOpenSslAlgorithm(array $header): int
    {
        $algorithm = $header['alg'] ?? null;

        return match ($algorithm) {
            'RS256' => OPENSSL_ALGO_SHA256,
            'RS384' => OPENSSL_ALGO_SHA384,
            'RS512' => OPENSSL_ALGO_SHA512,
            default => throw new RuntimeException('Unsupported Clerk signing algorithm.'),
        };
    }

    /**
     * @param  array<string, mixed>  $claims
     */
    private function validateTimeClaims(array $claims): void
    {
        $now = time();
        $clockSkew = (int) config('services.clerk.clock_skew', 5);

        $notBefore = $claims['nbf'] ?? null;
        $expiresAt = $claims['exp'] ?? null;
        $issuedAt = $claims['iat'] ?? null;

        if (is_numeric($notBefore) && (int) $notBefore > ($now + $clockSkew)) {
            throw new RuntimeException('Clerk session token is not valid yet.');
        }

        if (! is_numeric($expiresAt) || (int) $expiresAt < ($now - $clockSkew)) {
            throw new RuntimeException('Clerk session token has expired.');
        }

        if (is_numeric($issuedAt) && (int) $issuedAt > ($now + $clockSkew)) {
            throw new RuntimeException('Clerk session token was issued in the future.');
        }
    }

    /**
     * @param  array<string, mixed>  $claims
     */
    private function validateAuthorizedParty(array $claims): void
    {
        $authorizedParties = config('services.clerk.authorized_parties', []);

        if (! is_array($authorizedParties) || $authorizedParties === []) {
            return;
        }

        $authorizedParty = $claims['azp'] ?? null;

        if ($authorizedParty === null) {
            return;
        }

        if (! is_string($authorizedParty) || ! in_array($authorizedParty, $authorizedParties, true)) {
            throw new RuntimeException('Unauthorized Clerk token origin.');
        }
    }
}
