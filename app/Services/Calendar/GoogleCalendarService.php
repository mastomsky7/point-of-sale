<?php

namespace App\Services\Calendar;

use App\Models\PaymentSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleCalendarService
{
    protected $settings;
    protected $config;
    protected $accessToken;

    const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
    const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

    public function __construct()
    {
        $this->settings = PaymentSetting::first();
        $this->config = $this->settings?->googleCalendarConfig() ?? [];
    }

    /**
     * Check if Google Calendar integration is enabled
     */
    public function isEnabled(): bool
    {
        return $this->settings?->isGoogleCalendarReady() ?? false;
    }

    /**
     * F3: Get access token using refresh token
     */
    protected function getAccessToken(): ?string
    {
        if ($this->accessToken) {
            return $this->accessToken;
        }

        try {
            $response = Http::asForm()->post(self::OAUTH_TOKEN_URL, [
                'client_id' => $this->config['client_id'],
                'client_secret' => $this->config['client_secret'],
                'refresh_token' => $this->config['refresh_token'],
                'grant_type' => 'refresh_token',
            ]);

            if ($response->successful()) {
                $this->accessToken = $response->json('access_token');
                return $this->accessToken;
            }

            Log::error('Failed to get Google access token', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('Google OAuth error', [
                'error' => $e->getMessage()
            ]);

            return null;
        }
    }

    /**
     * F3: Create calendar event for appointment
     */
    public function createEvent($appointment): array
    {
        if (!$this->isEnabled()) {
            return ['success' => false, 'error' => 'Google Calendar not enabled'];
        }

        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            return ['success' => false, 'error' => 'Failed to authenticate with Google'];
        }

        try {
            $appointment->load(['customer', 'staff', 'services']);

            $eventData = $this->formatEventData($appointment);
            $calendarId = $this->config['calendar_id'];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json',
            ])->post(self::CALENDAR_API_BASE . "/calendars/{$calendarId}/events", $eventData);

            if ($response->successful()) {
                $event = $response->json();

                Log::info('Google Calendar event created', [
                    'appointment_id' => $appointment->id,
                    'event_id' => $event['id']
                ]);

                return [
                    'success' => true,
                    'event_id' => $event['id'],
                    'event_link' => $event['htmlLink'] ?? null,
                ];
            }

            Log::error('Google Calendar API error (create)', [
                'appointment_id' => $appointment->id,
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => $response->json('error.message') ?? 'Failed to create event'
            ];

        } catch (\Exception $e) {
            Log::error('Google Calendar create event error', [
                'appointment_id' => $appointment->id ?? null,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * F3: Update calendar event
     */
    public function updateEvent($appointment): array
    {
        if (!$this->isEnabled()) {
            return ['success' => false, 'error' => 'Google Calendar not enabled'];
        }

        if (!$appointment->google_calendar_event_id) {
            // No existing event, create new one
            return $this->createEvent($appointment);
        }

        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            return ['success' => false, 'error' => 'Failed to authenticate with Google'];
        }

        try {
            $appointment->load(['customer', 'staff', 'services']);

            $eventData = $this->formatEventData($appointment);
            $calendarId = $this->config['calendar_id'];
            $eventId = $appointment->google_calendar_event_id;

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json',
            ])->put(self::CALENDAR_API_BASE . "/calendars/{$calendarId}/events/{$eventId}", $eventData);

            if ($response->successful()) {
                $event = $response->json();

                Log::info('Google Calendar event updated', [
                    'appointment_id' => $appointment->id,
                    'event_id' => $event['id']
                ]);

                return [
                    'success' => true,
                    'event_id' => $event['id'],
                    'event_link' => $event['htmlLink'] ?? null,
                ];
            }

            Log::error('Google Calendar API error (update)', [
                'appointment_id' => $appointment->id,
                'event_id' => $eventId,
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => $response->json('error.message') ?? 'Failed to update event'
            ];

        } catch (\Exception $e) {
            Log::error('Google Calendar update event error', [
                'appointment_id' => $appointment->id ?? null,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * F3: Delete calendar event
     */
    public function deleteEvent($appointment): array
    {
        if (!$this->isEnabled()) {
            return ['success' => false, 'error' => 'Google Calendar not enabled'];
        }

        if (!$appointment->google_calendar_event_id) {
            return ['success' => true, 'message' => 'No event to delete'];
        }

        $accessToken = $this->getAccessToken();
        if (!$accessToken) {
            return ['success' => false, 'error' => 'Failed to authenticate with Google'];
        }

        try {
            $calendarId = $this->config['calendar_id'];
            $eventId = $appointment->google_calendar_event_id;

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->delete(self::CALENDAR_API_BASE . "/calendars/{$calendarId}/events/{$eventId}");

            if ($response->successful() || $response->status() === 404) {
                Log::info('Google Calendar event deleted', [
                    'appointment_id' => $appointment->id,
                    'event_id' => $eventId
                ]);

                return ['success' => true];
            }

            Log::error('Google Calendar API error (delete)', [
                'appointment_id' => $appointment->id,
                'event_id' => $eventId,
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to delete event'
            ];

        } catch (\Exception $e) {
            Log::error('Google Calendar delete event error', [
                'appointment_id' => $appointment->id ?? null,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * F3: Format appointment data for Google Calendar event
     */
    protected function formatEventData($appointment): array
    {
        $businessName = config('app.name', 'Point of Sales');

        // Build description
        $description = "Appointment with {$businessName}\n\n";
        $description .= "Customer: {$appointment->customer->name}\n";

        if ($appointment->customer->phone) {
            $description .= "Phone: {$appointment->customer->phone}\n";
        }

        if ($appointment->staff) {
            $description .= "Staff: {$appointment->staff->name}\n";
        }

        $description .= "\nServices:\n";
        foreach ($appointment->services as $service) {
            $description .= "- {$service->name} ({$service->pivot->duration} min)\n";
        }

        $description .= "\nTotal: Rp " . number_format($appointment->total_price, 0, ',', '.') . "\n";
        $description .= "Duration: {$appointment->duration} minutes\n";

        if ($appointment->notes) {
            $description .= "\nNotes: {$appointment->notes}";
        }

        // Calculate end time
        $startDateTime = $appointment->appointment_date;
        $endDateTime = $appointment->appointment_date->copy()->addMinutes($appointment->duration);

        // Prepare attendees
        $attendees = [];
        if ($appointment->customer->email) {
            $attendees[] = [
                'email' => $appointment->customer->email,
                'displayName' => $appointment->customer->name,
            ];
        }

        $eventData = [
            'summary' => "Appointment: {$appointment->customer->name}",
            'description' => $description,
            'start' => [
                'dateTime' => $startDateTime->format('c'), // ISO 8601 format
                'timeZone' => config('app.timezone', 'Asia/Jakarta'),
            ],
            'end' => [
                'dateTime' => $endDateTime->format('c'),
                'timeZone' => config('app.timezone', 'Asia/Jakarta'),
            ],
            'attendees' => $attendees,
            'reminders' => [
                'useDefault' => false,
                'overrides' => [
                    ['method' => 'email', 'minutes' => 24 * 60], // 24 hours before
                    ['method' => 'popup', 'minutes' => 60],       // 1 hour before
                ],
            ],
        ];

        // Only send notifications if enabled
        if (!$this->config['send_notifications']) {
            $eventData['attendees'] = [];
        }

        return $eventData;
    }

    /**
     * F3: Sync appointment to calendar (create or update)
     */
    public function syncAppointment($appointment): array
    {
        if (!$this->isEnabled()) {
            return ['success' => false, 'error' => 'Google Calendar not enabled'];
        }

        if (!$this->config['auto_sync']) {
            return ['success' => false, 'error' => 'Auto-sync is disabled'];
        }

        if ($appointment->google_calendar_event_id) {
            return $this->updateEvent($appointment);
        } else {
            return $this->createEvent($appointment);
        }
    }

    /**
     * F3: Test Google Calendar connection
     */
    public function testConnection(): bool
    {
        try {
            $accessToken = $this->getAccessToken();
            if (!$accessToken) {
                return false;
            }

            $calendarId = $this->config['calendar_id'];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get(self::CALENDAR_API_BASE . "/calendars/{$calendarId}");

            return $response->successful();

        } catch (\Exception $e) {
            Log::error('Google Calendar connection test failed', [
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }
}
