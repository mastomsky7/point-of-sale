<?php
namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //get customers
        $customers = Customer::when(request()->search, function ($customers) {
            $customers = $customers->where('name', 'like', '%' . request()->search . '%');
        })->latest()->paginate(5);

        //return inertia
        return Inertia::render('Dashboard/Customers/Index', [
            'customers' => $customers,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return Inertia::render('Dashboard/Customers/Create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        /**
         * validate
         */
        $request->validate([
            'name'    => 'required',
            'phone' => 'required|unique:customers',
            'address' => 'required',
        ]);

        //create customer
        Customer::create([
            'name'    => $request->name,
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        //redirect
        return to_route('customers.index');
    }

    /**
     * Store a newly created customer via AJAX (returns JSON, no redirect)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeAjax(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'phone' => 'required|string|unique:customers,phone',
            'address' => 'required|string',
        ]);

        try {
            $customer = Customer::create([
                'name'    => $validated['name'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
            ]);

            return response()->json([
                'success'  => true,
                'message'  => 'Pelanggan berhasil ditambahkan',
                'customer' => [
                    'id'      => $customer->id,
                    'name'    => $customer->name,
                    'phone'   => $customer->phone,
                    'address' => $customer->address,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan pelanggan',
                'errors'  => [],
            ], 500);
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Customer $customer)
    {
        return Inertia::render('Dashboard/Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Customer $customer)
    {
        /**
         * validate
         */
        $request->validate([
            'name'    => 'required',
            'phone' => 'required|unique:customers,phone,' . $customer->id,
            'address' => 'required',
        ]);

        //update customer
        $customer->update([
            'name'    => $request->name,
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        //redirect
        return to_route('customers.index');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //find customer by ID
        $customer = Customer::findOrFail($id);

        //delete customer
        $customer->delete();

        //redirect
        return back();
    }

    /**
     * Get customer purchase history
     *
     * @param  Customer $customer
     * @return \Illuminate\Http\JsonResponse
     */
    public function getHistory(Customer $customer)
    {
        // Get transaction statistics
        $stats = Transaction::where('customer_id', $customer->id)
            ->selectRaw('
                COUNT(*) as total_transactions,
                SUM(grand_total) as total_spent,
                MAX(created_at) as last_visit
            ')
            ->first();

        // Get recent transactions (last 5)
        $recentTransactions = Transaction::where('customer_id', $customer->id)
            ->select('id', 'invoice', 'grand_total', 'payment_method', 'created_at')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($t) => [
                'id'             => $t->id,
                'invoice'        => $t->invoice,
                'total'          => $t->grand_total,
                'payment_method' => $t->payment_method,
                'date'           => \Carbon\Carbon::parse($t->created_at)->format('d M Y H:i'),
            ]);

        // Get frequently purchased products
        $frequentProducts = Transaction::where('customer_id', $customer->id)
            ->join('transaction_details', 'transactions.id', '=', 'transaction_details.transaction_id')
            ->join('products', 'transaction_details.product_id', '=', 'products.id')
            ->selectRaw('products.id, products.title, SUM(transaction_details.qty) as total_qty')
            ->groupBy('products.id', 'products.title')
            ->orderByDesc('total_qty')
            ->limit(3)
            ->get();

        return response()->json([
            'success'             => true,
            'customer'            => [
                'id'    => $customer->id,
                'name'  => $customer->name,
                'phone' => $customer->phone,
            ],
            'stats'               => [
                'total_transactions' => (int) ($stats->total_transactions ?? 0),
                'total_spent'        => (int) ($stats->total_spent ?? 0),
                'last_visit'         => $stats->last_visit ? \Carbon\Carbon::parse($stats->last_visit)->format('d M Y') : null,
            ],
            'recent_transactions' => $recentTransactions,
            'frequent_products'   => $frequentProducts,
        ]);
    }

    /**
     * E1: Customer appointment portal - show customer's appointments and history
     */
    public function portal(Customer $customer)
    {
        // Get upcoming appointments (confirmed or pending, not completed/cancelled)
        $upcomingAppointments = \App\Models\Appointment::with(['services', 'staff', 'feedback'])
            ->where('customer_id', $customer->id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('appointment_date', '>=', now())
            ->orderBy('appointment_date', 'asc')
            ->get();

        // Get past appointments (completed or past date)
        $pastAppointments = \App\Models\Appointment::with(['services', 'staff', 'feedback'])
            ->where('customer_id', $customer->id)
            ->where(function ($query) {
                $query->where('status', 'completed')
                      ->orWhere('status', 'cancelled')
                      ->orWhere('appointment_date', '<', now());
            })
            ->orderBy('appointment_date', 'desc')
            ->limit(10)
            ->get();

        // Get appointment statistics
        $stats = \App\Models\Appointment::where('customer_id', $customer->id)
            ->selectRaw('
                COUNT(*) as total_appointments,
                SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) as cancelled_count
            ')
            ->first();

        // Get transaction statistics
        $transactionStats = Transaction::where('customer_id', $customer->id)
            ->selectRaw('
                COUNT(*) as total_transactions,
                SUM(grand_total) as total_spent,
                MAX(created_at) as last_visit
            ')
            ->first();

        // Get average feedback rating
        $avgRating = \App\Models\AppointmentFeedback::where('customer_id', $customer->id)
            ->avg('overall_rating');

        return Inertia::render('Dashboard/Customers/Portal', [
            'customer' => $customer,
            'upcomingAppointments' => $upcomingAppointments,
            'pastAppointments' => $pastAppointments,
            'stats' => [
                'total_appointments' => (int) ($stats->total_appointments ?? 0),
                'completed_appointments' => (int) ($stats->completed_count ?? 0),
                'cancelled_appointments' => (int) ($stats->cancelled_count ?? 0),
                'total_transactions' => (int) ($transactionStats->total_transactions ?? 0),
                'total_spent' => (int) ($transactionStats->total_spent ?? 0),
                'avg_rating' => $avgRating ? round($avgRating, 1) : null,
            ],
        ]);
    }
}
