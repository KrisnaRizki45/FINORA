<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class HouseholdMember extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'household_id',
        'user_id',
        'role',
        'status',
        'joined_at',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
    ];

    /**
     * Get the household this membership belongs to.
     */
    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    /**
     * Get the user this membership belongs to.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
