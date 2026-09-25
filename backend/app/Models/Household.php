<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Household extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'currency',
        'timezone',
        'created_by',
        'invite_code',
    ];

    /**
     * Get the user that created the household.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the members of the household.
     */
    public function members()
    {
        return $this->hasMany(HouseholdMember::class);
    }
}
