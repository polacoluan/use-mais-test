<?php

namespace App\Services\Clerk;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class ClerkUserSynchronizer
{
    /**
     * Create or update the local user represented by the Clerk subject claim.
     *
     * @param  array<string, mixed>  $claims
     */
    public function synchronize(array $claims): User
    {
        $clerkUserId = $claims['sub'] ?? null;

        if (! is_string($clerkUserId) || $clerkUserId === '') {
            throw new RuntimeException('Missing Clerk user identifier.');
        }

        $clerkUser = $this->fetchClerkUser($clerkUserId);
        $primaryEmail = $this->extractPrimaryEmail($clerkUser);
        $displayName = $this->resolveDisplayName($clerkUser, $clerkUserId);

        $user = User::query()
            ->where('clerk_user_id', $clerkUserId)
            ->first();

        if ($user === null && $primaryEmail !== null) {
            $user = User::query()
                ->where('email', $primaryEmail)
                ->first();
        }

        $user ??= new User;

        $user->clerk_user_id = $clerkUserId;
        $user->name = $displayName;

        if ($primaryEmail !== null) {
            $user->email = $primaryEmail;
        } elseif (! $user->exists || $this->isPlaceholderEmail($user->email)) {
            $user->email = $this->placeholderEmail($clerkUserId);
        }

        if (! $user->exists && blank($user->password)) {
            $user->password = Str::random(40);
        }

        $user->save();

        return $user->fresh();
    }

    /**
     * @return array<string, mixed>|null
     */
    private function fetchClerkUser(string $clerkUserId): ?array
    {
        $secretKey = config('services.clerk.secret_key');

        if (! is_string($secretKey) || trim($secretKey) === '') {
            return null;
        }

        $response = Http::baseUrl((string) config('services.clerk.backend_api_url'))
            ->acceptJson()
            ->withToken($secretKey)
            ->get('/v1/users/'.$clerkUserId);

        if ($response->status() === 404) {
            return null;
        }

        return $response->throw()->json();
    }

    /**
     * @param  array<string, mixed>|null  $clerkUser
     */
    private function extractPrimaryEmail(?array $clerkUser): ?string
    {
        if ($clerkUser === null) {
            return null;
        }

        $primaryEmailAddressId = $clerkUser['primary_email_address_id'] ?? null;
        $emailAddresses = $clerkUser['email_addresses'] ?? [];

        if (! is_string($primaryEmailAddressId) || ! is_array($emailAddresses)) {
            return null;
        }

        foreach ($emailAddresses as $emailAddress) {
            if (! is_array($emailAddress)) {
                continue;
            }

            if (($emailAddress['id'] ?? null) === $primaryEmailAddressId) {
                $value = $emailAddress['email_address'] ?? null;

                return is_string($value) && $value !== '' ? $value : null;
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>|null  $clerkUser
     */
    private function resolveDisplayName(?array $clerkUser, string $clerkUserId): string
    {
        if ($clerkUser === null) {
            return 'Clerk user '.$clerkUserId;
        }

        $firstName = is_string($clerkUser['first_name'] ?? null) ? trim((string) $clerkUser['first_name']) : '';
        $lastName = is_string($clerkUser['last_name'] ?? null) ? trim((string) $clerkUser['last_name']) : '';
        $fullName = trim($firstName.' '.$lastName);

        if ($fullName !== '') {
            return $fullName;
        }

        $username = $clerkUser['username'] ?? null;

        if (is_string($username) && $username !== '') {
            return $username;
        }

        return 'Clerk user '.$clerkUserId;
    }

    private function placeholderEmail(string $clerkUserId): string
    {
        return $clerkUserId.'@clerk.local';
    }

    private function isPlaceholderEmail(?string $email): bool
    {
        return is_string($email) && str_ends_with($email, '@clerk.local');
    }
}
