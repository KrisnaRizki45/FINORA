<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Account extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;
    protected $appends = ['current_balance'];

    protected $fillable = [
        'household_id',
        'name',
        'type',
        'institution',
        'owner_type',
        'owner_user_id',
        'currency',
        'initial_balance',
        'is_active',
    ];

    protected $casts = [
        'initial_balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the household this account belongs to.
     */
    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    /**
     * Get the specific owner of the account, if personal.
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    /**
     * Get all transactions associated with this account.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get all transfers where this account is the destination.
     */
    public function transfersIn()
    {
        return $this->hasMany(Transfer::class, 'to_account_id');
    }

    /**
     * Get all transfers where this account is the source.
     */
    public function transfersOut()
    {
        return $this->hasMany(Transfer::class, 'from_account_id');
    }

    /**
     * Dynamically calculate the current balance based on initial balance, transactions, and transfers.
     */
    public function getCurrentBalanceAttribute()
    {
        // For performance, check if relations are loaded or if we are summing them in queries.
        // However, we will do a direct DB query to sum if not pre-calculated,
        // to avoid loading all models into memory.
        
        $income = $this->transactions()->where('type', 'income')->sum('amount');
        $expense = $this->transactions()->where('type', 'expense')->sum('amount');
        $transfersIn = $this->transfersIn()->sum('amount');
        $transfersOut = $this->transfersOut()->sum('amount');

        return $this->initial_balance + $income - $expense + $transfersIn - $transfersOut;
    }
}
