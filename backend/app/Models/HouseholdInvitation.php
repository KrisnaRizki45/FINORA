<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class HouseholdInvitation extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'household_id',
        'invited_by',
        'invited_email',
        'token',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    /**
     * Get the household associated with the invitation.
     */
    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    /**
     * Get the user who sent the invitation.
     */
    public function inviter()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }
}
