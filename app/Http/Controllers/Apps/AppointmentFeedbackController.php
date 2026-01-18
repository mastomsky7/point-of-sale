<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AppointmentFeedback;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppointmentFeedbackController extends Controller
{
    /**
     * E3: Show feedback form for completed appointment
     */
    public function create($appointmentId)
    {
        $appointment = Appointment::with(['customer', 'staff', 'services', 'feedback'])
            ->findOrFail($appointmentId);

        // Check if appointment is completed
        if ($appointment->status !== 'completed') {
            return redirect()->route('appointments.show', $appointment->id)
                ->with('error', 'Feedback can only be submitted for completed appointments.');
        }

        // Check if feedback already exists
        if ($appointment->feedback) {
            return redirect()->route('appointments.feedback.show', $appointment->id)
                ->with('info', 'You have already submitted feedback for this appointment.');
        }

        return Inertia::render('Dashboard/Appointments/Feedback/Create', [
            'appointment' => $appointment,
        ]);
    }

    /**
     * E3: Store feedback
     */
    public function store(Request $request, $appointmentId)
    {
        $appointment = Appointment::with('feedback')->findOrFail($appointmentId);

        // Validate appointment status
        if ($appointment->status !== 'completed') {
            return redirect()->route('appointments.show', $appointment->id)
                ->with('error', 'Feedback can only be submitted for completed appointments.');
        }

        // Check if feedback already exists
        if ($appointment->feedback) {
            return redirect()->route('appointments.feedback.show', $appointment->id)
                ->with('error', 'Feedback already exists for this appointment.');
        }

        $validated = $request->validate([
            'overall_rating' => 'required|integer|min:1|max:5',
            'service_quality' => 'nullable|integer|min:1|max:5',
            'staff_rating' => 'nullable|integer|min:1|max:5',
            'cleanliness_rating' => 'nullable|integer|min:1|max:5',
            'value_rating' => 'nullable|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'improvements' => 'nullable|string|max:1000',
            'would_recommend' => 'required|boolean',
        ]);

        AppointmentFeedback::create([
            ...$validated,
            'appointment_id' => $appointment->id,
            'customer_id' => $appointment->customer_id,
            'staff_id' => $appointment->staff_id,
        ]);

        return redirect()->route('appointments.show', $appointment->id)
            ->with('success', 'Thank you for your feedback!');
    }

    /**
     * E3: Show feedback details
     */
    public function show($appointmentId)
    {
        $appointment = Appointment::with(['customer', 'staff', 'services', 'feedback'])
            ->findOrFail($appointmentId);

        if (!$appointment->feedback) {
            return redirect()->route('appointments.feedback.create', $appointment->id)
                ->with('info', 'No feedback found. Please submit your feedback.');
        }

        return Inertia::render('Dashboard/Appointments/Feedback/Show', [
            'appointment' => $appointment,
            'feedback' => $appointment->feedback,
        ]);
    }

    /**
     * E3: Get feedback analytics
     */
    public function analytics(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        // Overall statistics
        $totalFeedbacks = AppointmentFeedback::whereBetween('created_at', [$startDate, $endDate])->count();

        $averageRatings = AppointmentFeedback::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
                AVG(overall_rating) as avg_overall,
                AVG(service_quality) as avg_service,
                AVG(staff_rating) as avg_staff,
                AVG(cleanliness_rating) as avg_cleanliness,
                AVG(value_rating) as avg_value
            ')
            ->first();

        $recommendationRate = AppointmentFeedback::whereBetween('created_at', [$startDate, $endDate])
            ->where('would_recommend', true)
            ->count();

        $recommendationPercent = $totalFeedbacks > 0
            ? round(($recommendationRate / $totalFeedbacks) * 100, 1)
            : 0;

        // Rating distribution
        $ratingDistribution = AppointmentFeedback::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('overall_rating, COUNT(*) as count')
            ->groupBy('overall_rating')
            ->orderBy('overall_rating', 'desc')
            ->get();

        // Staff performance
        $staffRatings = AppointmentFeedback::with('staff')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('staff_id')
            ->selectRaw('staff_id, COUNT(*) as feedback_count, AVG(staff_rating) as avg_rating, AVG(overall_rating) as avg_overall')
            ->groupBy('staff_id')
            ->having('feedback_count', '>=', 1)
            ->get();

        // Recent feedbacks
        $recentFeedbacks = AppointmentFeedback::with(['appointment', 'customer', 'staff'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboard/Appointments/Feedback/Analytics', [
            'stats' => [
                'total_feedbacks' => $totalFeedbacks,
                'avg_overall' => round($averageRatings->avg_overall ?? 0, 1),
                'avg_service' => round($averageRatings->avg_service ?? 0, 1),
                'avg_staff' => round($averageRatings->avg_staff ?? 0, 1),
                'avg_cleanliness' => round($averageRatings->avg_cleanliness ?? 0, 1),
                'avg_value' => round($averageRatings->avg_value ?? 0, 1),
                'recommendation_rate' => $recommendationPercent,
            ],
            'ratingDistribution' => $ratingDistribution,
            'staffRatings' => $staffRatings,
            'recentFeedbacks' => $recentFeedbacks,
            'dateRange' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ]);
    }
}
