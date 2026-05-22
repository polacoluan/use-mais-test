<?php

namespace Tests\Feature\Api\V1;

use Illuminate\Foundation\Testing\RefreshDatabase;
use OpenSSLAsymmetricKey;
use Tests\TestCase;

class MeTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_rejects_requests_without_a_clerk_session_token(): void
    {
        $response = $this->getJson('/api/v1/me');

        $response->assertUnauthorized()
            ->assertJson([
                'message' => 'Unauthenticated.',
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
            ->getJson('/api/v1/me');

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
            ->getJson('/api/v1/me');

        $response->assertUnauthorized()
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
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
}
