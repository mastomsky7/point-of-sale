<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Transaction;
use App\Models\Staff;
use App\Models\Customer;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class AppointmentAnalyticsController extends Controller
{
    /**
     * Display appointment analytics dashboard
     */
    public function index(Request $request)
    {
        // Get date range from request or default to current month
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        // C1: Conversion Rate Analytics
        $conversionStats = $this->getConversionStats($startDate, $endDate);

        // C2: Revenue Analytics
        $revenueStats = $this->getRevenueStats($startDate, $endDate);

        // C3: Staff Performance
        $staffPerformance = $this->getStaffPerformance($startDate, $endDate);

        // Additional metrics
        $dailyTrends = $this->getDailyTrends($startDate, $endDate);
        $statusBreakdown = $this->getStatusBreakdown($startDate, $endDate);

        // G: Advanced analytics
        $customerInsights = $this->getCustomerInsights($startDate, $endDate);
        $servicePopularity = $this->getServicePopularity($startDate, $endDate);
        $timeSlotAnalysis = $this->getTimeSlotAnalysis($startDate, $endDate);
        $comparisonMetrics = $this->getComparisonMetrics($startDate, $endDate);

        return Inertia::render('Dashboard/Appointments/Analytics', [
            'conversionStats' => $conversionStats,
            'revenueStats' => $revenueStats,
            'staffPerformance' => $staffPerformance,
            'dailyTrends' => $dailyTrends,
            'statusBreakdown' => $statusBreakdown,
            'customerInsights' => $customerInsights,
            'servicePopularity' => $servicePopularity,
            'timeSlotAnalysis' => $timeSlotAnalysis,
            'comparisonMetrics' => $comparisonMetrics,
            'dateRange' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ]);
    }

    /**
     * C1: Get conversion rate statistics
     */
    private function getConversionStats($startDate, $endDate)
    {
        $totalAppointments = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->count();

        $convertedAppointments = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->whereNotNull('transaction_id')
            ->count();

        $conversionRate = $totalAppointments > 0
            ? round(($convertedAppointments / $totalAppointments) * 100, 2)
            : 0;

        // Get status breakdown for appointments
        $pending = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->where('status', 'pending')
            ->count();

        $confirmed = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->where('status', 'confirmed')
            ->count();

        $completed = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->count();

        $cancelled = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->where('status', 'cancelled')
            ->count();

        $noShow = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->where('status', 'no_show')
            ->count();

        return [
            'total_appointments' => $totalAppointments,
            'converted_appointments' => $convertedAppointments,
            'conversion_rate' => $conversionRate,
            'pending' => $pending,
            'confirmed' => $confirmed,
            'completed' => $completed,
            'cancelled' => $cancelled,
            'no_show' => $noShow,
        ];
    }

    /**
     * C2: Get revenue statistics
     */
    private function getRevenueStats($startDate, $endDate)
    {
        // Appointment revenue (from transactions linked to appointments)
        $appointmentRevenue = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('appointment_id')
            ->sum('grand_total');

        // Walk-in revenue (transactions without appointments)
        $walkInRevenue = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->whereNull('appointment_id')
            ->sum('grand_total');

        // Total deposits collected
        $totalDeposits = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->sum('deposit');

        // Outstanding deposits (appointments with deposit but not completed)
        $outstandingDeposits = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->where('deposit', '>', 0)
            ->sum('deposit');

        // Average appointment value
        $appointmentTransactionCount = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('appointment_id')
            ->count();

        $avgAppointmentValue = $appointmentTransactionCount > 0
            ? round($appointmentRevenue / $appointmentTransactionCount, 2)
            : 0;

        // Total revenue
        $totalRevenue = $appointmentRevenue + $walkInRevenue;

        // Appointment revenue percentage
        $appointmentRevenuePercent = $totalRevenue > 0
            ? round(($appointmentRevenue / $totalRevenue) * 100, 2)
            : 0;

        return [
            'appointment_revenue' => $appointmentRevenue,
            'walk_in_revenue' => $walkInRevenue,
            'total_revenue' => $totalRevenue,
            'appointment_revenue_percent' => $appointmentRevenuePercent,
            'total_deposits' => $totalDeposits,
            'outstanding_deposits' => $outstandingDeposits,
            'avg_appointment_value' => $avgAppointmentValue,
        ];
    }

    /**
     * C3: Get staff performance statistics
     */
    private function getStaffPerformance($startDate, $endDate)
    {
        $staffStats = Staff::where('is_active', true)
            ->select('id', 'name')
            ->get()
            ->map(function ($staff) use ($startDate, $endDate) {
                // Count appointments assigned to this staff
                $appointmentsCount = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
                    ->where('staff_id', $staff->id)
                    ->count();

                // Count completed appointments
                $completedCount = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
                    ->where('staff_id', $staff->id)
                    ->where('status', 'completed')
                    ->count();

                // Calculate fulfillment rate
                $fulfillmentRate = $appointmentsCount > 0
                    ? round(($completedCount / $appointmentsCount) * 100, 2)
                    : 0;

                // Get revenue from completed appointments
                $revenue = Transaction::whereBetween('created_at', [$startDate, $endDate])
                    ->whereHas('appointment', function ($query) use ($staff) {
                        $query->where('staff_id', $staff->id);
                    })
                    ->sum('grand_total');

                // Count services performed (from appointment_services table)
                $servicesCount = DB::table('appointment_services')
                    ->join('appointments', 'appointment_services.appointment_id', '=', 'appointments.id')
                    ->whereBetween('appointments.appointment_date', [$startDate, $endDate])
                    ->where('appointment_services.staff_id', $staff->id)
                    ->count();

                return [
                    'id' => $staff->id,
                    'name' => $staff->name,
                    'appointments_count' => $appointmentsCount,
                    'completed_count' => $completedCount,
                    'fulfillment_rate' => $fulfillmentRate,
                    'revenue' => $revenue,
                    'services_count' => $servicesCount,
                ];
            })
            ->sortByDesc('revenue')
            ->values();

        return $staffStats;
    }

    /**
     * Get daily trends for the period
     */
    private function getDailyTrends($startDate, $endDate)
    {
        $trends = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(appointment_date) as date'),
                DB::raw('COUNT(*) as appointments'),
                DB::raw('SUM(CASE WHEN transaction_id IS NOT NULL THEN 1 ELSE 0 END) as converted')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'appointments' => $item->appointments,
                    'converted' => $item->converted,
                    'conversion_rate' => $item->appointments > 0
                        ? round(($item->converted / $item->appointments) * 100, 2)
                        : 0,
                ];
            });

        return $trends;
    }

    /**
     * Get status breakdown
     */
    private function getStatusBreakdown($startDate, $endDate)
    {
        return Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                ];
            });
    }

    /**
     * Export analytics data to CSV
     */
    public function export(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        $appointments = Appointment::with(['customer', 'staff', 'transaction'])
            ->whereBetween('appointment_date', [$startDate, $endDate])
            ->get();

        $filename = "appointment-analytics-{$startDate}-to-{$endDate}.csv";
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($appointments) {
            $file = fopen('php://output', 'w');

            // Header row
            fputcsv($file, [
                'Appointment Number',
                'Customer',
                'Date',
                'Status',
                'Staff',
                'Total Price',
                'Deposit',
                'Payment Status',
                'Converted to Transaction',
                'Invoice',
                'Transaction Total',
            ]);

            // Data rows
            foreach ($appointments as $appointment) {
                fputcsv($file, [
                    $appointment->appointment_number,
                    $appointment->customer->name ?? 'N/A',
                    $appointment->appointment_date->format('Y-m-d H:i'),
                    ucfirst($appointment->status),
                    $appointment->staff->name ?? 'N/A',
                    $appointment->total_price,
                    $appointment->deposit,
                    ucfirst(str_replace('_', ' ', $appointment->payment_status)),
                    $appointment->transaction ? 'Yes' : 'No',
                    $appointment->transaction->invoice ?? 'N/A',
                    $appointment->transaction->grand_total ?? 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * G1: Get customer behavior insights
     */
    private function getCustomerInsights($startDate, $endDate)
    {
        // New vs returning customers
        $newCustomers = Customer::whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $returningCustomers = Customer::where('created_at', '<', $startDate)
            ->whereHas('appointments', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('appointment_date', [$startDate, $endDate]);
            })
            ->count();

        // Top customers by revenue
        $topCustomers = Customer::select('customers.id', 'customers.name', 'customers.loyalty_tier')
            ->join('transactions', 'transactions.customer_id', '=', 'customers.id')
            ->whereBetween('transactions.created_at', [$startDate, $endDate])
            ->groupBy('customers.id', 'customers.name', 'customers.loyalty_tier')
            ->selectRaw('SUM(transactions.grand_total) as total_revenue')
            ->selectRaw('COUNT(transactions.id) as transaction_count')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        // Customer retention rate
        $previousPeriodStart = Carbon::parse($startDate)->subDays(
            Carbon::parse($endDate)->diffInDays(Carbon::parse($startDate))
        )->toDateString();

        $previousPeriodCustomers = Customer::whereHas('appointments', function ($query) use ($previousPeriodStart, $startDate) {
            $query->whereBetween('appointment_date', [$previousPeriodStart, $startDate]);
        })->pluck('id');

        $retainedCustomers = Customer::whereIn('id', $previousPeriodCustomers)
            ->whereHas('appointments', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('appointment_date', [$startDate, $endDate]);
            })
            ->count();

        $retentionRate = $previousPeriodCustomers->count() > 0
            ? round(($retainedCustomers / $previousPeriodCustomers->count()) * 100, 2)
            : 0;

        // Average customer lifetime value
        $avgLifetimeValue = Customer::whereHas('transactions')
            ->withSum('transactions', 'grand_total')
            ->avg('transactions_sum_grand_total') ?? 0;

        return [
            'new_customers' => $newCustomers,
            'returning_customers' => $returningCustomers,
            'retention_rate' => $retentionRate,
            'avg_lifetime_value' => round($avgLifetimeValue, 2),
            'top_customers' => $topCustomers,
        ];
    }

    /**
     * G2: Get service popularity and performance
     */
    private function getServicePopularity($startDate, $endDate)
    {
        $serviceStats = DB::table('appointment_services')
            ->join('appointments', 'appointment_services.appointment_id', '=', 'appointments.id')
            ->join('services', 'appointment_services.service_id', '=', 'services.id')
            ->whereBetween('appointments.appointment_date', [$startDate, $endDate])
            ->select(
                'services.id',
                'services.name',
                'services.price',
                DB::raw('COUNT(*) as booking_count'),
                DB::raw('SUM(appointment_services.price) as total_revenue')
            )
            ->groupBy('services.id', 'services.name', 'services.price')
            ->orderByDesc('booking_count')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => $item->price,
                    'booking_count' => $item->booking_count,
                    'total_revenue' => $item->total_revenue,
                ];
            });

        // Service category revenue
        $categoryRevenue = DB::table('appointment_services')
            ->join('appointments', 'appointment_services.appointment_id', '=', 'appointments.id')
            ->join('services', 'appointment_services.service_id', '=', 'services.id')
            ->whereBetween('appointments.appointment_date', [$startDate, $endDate])
            ->select(
                'services.category',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(appointment_services.price) as revenue')
            )
            ->groupBy('services.category')
            ->get();

        return [
            'services' => $serviceStats,
            'categories' => $categoryRevenue,
        ];
    }

    /**
     * G3: Get time slot analysis
     */
    private function getTimeSlotAnalysis($startDate, $endDate)
    {
        $timeSlots = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->get()
            ->groupBy(function ($appointment) {
                $hour = $appointment->appointment_date->format('H');
                return $hour . ':00';
            })
            ->map(function ($appointments, $timeSlot) {
                return [
                    'time_slot' => $timeSlot,
                    'count' => $appointments->count(),
                    'completed' => $appointments->where('status', 'completed')->count(),
                    'cancelled' => $appointments->where('status', 'cancelled')->count(),
                    'no_show' => $appointments->where('status', 'no_show')->count(),
                ];
            })
            ->sortBy('time_slot')
            ->values();

        // Peak hours
        $peakHours = $timeSlots->sortByDesc('count')->take(3)->values();

        // Day of week analysis
        $dayOfWeek = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->get()
            ->groupBy(function ($appointment) {
                return $appointment->appointment_date->format('l');
            })
            ->map(function ($appointments, $day) {
                return [
                    'day' => $day,
                    'count' => $appointments->count(),
                    'revenue' => $appointments->sum(function ($appointment) {
                        return $appointment->transaction->grand_total ?? 0;
                    }),
                ];
            })
            ->sortByDesc('count')
            ->values();

        return [
            'time_slots' => $timeSlots,
            'peak_hours' => $peakHours,
            'day_of_week' => $dayOfWeek,
        ];
    }

    /**
     * G4: Get comparison metrics with previous period
     */
    private function getComparisonMetrics($startDate, $endDate)
    {
        $daysDiff = Carbon::parse($endDate)->diffInDays(Carbon::parse($startDate)) + 1;
        $previousPeriodStart = Carbon::parse($startDate)->subDays($daysDiff)->toDateString();
        $previousPeriodEnd = Carbon::parse($startDate)->subDay()->toDateString();

        // Current period metrics
        $currentAppointments = Appointment::whereBetween('appointment_date', [$startDate, $endDate])->count();
        $currentRevenue = Transaction::whereBetween('created_at', [$startDate, $endDate])->sum('grand_total');
        $currentCompleted = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->count();

        // Previous period metrics
        $previousAppointments = Appointment::whereBetween('appointment_date', [$previousPeriodStart, $previousPeriodEnd])->count();
        $previousRevenue = Transaction::whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])->sum('grand_total');
        $previousCompleted = Appointment::whereBetween('appointment_date', [$previousPeriodStart, $previousPeriodEnd])
            ->where('status', 'completed')
            ->count();

        // Calculate percentage changes
        $appointmentsChange = $previousAppointments > 0
            ? round((($currentAppointments - $previousAppointments) / $previousAppointments) * 100, 2)
            : 0;

        $revenueChange = $previousRevenue > 0
            ? round((($currentRevenue - $previousRevenue) / $previousRevenue) * 100, 2)
            : 0;

        $completedChange = $previousCompleted > 0
            ? round((($currentCompleted - $previousCompleted) / $previousCompleted) * 100, 2)
            : 0;

        return [
            'current' => [
                'appointments' => $currentAppointments,
                'revenue' => $currentRevenue,
                'completed' => $currentCompleted,
            ],
            'previous' => [
                'appointments' => $previousAppointments,
                'revenue' => $previousRevenue,
                'completed' => $previousCompleted,
            ],
            'changes' => [
                'appointments' => $appointmentsChange,
                'revenue' => $revenueChange,
                'completed' => $completedChange,
            ],
        ];
    }
}
