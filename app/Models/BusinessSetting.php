<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessSetting extends Model
{
    protected $fillable = [
        'business_type',
        'business_name',
        'business_phone',
        'business_email',
        'business_address',
        'business_logo',
        'currency',
        'timezone',
        'enable_appointments',
        'enable_tables',
        'appointment_slot_duration',
        'opening_time',
        'closing_time',
        'working_days',
    ];

    protected $casts = [
        'enable_appointments' => 'boolean',
        'enable_tables' => 'boolean',
        'working_days' => 'array',
    ];

    public static function getSetting()
    {
        return static::first() ?? static::create([
            'business_name' => config('app.name', 'Point of Sales'),
            'business_type' => 'retail',
        ]);
    }
}
