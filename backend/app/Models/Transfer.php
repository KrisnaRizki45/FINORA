<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Transfer extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'transaction_id',
        'from_account_id',
        'to_account_id',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * Get the parent transaction.
     */
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Get the source account.
     */
    public function fromAccount()
    {
        return $this->belongsTo(Account::class, 'from_account_id');
    }

    /**
     * Get the destination account.
     */
    public function toAccount()
    {
        return $this->belongsTo(Account::class, 'to_account_id');
    }
}
