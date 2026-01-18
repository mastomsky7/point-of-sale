<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Production Optimization Settings
    |--------------------------------------------------------------------------
    |
    | These settings control various optimization features for production.
    |
    */

    'cache' => [
        'config' => env('CACHE_CONFIG', true),
        'routes' => env('CACHE_ROUTES', true),
        'views' => env('CACHE_VIEWS', true),
        'events' => env('CACHE_EVENTS', true),
    ],

    'compression' => [
        'enabled' => env('COMPRESSION_ENABLED', true),
        'level' => env('COMPRESSION_LEVEL', 6), // 1-9, higher = better compression, slower
    ],

    'assets' => [
        'minify' => env('ASSETS_MINIFY', true),
        'combine' => env('ASSETS_COMBINE', true),
        'cdn' => env('ASSETS_CDN', false),
    ],

    'database' => [
        'persistent_connection' => env('DB_PERSISTENT', false),
        'strict_mode' => env('DB_STRICT_MODE', true),
    ],

    'session' => [
        'driver' => env('SESSION_DRIVER', 'file'), // file, redis, database
        'lifetime' => env('SESSION_LIFETIME', 120),
    ],
];
