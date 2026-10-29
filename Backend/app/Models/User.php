<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
        'tier',
        'vehicle_tag',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'avatar_url',
    ];

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->attributes['avatar'] ?? null;
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
