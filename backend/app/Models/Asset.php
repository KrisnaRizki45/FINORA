<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Asset extends Model
{
    use HasFactory, SoftDeletes, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'household_id',
        'name',
        'type',
        'symbol',
        'owner_type',
        'owner_user_id',
        'current_units',
        'average_buy_price',
        'current_value',
        'currency',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'current_units' => 'decimal:8',
        'average_buy_price' => 'decimal:2',
        'current_value' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function transactions()
    {
        return $this->hasMany(AssetTransaction::class);
    }
}
