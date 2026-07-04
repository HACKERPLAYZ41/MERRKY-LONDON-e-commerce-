<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'two_factor_otp',
        'two_factor_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_otp',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_expires_at' => 'datetime',
        ];
    }

    /**
     * User Shipping Addresses
     */
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    /**
     * User Orders
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * User Reviews
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * User Wishlist Toggle Mapping
     */
    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    /**
     * User Cart
     */
    public function cart()
    {
        return $this->hasOne(Cart::class);
    }

    /**
     * User Support Tickets
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
}
