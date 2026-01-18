<?php
namespace App\Http\Controllers\Apps;

use App\Exceptions\PaymentGatewayException;
use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Customer;
use App\Models\PaymentSetting;
use App\Models\Product;
use App\Models\Transaction;
use App\Services\Payments\PaymentGatewayManager;
use App\Services\WhatsApp\WhatsAppService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TransactionController extends Controller
{
    /**
     * index
     *
     * @return void
     */
    public function index(Request $request)
    {
        $userId = auth()->user()->id;

        // Check if coming from appointment or resumed hold
        $fromAppointment = $request->boolean('from_appointment');
        $fromHold = $request->boolean('from_hold');
        $appointmentId = $request->input('appointment_id');
        $appointment = null;

        // Load appointment data if coming from appointment (but not from hold resume)
        if ($fromAppointment && $appointmentId && !$fromHold) {
            $appointment = \App\Models\Appointment::with(['customer', 'appointmentServices.service', 'staff', 'transaction'])
                ->find($appointmentId);

            // B1: Prevent duplicate conversion - check if appointment already has a transaction
            if ($appointment && $appointment->transaction) {
                return redirect()->route('appointments.show', $appointment->id)
                    ->with('error', 'This appointment has already been converted to a transaction.');
            }

            // Auto-add appointment services to cart if not already added
            if ($appointment && $appointment->appointmentServices->count() > 0) {
                foreach ($appointment->appointmentServices as $appointmentService) {
                    // Check if service already in cart
                    $existingCart = Cart::where('cashier_id', $userId)
                        ->where('service_id', $appointmentService->service_id)
                        ->whereNull('hold_id')
                        ->first();

                    if (!$existingCart) {
                        Cart::create([
                            'cashier_id' => $userId,
                            'appointment_id' => $appointment->id,
                            'customer_id' => $appointment->customer_id,
                            'service_id' => $appointmentService->service_id,
                            'staff_id' => $appointmentService->staff_id,
                            'qty' => 1,
                            'price' => $appointmentService->price,
                            'duration' => $appointmentService->duration,
                        ]);
                    }
                }
            }
        } elseif ($fromHold && $appointmentId) {
            // Just load appointment info for display (cart already exists from hold)
            $appointment = \App\Models\Appointment::with(['customer', 'appointmentServices.service', 'staff'])
                ->find($appointmentId);
        }

        // Get active cart items (not held) - OPTIMIZED: only select needed columns
        $carts = Cart::with([
                'product:id,title,sell_price,image,stock',
                'service:id,name,price,duration',
                'staff:id,name'
            ])
            ->select('id', 'cashier_id', 'appointment_id', 'customer_id', 'product_id', 'service_id', 'staff_id', 'qty', 'price', 'duration', 'created_at', 'updated_at')
            ->where('cashier_id', $userId)
            ->whereNull('hold_id') // Direct where instead of scope for better performance
            ->latest()
            ->get();

        // Get held carts grouped by hold_id - OPTIMIZED: select only needed data
        $heldCarts = Cart::with('product:id,title,sell_price,image')
            ->select('id', 'cashier_id', 'appointment_id', 'customer_id', 'product_id', 'service_id', 'qty', 'price', 'hold_id', 'hold_label', 'held_at')
            ->where('cashier_id', $userId)
            ->whereNotNull('hold_id')
            ->get()
            ->groupBy('hold_id')
            ->map(function ($items, $holdId) {
                $first = $items->first();
                return [
                    'hold_id'     => $holdId,
                    'label'       => $first->hold_label,
                    'held_at'     => $first->held_at?->toISOString(),
                    'appointment_id' => $first->appointment_id,
                    'customer_id' => $first->customer_id,
                    'items_count' => $items->sum('qty'),
                    'total'       => $items->sum('price'),
                ];
            })
            ->values();

        // OPTIMIZED: get only necessary customer fields
        $customers = Customer::select('id', 'name', 'phone')
            ->latest()
            ->get();

        // OPTIMIZED: get all products with categories - only in-stock items
        $products = Product::with('category:id,name')
            ->select('id', 'barcode', 'title', 'description', 'image', 'sell_price', 'stock', 'category_id')
            ->where('stock', '>', 0)
            ->orderBy('title')
            ->get();

        // OPTIMIZED: get all categories - minimal data
        $categories = \App\Models\Category::select('id', 'name', 'image')
            ->orderBy('name')
            ->get();

        // OPTIMIZED: get all services - only active and necessary fields
        $services = \App\Models\Service::select('id', 'name', 'price', 'duration', 'category_id', 'requires_staff')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // OPTIMIZED: get all staff - only active and necessary fields
        $staff = \App\Models\Staff::select('id', 'name', 'is_active')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // get business type from settings
        $businessType = \App\Models\BusinessSetting::first()?->business_type ?? 'retail';

        $paymentSetting = PaymentSetting::first();

        $carts_total = 0;
        foreach ($carts as $cart) {
            $carts_total += $cart['price'] ?? 0;
        }

        $defaultGateway = $paymentSetting?->default_gateway ?? 'cash';
        if (
            $defaultGateway !== 'cash'
            && (! $paymentSetting || ! $paymentSetting->isGatewayReady($defaultGateway))
        ) {
            $defaultGateway = 'cash';
        }

        return Inertia::render('Dashboard/Transactions/Index', [
            'carts'                 => $carts,
            'carts_total'           => $carts_total,
            'heldCarts'             => $heldCarts,
            'customers'             => $customers,
            'products'              => $products,
            'categories'            => $categories,
            'services'              => $services,
            'staff'                 => $staff,
            'businessType'          => $businessType,
            'paymentGateways'       => $paymentSetting?->enabledGateways() ?? [],
            'defaultPaymentGateway' => $defaultGateway,
            'appointment'           => $appointment,
            'fromAppointment'       => $fromAppointment,
            'preselectedCustomerId' => $request->input('customer_id'),
            'appointmentDeposit'    => $appointment?->deposit ?? 0, // B3: Pass deposit for calculation
        ]);
    }

    /**
     * searchProduct
     *
     * @param  mixed $request
     * @return void
     */
    public function searchProduct(Request $request)
    {
        //find product by barcode
        $product = Product::where('barcode', $request->barcode)->first();

        if ($product) {
            return response()->json([
                'success' => true,
                'data'    => $product,
            ]);
        }

        return response()->json([
            'success' => false,
            'data'    => null,
        ]);
    }

    /**
     * addToCart
     *
     * @param  mixed $request
     * @return void
     */
    public function addToCart(Request $request)
    {
        // OPTIMIZED: Cari produk hanya dengan field yang diperlukan
        $product = Product::select('id', 'title', 'sell_price', 'stock')
            ->where('id', $request->product_id)
            ->first();

        // Jika produk tidak ditemukan, redirect dengan pesan error
        if (! $product) {
            return redirect()->back()->with('error', 'Product not found.');
        }

        // Cek stok produk
        if ($product->stock < $request->qty) {
            return redirect()->back()->with('error', 'Out of Stock Product!.');
        }

        $userId = auth()->user()->id;

        // OPTIMIZED: Cek keranjang tanpa eager loading
        $cart = Cart::select('id', 'product_id', 'qty', 'price')
            ->where('product_id', $request->product_id)
            ->where('cashier_id', $userId)
            ->whereNull('hold_id') // Only check active cart
            ->first();

        if ($cart) {
            // OPTIMIZED: Update langsung dengan DB query, lebih cepat
            $newQty = $cart->qty + $request->qty;
            $newPrice = $product->sell_price * $newQty;

            $cart->update([
                'qty' => $newQty,
                'price' => $newPrice
            ]);
        } else {
            // Insert ke keranjang
            Cart::create([
                'cashier_id' => $userId,
                'product_id' => $request->product_id,
                'qty'        => $request->qty,
                'price'      => $product->sell_price * $request->qty,
            ]);
        }

        return redirect()->route('transactions.index')->with('success', 'Product Added Successfully!.');
    }

    /**
     * addServiceToCart
     *
     * @param  mixed $request
     * @return void
     */
    public function addServiceToCart(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'staff_id'   => 'nullable|exists:staff,id',
            'qty'        => 'required|integer|min:1',
        ]);

        // OPTIMIZED: Hanya ambil field yang diperlukan (B4: added requires_staff)
        $service = \App\Models\Service::select('id', 'name', 'price', 'duration', 'requires_staff')
            ->findOrFail($validated['service_id']);

        // B4: Validate staff assignment for services that require staff
        if ($service->requires_staff && empty($validated['staff_id'])) {
            return redirect()->back()->with('error', 'This service requires staff assignment.');
        }

        $userId = auth()->user()->id;

        // OPTIMIZED: Check if service already in cart with same staff
        $existingCart = Cart::select('id', 'service_id', 'staff_id', 'qty', 'price', 'duration')
            ->where('cashier_id', $userId)
            ->where('service_id', $service->id)
            ->where('staff_id', $validated['staff_id'])
            ->whereNull('hold_id')
            ->first();

        if ($existingCart) {
            // OPTIMIZED: Update langsung dengan hitungan baru
            $newQty = $existingCart->qty + $validated['qty'];
            $existingCart->update([
                'qty'      => $newQty,
                'duration' => $service->duration * $newQty,
                'price'    => $service->price * $newQty,
            ]);
        } else {
            // Create new cart item for service
            Cart::create([
                'cashier_id' => $userId,
                'service_id' => $service->id,
                'staff_id'   => $validated['staff_id'],
                'price'      => $service->price * $validated['qty'],
                'qty'        => $validated['qty'],
                'duration'   => $service->duration * $validated['qty'],
            ]);
        }

        return redirect()->route('transactions.index')->with('success', 'Service Added Successfully!.');
    }

    /**
     * destroyCart
     *
     * @param  mixed $request
     * @return void
     */
    public function destroyCart($cart_id)
    {
        // OPTIMIZED: Tidak perlu load relasi hanya untuk delete
        $deleted = Cart::where('id', $cart_id)
            ->where('cashier_id', auth()->user()->id)
            ->delete();

        if ($deleted) {
            return back();
        } else {
            // Handle case where no cart is found (e.g., redirect with error message)
            return back()->withErrors(['message' => 'Cart not found']);
        }
    }

    /**
     * updateCart - Update cart item quantity
     *
     * @param  mixed $request
     * @param  int $cart_id
     * @return void
     */
    public function updateCart(Request $request, $cart_id)
    {
        $request->validate([
            'qty' => 'required|integer|min:1',
        ]);

        $userId = auth()->user()->id;

        // OPTIMIZED: Load cart dengan field minimal
        $cart = Cart::select('id', 'cashier_id', 'product_id', 'service_id', 'qty', 'price', 'duration')
            ->where('id', $cart_id)
            ->where('cashier_id', $userId)
            ->first();

        if (! $cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found',
            ], 404);
        }

        // Determine if this is a product or service
        $isService = !empty($cart->service_id);

        if ($isService) {
            // OPTIMIZED: Load service hanya jika service
            $service = \App\Models\Service::select('id', 'price', 'duration')
                ->find($cart->service_id);

            if (!$service) {
                return response()->json([
                    'success' => false,
                    'message' => 'Service not found',
                ], 404);
            }

            // For services, just update quantity and recalculate price
            $cart->update([
                'qty'      => $request->qty,
                'price'    => $service->price * $request->qty,
                'duration' => $service->duration * $request->qty,
            ]);
        } else {
            // OPTIMIZED: Load product hanya jika product
            $product = Product::select('id', 'sell_price', 'stock')
                ->find($cart->product_id);

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found',
                ], 404);
            }

            // For products, check stock availability
            if ($product->stock < $request->qty) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stok tidak mencukupi. Tersedia: ' . $product->stock,
                ], 422);
            }

            // Update quantity and price
            $cart->update([
                'qty'   => $request->qty,
                'price' => $product->sell_price * $request->qty,
            ]);
        }

        return back()->with('success', 'Quantity updated successfully');
    }

    /**
     * holdCart - Hold current cart items for later
     *
     * @param  Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function holdCart(Request $request)
    {
        $request->validate([
            'label' => 'nullable|string|max:50',
        ]);

        $userId = auth()->user()->id;

        // Get active cart items
        $activeCarts = Cart::where('cashier_id', $userId)
            ->active()
            ->get();

        if ($activeCarts->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Keranjang kosong, tidak ada yang bisa ditahan',
            ], 422);
        }

        // Generate unique hold ID
        $holdId = 'HOLD-' . strtoupper(uniqid());
        $label  = $request->label ?: 'Transaksi ' . now()->format('H:i');

        // Mark all active cart items as held
        Cart::where('cashier_id', $userId)
            ->active()
            ->update([
                'hold_id'    => $holdId,
                'hold_label' => $label,
                'held_at'    => now(),
            ]);

        return back()->with('success', 'Transaksi ditahan: ' . $label);
    }

    /**
     * resumeCart - Resume a held cart
     *
     * @param  string $holdId
     * @return \Illuminate\Http\JsonResponse
     */
    public function resumeCart($holdId)
    {
        $userId = auth()->user()->id;

        // Check if there are any active carts (not held)
        $activeCarts = Cart::where('cashier_id', $userId)
            ->active()
            ->count();

        if ($activeCarts > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Selesaikan atau tahan transaksi aktif terlebih dahulu',
            ], 422);
        }

        // Get held carts
        $heldCarts = Cart::where('cashier_id', $userId)
            ->forHold($holdId)
            ->get();

        if ($heldCarts->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi ditahan tidak ditemukan',
            ], 404);
        }

        // Get appointment and customer info before resuming
        $firstCart = Cart::where('cashier_id', $userId)
            ->forHold($holdId)
            ->first();

        $appointmentId = $firstCart->appointment_id;
        $customerId = $firstCart->customer_id;

        // Resume by clearing hold info
        Cart::where('cashier_id', $userId)
            ->forHold($holdId)
            ->update([
                'hold_id'    => null,
                'hold_label' => null,
                'held_at'    => null,
            ]);

        // Redirect with appointment and customer context
        return redirect()->route('transactions.index', [
            'appointment_id' => $appointmentId,
            'customer_id' => $customerId,
            'from_hold' => true,
        ])->with('success', 'Transaksi dilanjutkan');
    }

    /**
     * clearHold - Delete a held cart
     *
     * @param  string $holdId
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearHold($holdId)
    {
        $userId = auth()->user()->id;

        $deleted = Cart::where('cashier_id', $userId)
            ->forHold($holdId)
            ->delete();

        if ($deleted === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi ditahan tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Transaksi ditahan berhasil dihapus',
        ]);
    }

    /**
     * getHeldCarts - Get all held carts for current user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getHeldCarts()
    {
        $userId = auth()->user()->id;

        $heldCarts = Cart::with('product:id,title,sell_price,image')
            ->where('cashier_id', $userId)
            ->held()
            ->get()
            ->groupBy('hold_id')
            ->map(function ($items, $holdId) {
                $first = $items->first();
                return [
                    'hold_id'     => $holdId,
                    'label'       => $first->hold_label,
                    'held_at'     => $first->held_at,
                    'items_count' => $items->sum('qty'),
                    'total'       => $items->sum('price'),
                    'items'       => $items->map(fn($item) => [
                        'id'      => $item->id,
                        'product' => $item->product,
                        'qty'     => $item->qty,
                        'price'   => $item->price,
                    ]),
                ];
            })
            ->values();

        return response()->json([
            'success'    => true,
            'held_carts' => $heldCarts,
        ]);
    }

    /**
     * store
     *
     * @param  mixed $request
     * @return void
     */
    public function store(Request $request, PaymentGatewayManager $paymentGatewayManager)
    {
        $paymentGateway = $request->input('payment_gateway');
        if ($paymentGateway) {
            $paymentGateway = strtolower($paymentGateway);
        }
        $paymentSetting = null;

        if ($paymentGateway) {
            $paymentSetting = PaymentSetting::first();

            if (! $paymentSetting || ! $paymentSetting->isGatewayReady($paymentGateway)) {
                return redirect()
                    ->route('transactions.index')
                    ->with('error', 'Gateway pembayaran belum dikonfigurasi.');
            }
        }

        $length = 10;
        $random = '';
        for ($i = 0; $i < $length; $i++) {
            $random .= rand(0, 1) ? rand(0, 9) : chr(rand(ord('a'), ord('z')));
        }

        $invoice       = 'TRX-' . Str::upper($random);
        $isCashPayment = empty($paymentGateway);
        $cashAmount    = $isCashPayment ? $request->cash : $request->grand_total;
        $changeAmount  = $isCashPayment ? $request->change : 0;

        // Get store and merchant for multi-tenant support
        $user = auth()->user();
        $storeId = $user->default_store_id;
        $merchantId = null;

        if ($storeId && !$isCashPayment) {
            $store = \App\Models\Store::find($storeId);
            if ($store) {
                $merchant = $store->getDefaultMerchant();
                $merchantId = $merchant?->id;
            }
        }

        $transaction = DB::transaction(function () use (
            $request,
            $invoice,
            $cashAmount,
            $changeAmount,
            $paymentGateway,
            $isCashPayment,
            $storeId,
            $merchantId
        ) {
            $transaction = Transaction::create([
                'cashier_id'     => auth()->user()->id,
                'customer_id'    => $request->customer_id,
                'appointment_id' => $request->appointment_id,
                'store_id'       => $storeId,
                'merchant_id'    => $merchantId,
                'invoice'        => $invoice,
                'cash'           => $cashAmount,
                'change'         => $changeAmount,
                'discount'       => $request->discount,
                'grand_total'    => $request->grand_total,
                'payment_method' => $paymentGateway ?: 'cash',
                'payment_status' => $isCashPayment ? 'paid' : 'pending',
            ]);

            $carts = Cart::with(['product', 'service', 'staff'])->where('cashier_id', auth()->user()->id)->get();

            foreach ($carts as $cart) {
                // Create transaction detail (supports both product and service)
                $transaction->details()->create([
                    'transaction_id' => $transaction->id,
                    'product_id'     => $cart->product_id,
                    'service_id'     => $cart->service_id,
                    'staff_id'       => $cart->staff_id,
                    'qty'            => $cart->qty,
                    'price'          => $cart->price,
                    'duration'       => $cart->duration,
                ]);

                // Calculate profit (only for products, services don't have buy_price)
                if ($cart->product_id) {
                    $total_buy_price  = $cart->product->buy_price * $cart->qty;
                    $total_sell_price = $cart->product->sell_price * $cart->qty;
                    $profits          = $total_sell_price - $total_buy_price;

                    $transaction->profits()->create([
                        'transaction_id' => $transaction->id,
                        'total'          => $profits,
                    ]);

                    // Update product stock
                    $product        = Product::find($cart->product_id);
                    $product->stock = $product->stock - $cart->qty;
                    $product->save();
                } elseif ($cart->service_id) {
                    // For services, we can calculate profit as full price (no buy cost)
                    // Or skip profit calculation for services if not applicable
                    $transaction->profits()->create([
                        'transaction_id' => $transaction->id,
                        'total'          => $cart->price, // Full service price as profit
                    ]);
                }
            }

            Cart::where('cashier_id', auth()->user()->id)->delete();

            // Update appointment status to completed if transaction is from appointment
            if ($transaction->appointment_id) {
                $appointment = \App\Models\Appointment::find($transaction->appointment_id);
                if ($appointment && $appointment->status === 'in_progress') {
                    $appointment->update([
                        'status' => 'completed',
                        'completed_at' => now(),
                        'payment_status' => 'paid', // B3: Mark payment as paid after transaction
                    ]);
                }
            }

            return $transaction->fresh(['customer', 'details.product', 'details.service', 'details.staff', 'cashier']);
        });

        if ($paymentGateway) {
            try {
                // Use merchant-specific payment if available (multi-tenant)
                if ($merchantId) {
                    $merchant = \App\Models\PaymentMerchant::find($merchantId);
                    if ($merchant) {
                        $paymentResponse = $paymentGatewayManager->createPaymentWithMerchant($transaction, $paymentGateway, $merchant);
                    } else {
                        // Fallback to global setting
                        $paymentResponse = $paymentGatewayManager->createPayment($transaction, $paymentGateway, $paymentSetting);
                    }
                } else {
                    // Use global PaymentSetting (backward compatibility)
                    $paymentResponse = $paymentGatewayManager->createPayment($transaction, $paymentGateway, $paymentSetting);
                }

                $transaction->update([
                    'payment_reference' => $paymentResponse['reference'] ?? null,
                    'payment_url'       => $paymentResponse['payment_url'] ?? null,
                ]);
            } catch (PaymentGatewayException $exception) {
                return redirect()
                    ->route('transactions.print', $transaction->invoice)
                    ->with('error', $exception->getMessage());
            }
        }

        // Send WhatsApp notification with invoice link
        try {
            $whatsappService = app(WhatsAppService::class);
            $whatsappService->sendReceipt($transaction);
        } catch (\Exception $e) {
            // Log error but don't fail the transaction
            \Log::error('WhatsApp receipt send failed', [
                'invoice' => $transaction->invoice,
                'error' => $e->getMessage()
            ]);
        }

        // Send Email receipt
        try {
            $emailService = app(\App\Services\Email\EmailService::class);
            $emailService->sendReceipt($transaction);
        } catch (\Exception $e) {
            // Log error but don't fail the transaction
            \Log::error('Email receipt send failed', [
                'invoice' => $transaction->invoice,
                'error' => $e->getMessage()
            ]);
        }

        // F2: Send SMS receipt
        try {
            $smsService = app(\App\Services\SMS\SMSService::class);
            $smsService->sendReceipt($transaction);
        } catch (\Exception $e) {
            // Log error but don't fail the transaction
            \Log::error('SMS receipt send failed', [
                'invoice' => $transaction->invoice,
                'error' => $e->getMessage()
            ]);
        }

        return to_route('transactions.print', $transaction->invoice);
    }

    public function print($invoice)
    {
        //get transaction
        $transaction = Transaction::with([
            'details.product',
            'details.service',
            'details.staff',
            'cashier',
            'customer',
            'appointment'
        ])->where('invoice', $invoice)->firstOrFail();

        return Inertia::render('Dashboard/Transactions/Print', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Download transaction invoice as PDF
     */
    public function downloadPDF($invoice)
    {
        // Get transaction with all relationships
        $transaction = Transaction::with([
            'details.product',
            'details.service',
            'details.staff',
            'cashier',
            'customer'
        ])->where('invoice', $invoice)->firstOrFail();

        // Generate PDF
        $pdf = Pdf::loadView('invoice.pdf', compact('transaction'));

        // Set PDF options
        $pdf->setPaper('a4', 'portrait');

        // Download PDF
        return $pdf->download("invoice-{$transaction->invoice}.pdf");
    }

    /**
     * Display transaction history.
     */
    public function history(Request $request)
    {
        $filters = [
            'invoice'    => $request->input('invoice'),
            'start_date' => $request->input('start_date'),
            'end_date'   => $request->input('end_date'),
        ];

        $query = Transaction::query()
            ->with(['cashier:id,name', 'customer:id,name'])
            ->withSum('details as total_items', 'qty')
            ->withSum('profits as total_profit', 'total')
            ->orderByDesc('created_at');

        if (! $request->user()->isSuperAdmin()) {
            $query->where('cashier_id', $request->user()->id);
        }

        $query
            ->when($filters['invoice'], function (Builder $builder, $invoice) {
                $builder->where('invoice', 'like', '%' . $invoice . '%');
            })
            ->when($filters['start_date'], function (Builder $builder, $date) {
                $builder->whereDate('created_at', '>=', $date);
            })
            ->when($filters['end_date'], function (Builder $builder, $date) {
                $builder->whereDate('created_at', '<=', $date);
            });

        $transactions = $query->paginate(10)->withQueryString();

        return Inertia::render('Dashboard/Transactions/History', [
            'transactions' => $transactions,
            'filters'      => $filters,
        ]);
    }
}
