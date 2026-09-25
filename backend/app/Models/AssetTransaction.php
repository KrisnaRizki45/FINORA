<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AssetTransaction extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'asset_id',
        'created_by',
        'transaction_date',
        'type',
        'units',
        'price_per_unit',
        'fee_amount',
        'total_amount',
        'linked_transaction_id',
        'notes',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'units' => 'decimal:8',
        'price_per_unit' => 'decimal:2',
        'fee_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function linkedCashTransaction()
    {
        return $this->belongsTo(Transaction::class, 'linked_transaction_id');
    }
}
