<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'postal_code' => str_pad((string) fake()->numberBetween(0, 99999999), 8, '0', STR_PAD_LEFT),
            'street' => fake()->streetName(),
            'street_number' => (string) fake()->buildingNumber(),
            'complement' => fake()->optional()->secondaryAddress(),
            'neighborhood' => fake()->citySuffix(),
            'city' => fake()->city(),
            'state' => fake()->stateAbbr(),
        ];
    }
}
