<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Service;
use App\Models\Customer;
use App\Models\Staff;
use App\Models\Transaction;
use App\Models\Appointment;
use App\Services\WhatsApp\WhatsAppService;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    protected $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    /**
     * Sync products for offline use
     */
    public function products(Request $request)
    {
        $query = Product::with('category');

        if ($request->since) {
            $query->where('updated_at', '>', $request->since);
        }

        $products = $query->get();

        return response()->json([
            'success' => true,
            'products' => $products,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Sync services for offline use
     */
    public function services(Request $request)
    {
        $query = Service::with('category')
            ->where('is_active', true);

        if ($request->since) {
            $query->where('updated_at', '>', $request->since);
        }

        $services = $query->get();

        return response()->json([
            'success' => true,
            'services' => $services,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Sync customers for offline use
     */
    public function customers(Request $request)
    {
        $query = Customer::query();

        if ($request->since) {
            $query->where('updated_at', '>', $request->since);
        }

        $customers = $query->get();

        return response()->json([
            'success' => true,
            'customers' => $customers,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Sync staff for offline use
     */
    public function staff(Request $request)
    {
        $query = Staff::where('is_active', true);

        if ($request->since) {
            $query->where('updated_at', '>', $request->since);
        }

        $staff = $query->get();

        return response()->json([
            'success' => true,
            'staff' => $staff,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Sync offline transaction to server
     */
    public function syncTransaction(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'products' => 'required|array',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.qty' => 'required|integer|min:1',
            'products.*.price' => 'required|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'cash' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,midtrans,xendit',
            'offline_created_at' => 'required|date',
        ]);

        // Calculate totals
        $subtotal = collect($validated['products'])->sum(fn($item) => $item['price'] * $item['qty']);
        $discount = $validated['discount'] ?? 0;
        $grandTotal = $subtotal - $discount;
        $change = $validated['cash'] - $grandTotal;

        // Create transaction
        $transaction = Transaction::create([
            'cashier_id' => auth()->id(),
            'customer_id' => $validated['customer_id'],
            'invoice' => 'TRX-' . strtoupper(uniqid()),
            'cash' => $validated['cash'],
            'change' => $change,
            'discount' => $discount,
            'grand_total' => $grandTotal,
            'payment_method' => $validated['payment_method'],
            'payment_status' => $validated['payment_method'] === 'cash' ? 'paid' : 'pending',
            'created_at' => $validated['offline_created_at'],
        ]);

        // Create transaction details
        foreach ($validated['products'] as $item) {
            $transaction->details()->create([
                'product_id' => $item['product_id'],
                'qty' => $item['qty'],
                'price' => $item['price'],
            ]);

            // Update stock
            $product = Product::find($item['product_id']);
            $product->decrement('stock', $item['qty']);

            // Calculate profit
            $profit = ($item['price'] - $product->buy_price) * $item['qty'];
            $transaction->profits()->create([
                'total' => $profit,
            ]);
        }

        // Send WhatsApp receipt if enabled
        if ($this->whatsappService->isEnabled() && $transaction->customer) {
            $this->whatsappService->sendReceipt($transaction->load(['customer', 'details.product', 'cashier']));
        }

        return response()->json([
            'success' => true,
            'transaction' => $transaction->load('details'),
        ]);
    }

    /**
     * Sync offline appointment to server
     */
    public function syncAppointment(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'staff_id' => 'nullable|exists:staff,id',
            'appointment_date' => 'required|date',
            'services' => 'required|array|min:1',
            'services.*.id' => 'required|exists:services,id',
            'services.*.staff_id' => 'nullable|exists:staff,id',
            'notes' => 'nullable|string',
            'deposit' => 'nullable|numeric|min:0',
            'offline_created_at' => 'required|date',
        ]);

        // Calculate total
        $services = Service::whereIn('id', collect($validated['services'])->pluck('id'))->get();
        $totalPrice = $services->sum('price');
        $totalDuration = $services->sum('duration');

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
            'created_at' => $validated['offline_created_at'],
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

        // Send WhatsApp confirmation
        if ($this->whatsappService->isEnabled()) {
            $result = $this->whatsappService->sendAppointmentConfirmation($appointment->load(['customer', 'staff', 'services']));

            if ($result['success']) {
                $appointment->update([
                    'whatsapp_sent' => true,
                    'whatsapp_sent_at' => now(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'appointment' => $appointment->load('services'),
        ]);
    }
}
