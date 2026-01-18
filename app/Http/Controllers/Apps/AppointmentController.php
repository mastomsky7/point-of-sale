<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Staff;
use App\Services\WhatsApp\WhatsAppService;
use App\Services\Email\EmailService;
use App\Services\SMS\SMSService;
use App\Services\Calendar\GoogleCalendarService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    protected $whatsappService;
    protected $emailService;
    protected $smsService;
    protected $calendarService;

    public function __construct(
        WhatsAppService $whatsappService,
        EmailService $emailService,
        SMSService $smsService,
        GoogleCalendarService $calendarService
    ) {
        $this->whatsappService = $whatsappService;
        $this->emailService = $emailService;
        $this->smsService = $smsService;
        $this->calendarService = $calendarService;
    }

    /**
     * Display a listing of appointments
     */
    public function index(Request $request)
    {
        $query = Appointment::with(['customer', 'staff', 'services', 'createdBy'])
            ->latest('appointment_date');

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->date_from) {
            $query->whereDate('appointment_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('appointment_date', '<=', $request->date_to);
        }

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('appointment_number', 'like', "%{$request->search}%")
                    ->orWhereHas('customer', function ($q) use ($request) {
                        $q->where('name', 'like', "%{$request->search}%");
                    });
            });
        }

        $appointments = $query->paginate(20);

        return Inertia::render('Dashboard/Appointments/Index', [
            'appointments' => $appointments,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new appointment
     */
    public function create()
    {
        return Inertia::render('Dashboard/Appointments/Create', [
            'customers' => Customer::select('id', 'name', 'phone')->get(),
            'services' => Service::where('is_active', true)->with('category')->get(),
            'staff' => Staff::where('is_active', true)->get(),
        ]);
    }

    /**
     * Store a newly created appointment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'staff_id' => 'nullable|exists:staff,id',
            'appointment_date' => 'required|date',
            'services' => 'required|array|min:1',
            'services.*.id' => 'required|exists:services,id',
            'services.*.staff_id' => 'nullable|exists:staff,id',
            'notes' => 'nullable|string|max:1000',
            'deposit' => 'nullable|numeric|min:0',
        ]);

        // Validate appointment is in the future
        if (strtotime($validated['appointment_date']) < time()) {
            return back()->withErrors(['appointment_date' => 'Appointment date must be in the future'])->withInput();
        }

        // Calculate total price and duration
        $services = Service::whereIn('id', collect($validated['services'])->pluck('id'))->get();
        $totalPrice = 0;
        $totalDuration = 0;

        foreach ($validated['services'] as $serviceData) {
            $service = $services->firstWhere('id', $serviceData['id']);
            $totalPrice += $service->price;
            $totalDuration += $service->duration;
        }

        // Create appointment
        $appointment = Appointment::create([
            'customer_id' => $validated['customer_id'],
            'staff_id' => $validated['staff_id'],
            'created_by' => auth()->id(),
            'appointment_date' => $validated['appointment_date'],
            'duration' => $totalDuration,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
            'total_price' => $totalPrice,
            'deposit' => $validated['deposit'] ?? 0,
            'payment_status' => ($validated['deposit'] ?? 0) > 0 ? 'deposit_paid' : 'unpaid',
        ]);

        // Attach services
        foreach ($validated['services'] as $serviceData) {
            $service = $services->firstWhere('id', $serviceData['id']);
            $appointment->appointmentServices()->create([
                'service_id' => $service->id,
                'staff_id' => $serviceData['staff_id'] ?? $validated['staff_id'],
                'price' => $service->price,
                'duration' => $service->duration,
            ]);
        }

        // F2: Send notifications via all enabled channels
        $appointment->load(['customer', 'staff', 'services']);
        $notificationsSent = [];

        // Send WhatsApp confirmation
        if ($this->whatsappService->isEnabled()) {
            $result = $this->whatsappService->sendAppointmentConfirmation($appointment);

            if ($result['success']) {
                $appointment->update([
                    'whatsapp_sent' => true,
                    'whatsapp_sent_at' => now(),
                ]);
                $notificationsSent[] = 'WhatsApp';
            }
        }

        // F1: Send Email confirmation
        if ($this->emailService->sendAppointmentConfirmation($appointment)) {
            $notificationsSent[] = 'Email';
        }

        // F2: Send SMS confirmation
        if ($this->smsService->sendAppointmentConfirmation($appointment)['success'] ?? false) {
            $notificationsSent[] = 'SMS';
        }

        // F3: Sync to Google Calendar
        if ($this->calendarService->isEnabled()) {
            $calendarResult = $this->calendarService->createEvent($appointment);
            if ($calendarResult['success']) {
                $appointment->update([
                    'google_calendar_event_id' => $calendarResult['event_id'],
                    'google_calendar_synced_at' => now(),
                ]);
            }
        }

        $message = 'Appointment created successfully!';
        if (count($notificationsSent) > 0) {
            $message .= ' Confirmation sent via ' . implode(', ', $notificationsSent) . '.';
        }

        return redirect()->route('appointments.index')
            ->with('success', $message);
    }

    /**
     * Display the specified appointment
     */
    public function show(Appointment $appointment)
    {
        $appointment->load(['customer', 'staff', 'createdBy', 'appointmentServices.service', 'appointmentServices.staff', 'transaction', 'feedback']);

        return Inertia::render('Dashboard/Appointments/Show', [
            'appointment' => $appointment,
        ]);
    }

    /**
     * Show the form for editing the appointment
     */
    public function edit(Appointment $appointment)
    {
        $appointment->load(['customer', 'staff', 'appointmentServices.service', 'appointmentServices.staff']);

        return Inertia::render('Dashboard/Appointments/Edit', [
            'appointment' => $appointment,
            'customers' => Customer::select('id', 'name', 'phone')->get(),
            'services' => Service::where('is_active', true)->with('category')->get(),
            'staff' => Staff::where('is_active', true)->get(),
        ]);
    }

    /**
     * Update the specified appointment
     */
    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'customer_id' => 'sometimes|exists:customers,id',
            'appointment_date' => 'required|date',
            'staff_id' => 'nullable|exists:staff,id',
            'services' => 'sometimes|array|min:1',
            'services.*.id' => 'required_with:services|exists:services,id',
            'services.*.staff_id' => 'nullable|exists:staff,id',
            'notes' => 'nullable|string|max:1000',
            'status' => 'sometimes|in:pending,confirmed,in_progress,completed,cancelled,no_show',
            'deposit' => 'sometimes|numeric|min:0',
        ]);

        // Update basic appointment data
        $appointment->update(array_filter([
            'customer_id' => $validated['customer_id'] ?? null,
            'appointment_date' => $validated['appointment_date'],
            'staff_id' => $validated['staff_id'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => $validated['status'] ?? null,
            'deposit' => $validated['deposit'] ?? null,
        ], fn($value) => $value !== null));

        // Update services if provided
        if (isset($validated['services'])) {
            // Delete existing services
            $appointment->appointmentServices()->delete();

            // Recalculate totals
            $services = Service::whereIn('id', collect($validated['services'])->pluck('id'))->get();
            $totalPrice = 0;
            $totalDuration = 0;

            foreach ($validated['services'] as $serviceData) {
                $service = $services->firstWhere('id', $serviceData['id']);
                $totalPrice += $service->price;
                $totalDuration += $service->duration;

                // Create new service entry
                $appointment->appointmentServices()->create([
                    'service_id' => $service->id,
                    'staff_id' => $serviceData['staff_id'] ?? $validated['staff_id'],
                    'price' => $service->price,
                    'duration' => $service->duration,
                ]);
            }

            // Update totals
            $appointment->update([
                'total_price' => $totalPrice,
                'duration' => $totalDuration,
            ]);
        }

        // Update status timestamps
        if (isset($validated['status'])) {
            if ($validated['status'] === 'confirmed' && !$appointment->confirmed_at) {
                $appointment->update(['confirmed_at' => now()]);
            } elseif ($validated['status'] === 'completed' && !$appointment->completed_at) {
                $appointment->update(['completed_at' => now()]);
            } elseif ($validated['status'] === 'cancelled' && !$appointment->cancelled_at) {
                $appointment->update(['cancelled_at' => now()]);
            }
        }

        return redirect()->route('appointments.show', $appointment)->with('success', 'Appointment updated successfully!');
    }

    /**
     * Confirm appointment
     */
    public function confirm(Appointment $appointment)
    {
        $appointment->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Appointment confirmed!');
    }

    /**
     * Cancel appointment
     */
    public function cancel(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        $appointment->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $validated['cancellation_reason'],
        ]);

        return redirect()->back()->with('success', 'Appointment cancelled.');
    }

    /**
     * E2: Show reschedule form
     */
    public function reschedule(Appointment $appointment)
    {
        // Only allow rescheduling for pending/confirmed appointments
        if (!in_array($appointment->status, ['pending', 'confirmed'])) {
            return redirect()->route('appointments.show', $appointment)
                ->with('error', 'Only pending or confirmed appointments can be rescheduled.');
        }

        $appointment->load(['customer', 'staff', 'services']);

        $staff = \App\Models\Staff::where('is_active', true)->get();
        $services = \App\Models\Service::where('is_active', true)->get();

        return Inertia::render('Dashboard/Appointments/Reschedule', [
            'appointment' => $appointment,
            'staff' => $staff,
            'services' => $services,
        ]);
    }

    /**
     * E2: Process reschedule request
     */
    public function processReschedule(Request $request, Appointment $appointment)
    {
        // Only allow rescheduling for pending/confirmed appointments
        if (!in_array($appointment->status, ['pending', 'confirmed'])) {
            return redirect()->route('appointments.show', $appointment)
                ->with('error', 'Only pending or confirmed appointments can be rescheduled.');
        }

        $validated = $request->validate([
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required',
            'staff_id' => 'nullable|exists:staff,id',
            'reschedule_reason' => 'nullable|string|max:500',
        ]);

        // Combine date and time
        $appointmentDateTime = \Carbon\Carbon::parse($validated['appointment_date'] . ' ' . $validated['appointment_time']);

        // Check if slot is available
        $isAvailable = $this->checkSlotAvailability(
            $appointmentDateTime,
            $validated['staff_id'] ?? null,
            $appointment->id // Exclude current appointment from check
        );

        if (!$isAvailable) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'The selected time slot is no longer available. Please choose a different time.');
        }

        // Store old datetime for notification
        $oldDateTime = $appointment->appointment_date;

        // Update appointment
        $appointment->update([
            'appointment_date' => $appointmentDateTime,
            'staff_id' => $validated['staff_id'] ?? $appointment->staff_id,
            'notes' => $appointment->notes . "\n\nRescheduled from " . \Carbon\Carbon::parse($oldDateTime)->format('Y-m-d H:i') .
                      ($validated['reschedule_reason'] ? " - Reason: " . $validated['reschedule_reason'] : ''),
        ]);

        // F2: Send rescheduled notifications via all enabled channels
        $appointment->load(['customer', 'staff', 'services']);
        $notificationsSent = [];

        // Send WhatsApp notification
        if ($this->whatsappService->isEnabled()) {
            if ($this->whatsappService->sendAppointmentRescheduled($appointment, $oldDateTime)['success'] ?? false) {
                $notificationsSent[] = 'WhatsApp';
            }
        }

        // F1: Send Email notification
        if ($this->emailService->sendAppointmentRescheduled($appointment, $oldDateTime)) {
            $notificationsSent[] = 'Email';
        }

        // F2: Send SMS notification
        if ($this->smsService->sendAppointmentRescheduled($appointment, $oldDateTime)['success'] ?? false) {
            $notificationsSent[] = 'SMS';
        }

        // F3: Update Google Calendar event
        if ($this->calendarService->isEnabled() && $appointment->google_calendar_event_id) {
            $calendarResult = $this->calendarService->updateEvent($appointment);
            if ($calendarResult['success']) {
                $appointment->update([
                    'google_calendar_synced_at' => now(),
                ]);
            }
        }

        $message = 'Appointment rescheduled successfully!';
        if (count($notificationsSent) > 0) {
            $message .= ' Notification sent via ' . implode(', ', $notificationsSent) . '.';
        }

        return redirect()->route('appointments.show', $appointment)
            ->with('success', $message);
    }

    /**
     * E2: Check if time slot is available for appointment
     */
    private function checkSlotAvailability($datetime, $staffId = null, $excludeAppointmentId = null)
    {
        $query = Appointment::where('appointment_date', $datetime)
            ->whereIn('status', ['pending', 'confirmed']);

        if ($staffId) {
            $query->where('staff_id', $staffId);
        }

        if ($excludeAppointmentId) {
            $query->where('id', '!=', $excludeAppointmentId);
        }

        return $query->count() === 0;
    }

    /**
     * Mark appointment as completed
     */
    public function complete(Appointment $appointment)
    {
        $appointment->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Appointment marked as completed!');
    }

    /**
     * Get appointments for calendar view
     */
    public function calendar(Request $request)
    {
        $start = $request->start ?? now()->startOfMonth();
        $end = $request->end ?? now()->endOfMonth();

        $appointments = Appointment::with(['customer', 'staff', 'services'])
            ->whereBetween('appointment_date', [$start, $end])
            ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'title' => $appointment->customer->name,
                    'start' => $appointment->appointment_date->toIso8601String(),
                    'end' => $appointment->appointment_date->addMinutes($appointment->duration)->toIso8601String(),
                    'backgroundColor' => $this->getStatusColor($appointment->status),
                    'extendedProps' => [
                        'customer' => $appointment->customer->name,
                        'staff' => $appointment->staff?->name,
                        'services' => $appointment->services->pluck('name')->join(', '),
                        'status' => $appointment->status,
                        'phone' => $appointment->customer->phone,
                    ],
                ];
            });

        return response()->json($appointments);
    }

    /**
     * Get available time slots for a specific date
     */
    public function availableSlots(Request $request)
    {
        $date = $request->date;
        $staffId = $request->staff_id;

        // Get existing appointments for the date
        $appointments = Appointment::where('appointment_date', 'like', $date . '%')
            ->when($staffId, fn($q) => $q->where('staff_id', $staffId))
            ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
            ->get(['appointment_date', 'duration']);

        // Generate time slots (9 AM to 6 PM, 30-minute intervals)
        $slots = [];
        $start = \Carbon\Carbon::parse($date . ' 09:00');
        $end = \Carbon\Carbon::parse($date . ' 18:00');

        while ($start < $end) {
            $slotEnd = $start->copy()->addMinutes(30);

            // Check if slot is available
            $isAvailable = !$appointments->first(function ($appointment) use ($start, $slotEnd) {
                $appointmentStart = \Carbon\Carbon::parse($appointment->appointment_date);
                $appointmentEnd = $appointmentStart->copy()->addMinutes($appointment->duration);

                return $start < $appointmentEnd && $slotEnd > $appointmentStart;
            });

            // Only return available time slots
            if ($isAvailable) {
                $slots[] = $start->format('H:i');
            }

            $start->addMinutes(30);
        }

        return response()->json($slots);
    }

    /**
     * Resend WhatsApp confirmation
     */
    public function resendWhatsApp(Appointment $appointment)
    {
        if (!$this->whatsappService->isEnabled()) {
            return redirect()->back()->with('error', 'WhatsApp integration is not enabled.');
        }

        $result = $this->whatsappService->sendAppointmentConfirmation($appointment->load(['customer', 'staff', 'services']));

        if ($result['success']) {
            $appointment->update([
                'whatsapp_sent' => true,
                'whatsapp_sent_at' => now(),
            ]);

            return redirect()->back()->with('success', 'WhatsApp confirmation sent!');
        }

        return redirect()->back()->with('error', 'Failed to send WhatsApp message: ' . $result['error']);
    }

    /**
     * Delete appointment
     */
    public function destroy(Appointment $appointment)
    {
        // Only allow deletion of pending or cancelled appointments
        if (!in_array($appointment->status, ['pending', 'cancelled'])) {
            return redirect()->back()->with('error', 'Only pending or cancelled appointments can be deleted.');
        }

        // F3: Delete Google Calendar event if exists
        if ($this->calendarService->isEnabled() && $appointment->google_calendar_event_id) {
            $this->calendarService->deleteEvent($appointment);
        }

        $appointment->delete();

        return redirect()->route('appointments.index')->with('success', 'Appointment deleted successfully!');
    }

    /**
     * D3: Create appointment from existing transaction (walk-in to appointment conversion)
     */
    public function createFromTransaction($transactionId)
    {
        $transaction = \App\Models\Transaction::with(['customer', 'details.service', 'details.staff'])
            ->findOrFail($transactionId);

        // Check if transaction already linked to appointment
        if ($transaction->appointment_id) {
            return redirect()->route('appointments.show', $transaction->appointment_id)
                ->with('info', 'This transaction is already linked to an appointment.');
        }

        // Check if customer exists
        if (!$transaction->customer) {
            return redirect()->route('transactions.history')
                ->with('error', 'Cannot create appointment without customer information.');
        }

        // Get services from transaction details
        $services = $transaction->details
            ->filter(fn($detail) => $detail->service_id !== null)
            ->map(fn($detail) => [
                'id' => $detail->service_id,
                'name' => $detail->service->name,
                'price' => $detail->price,
                'duration' => $detail->duration,
                'staff_id' => $detail->staff_id,
                'staff_name' => $detail->staff->name ?? null,
            ])
            ->values();

        if ($services->isEmpty()) {
            return redirect()->route('transactions.history')
                ->with('error', 'This transaction has no services to book.');
        }

        // Get active staff and all services
        $staff = \App\Models\Staff::where('is_active', true)
            ->select('id', 'name', 'specialization', 'avatar')
            ->get();

        $allServices = \App\Models\Service::where('is_active', true)
            ->with('category')
            ->select('id', 'name', 'description', 'price', 'duration', 'category_id', 'image')
            ->get()
            ->groupBy('category.name');

        return Inertia::render('Dashboard/Appointments/Create', [
            'staff' => $staff,
            'services' => $allServices,
            'customer' => $transaction->customer,
            'prefilledServices' => $services,
            'fromTransaction' => true,
            'transactionInvoice' => $transaction->invoice,
        ]);
    }

    /**
     * Get status color for calendar
     */
    private function getStatusColor($status)
    {
        return match ($status) {
            'pending' => '#f59e0b',
            'confirmed' => '#10b981',
            'in_progress' => '#3b82f6',
            'completed' => '#6366f1',
            'cancelled' => '#ef4444',
            'no_show' => '#6b7280',
            default => '#6b7280',
        };
    }
}
