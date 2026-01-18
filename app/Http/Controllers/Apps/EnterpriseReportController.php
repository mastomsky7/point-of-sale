<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\SavedReport;
use App\Models\ReportSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EnterpriseReportController extends Controller
{
    /**
     * Display reports dashboard
     */
    public function index(): Response
    {
        $savedReports = SavedReport::where('user_id', auth()->id())
            ->orWhere('is_public', true)
            ->with('user')
            ->latest()
            ->take(10)
            ->get();

        $schedules = ReportSchedule::where('user_id', auth()->id())
            ->with('user')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Dashboard/Reports/Index', [
            'savedReports' => $savedReports,
            'schedules' => $schedules,
            'stats' => [
                'total_saved' => SavedReport::where('user_id', auth()->id())->count(),
                'total_schedules' => ReportSchedule::where('user_id', auth()->id())->count(),
                'active_schedules' => ReportSchedule::where('user_id', auth()->id())->active()->count(),
            ],
        ]);
    }

    /**
     * Display sales report
     */
    public function sales(Request $request): Response
    {
        $filters = $this->getFilters($request);

        return Inertia::render('Dashboard/Reports/SalesReport', [
            'filters' => $filters,
        ]);
    }

    /**
     * Display products report
     */
    public function products(Request $request): Response
    {
        $filters = $this->getFilters($request);

        return Inertia::render('Dashboard/Reports/ProductsReport', [
            'filters' => $filters,
        ]);
    }

    /**
     * Display customers report
     */
    public function customers(Request $request): Response
    {
        $filters = $this->getFilters($request);

        return Inertia::render('Dashboard/Reports/Customers', [
            'filters' => $filters,
        ]);
    }

    /**
     * Display profit report
     */
    public function profit(Request $request): Response
    {
        $filters = $this->getFilters($request);

        return Inertia::render('Dashboard/Reports/Profit', [
            'filters' => $filters,
        ]);
    }

    /**
     * Display tax report
     */
    public function tax(Request $request): Response
    {
        $filters = $this->getFilters($request);

        return Inertia::render('Dashboard/Reports/TaxReport', [
            'filters' => $filters,
        ]);
    }

    /**
     * Display inventory report
     */
    public function inventory(Request $request): Response
    {
        $filters = $this->getFilters($request);

        return Inertia::render('Dashboard/Reports/InventoryReport', [
            'filters' => $filters,
        ]);
    }

    /**
     * Save a report template
     */
    public function save(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:sales,products,customers,profit,tax,inventory',
            'filters' => 'nullable|array',
            'columns' => 'nullable|array',
            'format' => 'required|in:table,chart,summary',
            'is_public' => 'boolean',
        ]);

        $report = SavedReport::create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Report template saved successfully!');
    }

    /**
     * Load a saved report
     */
    public function load(SavedReport $report)
    {
        // Check permission
        if ($report->user_id !== auth()->id() && !$report->is_public) {
            abort(403, 'Unauthorized access to this report.');
        }

        $report->incrementViewCount();

        $routeMap = [
            'sales' => 'reports.sales',
            'products' => 'reports.products',
            'customers' => 'reports.customers',
            'profit' => 'reports.profit',
            'tax' => 'reports.tax',
            'inventory' => 'reports.inventory',
        ];

        $route = $routeMap[$report->type] ?? 'reports.index';

        return redirect()->route($route, [
            'filters' => $report->filters,
            'columns' => $report->columns,
            'format' => $report->format,
        ]);
    }

    /**
     * Delete a saved report
     */
    public function destroy(SavedReport $report)
    {
        // Check permission
        if ($report->user_id !== auth()->id()) {
            abort(403, 'Unauthorized to delete this report.');
        }

        $report->delete();

        return redirect()->back()->with('success', 'Report template deleted successfully!');
    }

    /**
     * Display saved reports
     */
    public function saved(): Response
    {
        $reports = SavedReport::where('user_id', auth()->id())
            ->orWhere('is_public', true)
            ->with('user')
            ->latest()
            ->paginate(20);

        return Inertia::render('Dashboard/Reports/Saved', [
            'reports' => $reports,
        ]);
    }

    /**
     * Display scheduled reports
     */
    public function schedules(): Response
    {
        $schedules = ReportSchedule::where('user_id', auth()->id())
            ->with(['user', 'savedReport'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Dashboard/Reports/Schedules', [
            'schedules' => $schedules,
        ]);
    }

    /**
     * Create a report schedule
     */
    public function createSchedule(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:sales,products,customers,profit,tax,inventory',
            'frequency' => 'required|in:daily,weekly,monthly,quarterly,yearly',
            'format' => 'required|in:pdf,excel,both',
            'filters' => 'nullable|array',
            'recipients' => 'required|array',
            'recipients.*' => 'email',
            'send_at' => 'required|date_format:H:i',
            'day_of_week' => 'nullable|integer|between:0,6',
            'day_of_month' => 'nullable|integer|between:1,31',
        ]);

        $schedule = ReportSchedule::create([
            ...$validated,
            'user_id' => auth()->id(),
            'next_send_at' => $this->calculateNextSendTime($validated),
        ]);

        return redirect()->back()->with('success', 'Report schedule created successfully!');
    }

    /**
     * Update a report schedule
     */
    public function updateSchedule(Request $request, ReportSchedule $schedule)
    {
        // Check permission
        if ($schedule->user_id !== auth()->id()) {
            abort(403, 'Unauthorized to update this schedule.');
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'frequency' => 'sometimes|in:daily,weekly,monthly,quarterly,yearly',
            'format' => 'sometimes|in:pdf,excel,both',
            'filters' => 'nullable|array',
            'recipients' => 'sometimes|array',
            'recipients.*' => 'email',
            'send_at' => 'sometimes|date_format:H:i',
            'day_of_week' => 'nullable|integer|between:0,6',
            'day_of_month' => 'nullable|integer|between:1,31',
            'is_active' => 'sometimes|boolean',
        ]);

        $schedule->update($validated);

        if (isset($validated['frequency']) || isset($validated['send_at'])) {
            $schedule->update([
                'next_send_at' => $schedule->calculateNextSendTime(),
            ]);
        }

        return redirect()->back()->with('success', 'Report schedule updated successfully!');
    }

    /**
     * Delete a report schedule
     */
    public function destroySchedule(ReportSchedule $schedule)
    {
        // Check permission
        if ($schedule->user_id !== auth()->id()) {
            abort(403, 'Unauthorized to delete this schedule.');
        }

        $schedule->delete();

        return redirect()->back()->with('success', 'Report schedule deleted successfully!');
    }

    /**
     * Toggle schedule active status
     */
    public function toggleSchedule(ReportSchedule $schedule)
    {
        // Check permission
        if ($schedule->user_id !== auth()->id()) {
            abort(403, 'Unauthorized to modify this schedule.');
        }

        $schedule->update([
            'is_active' => !$schedule->is_active,
        ]);

        $status = $schedule->is_active ? 'activated' : 'deactivated';

        return redirect()->back()->with('success', "Report schedule {$status} successfully!");
    }

    /**
     * Get filters from request
     */
    private function getFilters(Request $request): array
    {
        return [
            'date_from' => $request->input('date_from', now()->startOfMonth()->format('Y-m-d')),
            'date_to' => $request->input('date_to', now()->format('Y-m-d')),
            'date_range' => $request->input('date_range', 'this_month'),
            'category_id' => $request->input('category_id'),
            'product_id' => $request->input('product_id'),
            'customer_id' => $request->input('customer_id'),
            'payment_method' => $request->input('payment_method'),
            'status' => $request->input('status'),
        ];
    }

    /**
     * Calculate next send time for schedule
     */
    private function calculateNextSendTime(array $data): \Carbon\Carbon
    {
        $now = now();
        $time = \Carbon\Carbon::parse($data['send_at']);

        switch ($data['frequency']) {
            case 'daily':
                $next = $now->copy()->setTime($time->hour, $time->minute);
                if ($next->isPast()) {
                    $next->addDay();
                }
                break;

            case 'weekly':
                $dayOfWeek = $data['day_of_week'] ?? 1;
                $next = $now->copy()->next($dayOfWeek)->setTime($time->hour, $time->minute);
                break;

            case 'monthly':
                $dayOfMonth = $data['day_of_month'] ?? 1;
                $next = $now->copy()->day($dayOfMonth)->setTime($time->hour, $time->minute);
                if ($next->isPast()) {
                    $next->addMonth();
                }
                break;

            case 'quarterly':
                $dayOfMonth = $data['day_of_month'] ?? 1;
                $next = $now->copy()->day($dayOfMonth)->setTime($time->hour, $time->minute);
                if ($next->isPast()) {
                    $next->addMonths(3);
                }
                break;

            case 'yearly':
                $dayOfMonth = $data['day_of_month'] ?? 1;
                $next = $now->copy()->month(1)->day($dayOfMonth)->setTime($time->hour, $time->minute);
                if ($next->isPast()) {
                    $next->addYear();
                }
                break;

            default:
                $next = $now->addDay();
        }

        return $next;
    }
}
