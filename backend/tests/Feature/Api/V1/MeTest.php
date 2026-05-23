<?php

namespace Tests\Feature\Api\V1;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use OpenSSLAsymmetricKey;
use Tests\TestCase;

class MeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware('clerk.auth')->get('/_test/authenticated-user', function (Request $request) {
            /** @var array<string, mixed> $clerkAuth */
            $clerkAuth = $request->attributes->get('clerk_auth', []);

            return response()->json([
                'data' => [
                    'id' => $request->user()?->id,
                    'clerk_user_id' => $request->user()?->clerk_user_id,
                    'email' => $request->user()?->email,
                ],
                'meta' => [
                    'clerk' => [
                        'user_id' => $clerkAuth['sub'] ?? null,
                        'session_id' => $clerkAuth['sid'] ?? null,
                    ],
                ],
            ]);
        });
    }

    public function test_it_rejects_requests_without_a_clerk_session_token(): void
    {
        $response = $this->getJson('/_test/authenticated-user');

        $response->assertUnauthorized()
            ->assertJson([
                'message' => 'Não foi possível autenticar sua sessão.',
            ]);
    }

    public function test_it_returns_the_authenticated_user_for_a_valid_clerk_token(): void
    {
        [$privateKey, $publicKey] = $this->generateKeyPair();

        config()->set('services.clerk.jwt_key', $publicKey);
        config()->set('services.clerk.authorized_parties', ['http://localhost:3000']);

        $token = $this->createToken([
            'azp' => 'http://localhost:3000',
            'exp' => time() + 3600,
            'nbf' => time() - 60,
            'sid' => 'sess_test_123',
            'sub' => 'user_test_123',
        ], $privateKey);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/_test/authenticated-user');

        $response->assertOk()
            ->assertJsonPath('data.clerk_user_id', 'user_test_123')
            ->assertJsonPath('data.email', 'user_test_123@clerk.local')
            ->assertJsonPath('meta.clerk.user_id', 'user_test_123')
            ->assertJsonPath('meta.clerk.session_id', 'sess_test_123');
    }

    public function test_it_rejects_tokens_from_unapproved_origins(): void
    {
        [$privateKey, $publicKey] = $this->generateKeyPair();

        config()->set('services.clerk.jwt_key', $publicKey);
        config()->set('services.clerk.authorized_parties', ['http://localhost:3000']);

        $token = $this->createToken([
            'azp' => 'http://malicious.local',
            'exp' => time() + 3600,
            'nbf' => time() - 60,
            'sub' => 'user_test_456',
        ], $privateKey);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/_test/authenticated-user');

        $response->assertUnauthorized()
            ->assertJson([
                'message' => 'Não foi possível autenticar sua sessão.',
            ]);
    }

    public function test_it_authenticates_with_issuer_jwks_even_if_clerk_user_lookup_fails(): void
    {
        [$privateKey, $publicKey] = $this->generateKeyPair();

        config()->set('services.clerk.jwt_key', null);
        config()->set('services.clerk.secret_key', 'sk_test_dummy');
        config()->set('services.clerk.authorized_parties', ['http://localhost:3000']);

        Http::fake([
            'https://nearby-newt-81.clerk.accounts.dev/.well-known/jwks.json' => Http::response([
                'keys' => [
                    $this->createJwk('test-key', $publicKey),
                ],
            ]),
            'https://api.clerk.com/v1/users/*' => Http::response([
                'errors' => [
                    ['message' => 'Unauthorized'],
                ],
            ], 401),
        ]);

        $token = $this->createToken([
            'azp' => 'http://localhost:3000',
            'exp' => time() + 3600,
            'iss' => 'https://nearby-newt-81.clerk.accounts.dev',
            'nbf' => time() - 60,
            'sid' => 'sess_test_issuer_jwks',
            'sub' => 'user_test_issuer_jwks',
        ], $privateKey);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/_test/authenticated-user');

        $response->assertOk()
            ->assertJsonPath('data.clerk_user_id', 'user_test_issuer_jwks')
            ->assertJsonPath('data.email', 'user_test_issuer_jwks@clerk.local')
            ->assertJsonPath('meta.clerk.session_id', 'sess_test_issuer_jwks');
    }

    /**
     * @return array{0: OpenSSLAsymmetricKey, 1: string}
     */
    private function generateKeyPair(): array
    {
        $privateKey = openssl_pkey_new([
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ]);

        if (! $privateKey instanceof OpenSSLAsymmetricKey) {
            $this->fail('Unable to generate an RSA private key for Clerk token tests.');
        }

        $details = openssl_pkey_get_details($privateKey);

        if (! is_array($details) || ! isset($details['key']) || ! is_string($details['key'])) {
            $this->fail('Unable to extract the RSA public key for Clerk token tests.');
        }

        return [$privateKey, $details['key']];
    }

    /**
     * @param  array<string, mixed>  $claims
     */
    private function createToken(array $claims, OpenSSLAsymmetricKey $privateKey): string
    {
        $header = [
            'alg' => 'RS256',
            'kid' => 'test-key',
            'typ' => 'JWT',
        ];

        $encodedHeader = $this->base64UrlEncode(json_encode($header, JSON_THROW_ON_ERROR));
        $encodedPayload = $this->base64UrlEncode(json_encode($claims, JSON_THROW_ON_ERROR));
        $signingInput = $encodedHeader.'.'.$encodedPayload;

        $signature = '';
        $isSigned = openssl_sign($signingInput, $signature, $privateKey, OPENSSL_ALGO_SHA256);

        if (! $isSigned) {
            $this->fail('Unable to sign the Clerk test token.');
        }

        return $signingInput.'.'.$this->base64UrlEncode($signature);
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    /**
     * @return array<string, mixed>
     */
    private function createJwk(string $kid, string $publicKey): array
    {
        $resource = openssl_pkey_get_public($publicKey);

        if (! $resource instanceof OpenSSLAsymmetricKey) {
            $this->fail('Unable to parse the RSA public key for Clerk JWKS tests.');
        }

        $details = openssl_pkey_get_details($resource);
        $rsa = is_array($details) ? ($details['rsa'] ?? null) : null;

        if (! is_array($rsa) || ! isset($rsa['n'], $rsa['e']) || ! is_string($rsa['n']) || ! is_string($rsa['e'])) {
            $this->fail('Unable to extract RSA modulus and exponent for Clerk JWKS tests.');
        }

        return [
            'alg' => 'RS256',
            'e' => $this->base64UrlEncode($rsa['e']),
            'kid' => $kid,
            'kty' => 'RSA',
            'n' => $this->base64UrlEncode($rsa['n']),
            'use' => 'sig',
        ];
    }
}
