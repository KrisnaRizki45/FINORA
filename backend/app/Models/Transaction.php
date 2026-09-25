<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Transaction extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'household_id',
        'created_by',
        'account_id',
        'category_id',
        'type',
        'amount',
        'transaction_date',
        'description',
        'notes',
        'metadata',
        'deleted_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
        'metadata' => 'array',
    ];

    /**
     * Get the household.
     */
    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    /**
     * Get the user who created this transaction.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the primary account associated with the transaction.
     */
    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get the category (if any).
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the specific transfer details (if type is transfer).
     */
    public function transfer()
    {
        return $this->hasOne(Transfer::class);
    }
}
