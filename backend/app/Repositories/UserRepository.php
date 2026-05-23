<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository
{
    public function findByClerkUserId(string $clerkUserId): ?User
    {
        return User::query()
            ->where('clerk_user_id', $clerkUserId)
            ->first();
    }

    public function findByEmail(string $email): ?User
    {
        return User::query()
            ->where('email', $email)
            ->first();
    }

    public function make(): User
    {
        return new User;
    }

    public function save(User $user): User
    {
        $user->save();

        /** @var User $freshUser */
        $freshUser = $user->fresh();

        return $freshUser;
    }
}
