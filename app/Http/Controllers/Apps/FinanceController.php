<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\GeneralLedgerEntry;
use App\Models\JournalEntry;
use App\Models\Invoice;
use App\Models\InvoicePayment;
use App\Models\ExpenseRecord;
use App\Models\BudgetAllocation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    /**
     * Finance Dashboard
     */
    public function dashboard()
    {
        $clientId = auth()->user()->client_id;
        $storeId = auth()->user()->default_store_id;

        // Financial Summary
        $summary = [
            'total_assets' => ChartOfAccount::where('client_id', $clientId)
                ->where('type', 'asset')
                ->sum('balance'),
            'total_liabilities' => ChartOfAccount::where('client_id', $clientId)
                ->where('type', 'liability')
                ->sum('balance'),
            'total_equity' => ChartOfAccount::where('client_id', $clientId)
                ->where('type', 'equity')
                ->sum('balance'),
            'monthly_revenue' => ChartOfAccount::where('client_id', $clientId)
                ->where('type', 'revenue')
                ->sum('balance'),
            'monthly_expenses' => ChartOfAccount::where('client_id', $clientId)
                ->where('type', 'expense')
                ->sum('balance'),
        ];

        // Pending Invoices
        $pendingInvoices = Invoice::where('client_id', $clientId)
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->count();

        // Overdue Invoices
        $overdueInvoices = Invoice::where('client_id', $clientId)
            ->where('due_date', '<', now())
            ->where('payment_status', '!=', 'paid')
            ->count();

        // Pending Expenses
        $pendingExpenses = ExpenseRecord::where('client_id', $clientId)
            ->where('is_approved', false)
            ->count();

        // Recent Transactions
        $recentTransactions = GeneralLedgerEntry::where('client_id', $clientId)
            ->with(['account'])
            ->orderBy('entry_date', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboard/Finance/Dashboard', [
            'title' => 'Finance Dashboard',
            'summary' => $summary,
            'pendingInvoices' => $pendingInvoices,
            'overdueInvoices' => $overdueInvoices,
            'pendingExpenses' => $pendingExpenses,
            'recentTransactions' => $recentTransactions,
        ]);
    }

    /**
     * General Ledger
     */
    public function generalLedger(Request $request)
    {
        $clientId = auth()->user()->client_id;

        $query = GeneralLedgerEntry::where('client_id', $clientId)
            ->with(['account', 'journalEntry']);

        // Filter by account
        if ($request->account_id) {
            $query->where('account_id', $request->account_id);
        }

        // Filter by date range
        if ($request->start_date && $request->end_date) {
            $query->whereBetween('entry_date', [$request->start_date, $request->end_date]);
        }

        $entries = $query->orderBy('entry_date', 'desc')
            ->paginate(20);

        $accounts = ChartOfAccount::where('client_id', $clientId)
            ->active()
            ->orderBy('code')
            ->get();

        return Inertia::render('Dashboard/Finance/GeneralLedger', [
            'title' => 'General Ledger',
            'entries' => $entries,
            'accounts' => $accounts,
            'filters' => $request->only(['account_id', 'start_date', 'end_date']),
        ]);
    }

    /**
     * Journal Entries
     */
    public function journalEntries(Request $request)
    {
        $clientId = auth()->user()->client_id;

        $query = JournalEntry::where('client_id', $clientId)
            ->with(['account', 'postedBy']);

        // Filter by status
        if ($request->status === 'posted') {
            $query->posted();
        } elseif ($request->status === 'unposted') {
            $query->unposted();
        }

        // Filter by date range
        if ($request->start_date && $request->end_date) {
            $query->whereBetween('entry_date', [$request->start_date, $request->end_date]);
        }

        $entries = $query->orderBy('entry_date', 'desc')
            ->paginate(20);

        $accounts = ChartOfAccount::where('client_id', $clientId)
            ->active()
            ->orderBy('code')
            ->get();

        return Inertia::render('Dashboard/Finance/JournalEntries', [
            'title' => 'Journal Entries',
            'entries' => $entries,
            'accounts' => $accounts,
            'filters' => $request->only(['status', 'start_date', 'end_date']),
        ]);
    }

    /**
     * Chart of Accounts
     */
    public function chartOfAccounts(Request $request)
    {
        $clientId = auth()->user()->client_id;

        $query = ChartOfAccount::where('client_id', $clientId)
            ->with(['parent', 'children']);

        // Filter by type
        if ($request->type) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $accounts = $query->orderBy('code')->get();

        // Group by type for better organization
        $accountsByType = $accounts->groupBy('type');

        return Inertia::render('Dashboard/Finance/ChartOfAccounts', [
            'title' => 'Chart of Accounts',
            'accounts' => $accounts,
            'accountsByType' => $accountsByType,
            'types' => ChartOfAccount::types(),
            'filters' => $request->only(['type', 'is_active']),
        ]);
    }

    /**
     * Invoices List
     */
    public function invoices(Request $request)
    {
        $clientId = auth()->user()->client_id;

        $query = Invoice::where('client_id', $clientId)
            ->with(['customer', 'items', 'payments']);

        // Filter by payment status
        if ($request->payment_status) {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by date range
        if ($request->start_date && $request->end_date) {
            $query->whereBetween('invoice_date', [$request->start_date, $request->end_date]);
        }

        // Filter by customer
        if ($request->customer_id) {
            $query->where('customer_id', $request->customer_id);
        }

        // Search by invoice number
        if ($request->search) {
            $query->where('invoice_number', 'like', '%' . $request->search . '%');
        }

        $invoices = $query->orderBy('invoice_date', 'desc')
            ->paginate(20);

        // Get statistics
        $stats = [
            'total_invoices' => Invoice::where('client_id', $clientId)->count(),
            'unpaid' => Invoice::where('client_id', $clientId)->where('payment_status', 'unpaid')->count(),
            'partial' => Invoice::where('client_id', $clientId)->where('payment_status', 'partial')->count(),
            'paid' => Invoice::where('client_id', $clientId)->where('payment_status', 'paid')->count(),
            'overdue' => Invoice::where('client_id', $clientId)
                ->where('due_date', '<', now())
                ->where('payment_status', '!=', 'paid')
                ->count(),
        ];

        return Inertia::render('Dashboard/Finance/Invoices/Index', [
            'title' => 'Invoices',
            'invoices' => $invoices,
            'stats' => $stats,
            'filters' => $request->only(['payment_status', 'start_date', 'end_date', 'customer_id', 'search']),
        ]);
    }

    /**
     * Create Invoice
     */
    public function createInvoice()
    {
        $clientId = auth()->user()->client_id;

        // Get customers for dropdown
        $customers = \App\Models\Customer::where('client_id', $clientId)
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'phone')
            ->orderBy('name')
            ->get();

        // Get products for line items
        $products = \App\Models\Product::where('client_id', $clientId)
            ->where('is_active', true)
            ->select('id', 'name', 'selling_price', 'sku')
            ->orderBy('name')
            ->get();

        // Get revenue accounts for mapping
        $revenueAccounts = ChartOfAccount::where('client_id', $clientId)
            ->where('type', 'revenue')
            ->active()
            ->orderBy('code')
            ->get();

        return Inertia::render('Dashboard/Finance/Invoices/Create', [
            'title' => 'Create Invoice',
            'customers' => $customers,
            'products' => $products,
            'revenueAccounts' => $revenueAccounts,
        ]);
    }

    /**
     * Recurring Invoices
     */
    public function recurringInvoices(Request $request)
    {
        $clientId = auth()->user()->client_id;

        $query = Invoice::where('client_id', $clientId)
            ->where('is_recurring', true)
            ->with(['customer', 'items']);

        // Filter by frequency
        if ($request->recurring_frequency) {
            $query->where('recurring_frequency', $request->recurring_frequency);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $recurringInvoices = $query->orderBy('next_invoice_date', 'asc')
            ->paginate(20);

        // Get invoices due for generation
        $dueForGeneration = Invoice::where('client_id', $clientId)
            ->where('is_recurring', true)
            ->where('is_active', true)
            ->where('next_invoice_date', '<=', now())
            ->count();

        return Inertia::render('Dashboard/Finance/Invoices/Recurring', [
            'title' => 'Recurring Invoices',
            'recurringInvoices' => $recurringInvoices,
            'dueForGeneration' => $dueForGeneration,
            'filters' => $request->only(['recurring_frequency', 'is_active']),
        ]);
    }

    /**
     * Payments List
     */
    public function payments(Request $request)
    {
        $clientId = auth()->user()->client_id;

        $query = InvoicePayment::whereHas('invoice', function ($q) use ($clientId) {
            $q->where('client_id', $clientId);
        })->with(['invoice.customer']);

        // Filter by payment method
        if ($request->payment_method) {
            $query->where('payment_method', $request->payment_method);
        }

        // Filter by date range
        if ($request->start_date && $request->end_date) {
            $query->whereBetween('payment_date', [$request->start_date, $request->end_date]);
        }

        // Search by transaction reference
        if ($request->search) {
            $query->where('transaction_reference', 'like', '%' . $request->search . '%');
        }

        $payments = $query->orderBy('payment_date', 'desc')
            ->paginate(20);

        // Get payment statistics
        $stats = [
            'total_received' => InvoicePayment::whereHas('invoice', function ($q) use ($clientId) {
                $q->where('client_id', $clientId);
            })->sum('amount'),
            'this_month' => InvoicePayment::whereHas('invoice', function ($q) use ($clientId) {
                $q->where('client_id', $clientId);
            })->whereMonth('payment_date', now()->month)
                ->whereYear('payment_date', now()->year)
                ->sum('amount'),
        ];

        return Inertia::render('Dashboard/Finance/Payments/Index', [
            'title' => 'Payments',
            'payments' => $payments,
            'stats' => $stats,
            'filters' => $request->only(['payment_method', 'start_date', 'end_date', 'search']),
        ]);
    }

    /**
     * Receive Payment
     */
    public function receivePayment()
    {
        $clientId = auth()->user()->client_id;

        // Get unpaid and partially paid invoices
        $unpaidInvoices = Invoice::where('client_id', $clientId)
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->with('customer')
            ->orderBy('invoice_date', 'desc')
            ->get();

        // Get customers with outstanding invoices
        $customers = \App\Models\Customer::where('client_id', $clientId)
            ->whereHas('invoices', function ($q) {
                $q->whereIn('payment_status', ['unpaid', 'partial']);
            })
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // Get bank accounts for deposit
        $bankAccounts = ChartOfAccount::where('client_id', $clientId)
            ->where('type', 'asset')
            ->where('name', 'like', '%Bank%')
            ->active()
            ->get();

        return Inertia::render('Dashboard/Finance/Payments/Receive', [
            'title' => 'Receive Payment',
            'unpaidInvoices' => $unpaidInvoices,
            'customers' => $customers,
            'bankAccounts' => $bankAccounts,
        ]);
    }

    /**
     * Payment Methods
     */
    public function paymentMethods()
    {
        $clientId = auth()->user()->client_id;

        // Get payment settings
        $paymentSettings = \App\Models\PaymentSetting::where('client_id', $clientId)->first();

        // Get available payment methods from settings
        $paymentMethods = [
            'cash' => ['name' => 'Cash', 'enabled' => true],
            'bank_transfer' => ['name' => 'Bank Transfer', 'enabled' => true],
            'credit_card' => ['name' => 'Credit Card', 'enabled' => true],
            'debit_card' => ['name' => 'Debit Card', 'enabled' => true],
            'midtrans' => [
                'name' => 'Midtrans',
                'enabled' => $paymentSettings && $paymentSettings->midtrans_server_key ? true : false
            ],
            'xendit' => [
                'name' => 'Xendit',
                'enabled' => $paymentSettings && $paymentSettings->xendit_api_key ? true : false
            ],
        ];

        return Inertia::render('Dashboard/Finance/Payments/Methods', [
            'title' => 'Payment Methods',
            'paymentMethods' => $paymentMethods,
            'paymentSettings' => $paymentSettings,
        ]);
    }

    /**
     * Bank Accounts
     */
    public function bankAccounts(Request $request)
    {
        $clientId = auth()->user()->client_id;

        // Get bank accounts from chart of accounts
        $query = ChartOfAccount::where('client_id', $clientId)
            ->where('type', 'asset')
            ->where(function ($q) {
                $q->where('name', 'like', '%Bank%')
                    ->orWhere('code', '1120');
            });

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $bankAccounts = $query->orderBy('code')->get();

        // Calculate total balance
        $totalBalance = $bankAccounts->sum('balance');

        // Get recent bank transactions
        $recentTransactions = GeneralLedgerEntry::where('client_id', $clientId)
            ->whereIn('account_id', $bankAccounts->pluck('id'))
            ->with(['account', 'journalEntry'])
            ->orderBy('entry_date', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboard/Finance/Banking/Accounts', [
            'title' => 'Bank Accounts',
            'bankAccounts' => $bankAccounts,
            'totalBalance' => $totalBalance,
            'recentTransactions' => $recentTransactions,
            'filters' => $request->only(['is_active']),
        ]);
    }

    /**
     * Bank Reconciliation
     */
    public function reconciliation(Request $request)
    {
        $clientId = auth()->user()->client_id;

        // Get bank accounts for selection
        $bankAccounts = ChartOfAccount::where('client_id', $clientId)
            ->where('type', 'asset')
            ->where(function ($q) {
                $q->where('name', 'like', '%Bank%')
                    ->orWhere('code', '1120');
            })
            ->active()
            ->orderBy('code')
            ->get();

        $transactions = collect();
        $reconciliationData = null;

        if ($request->account_id && $request->start_date && $request->end_date) {
            // Get unreconciled transactions for the selected account
            $transactions = GeneralLedgerEntry::where('client_id', $clientId)
                ->where('account_id', $request->account_id)
                ->whereBetween('entry_date', [$request->start_date, $request->end_date])
                ->with(['account', 'journalEntry'])
                ->orderBy('entry_date', 'asc')
                ->get();

            $account = ChartOfAccount::find($request->account_id);

            // Calculate reconciliation summary
            $reconciliationData = [
                'opening_balance' => $account->balance,
                'total_debits' => $transactions->where('type', 'debit')->sum('amount'),
                'total_credits' => $transactions->where('type', 'credit')->sum('amount'),
                'closing_balance' => $account->balance +
                    $transactions->where('type', 'debit')->sum('amount') -
                    $transactions->where('type', 'credit')->sum('amount'),
            ];
        }

        return Inertia::render('Dashboard/Finance/Banking/Reconciliation', [
            'title' => 'Bank Reconciliation',
            'bankAccounts' => $bankAccounts,
            'transactions' => $transactions,
            'reconciliationData' => $reconciliationData,
            'filters' => $request->only(['account_id', 'start_date', 'end_date']),
        ]);
    }

    /**
     * Expenses
     */
    public function expenses(Request $request)
    {
        $clientId = auth()->user()->client_id;

        $query = ExpenseRecord::where('client_id', $clientId)
            ->with(['category', 'createdBy', 'approvedBy']);

        // Filter by category
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by approval status
        if ($request->has('is_approved')) {
            $query->where('is_approved', $request->is_approved);
        }

        // Filter by date range
        if ($request->start_date && $request->end_date) {
            $query->whereBetween('expense_date', [$request->start_date, $request->end_date]);
        }

        // Search by vendor or description
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('vendor_name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhere('expense_number', 'like', '%' . $request->search . '%');
            });
        }

        $expenses = $query->orderBy('expense_date', 'desc')
            ->paginate(20);

        // Get expense categories
        $categories = \App\Models\ExpenseCategory::where('client_id', $clientId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Get expense statistics
        $stats = [
            'total_expenses' => ExpenseRecord::where('client_id', $clientId)->sum('amount'),
            'pending_approval' => ExpenseRecord::where('client_id', $clientId)
                ->where('is_approved', false)
                ->count(),
            'this_month' => ExpenseRecord::where('client_id', $clientId)
                ->whereMonth('expense_date', now()->month)
                ->whereYear('expense_date', now()->year)
                ->sum('amount'),
            'approved_amount' => ExpenseRecord::where('client_id', $clientId)
                ->where('is_approved', true)
                ->sum('amount'),
        ];

        return Inertia::render('Dashboard/Finance/Expenses', [
            'title' => 'Expenses',
            'expenses' => $expenses,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['category_id', 'is_approved', 'start_date', 'end_date', 'search']),
        ]);
    }

    /**
     * Budgets
     */
    public function budgets(Request $request)
    {
        $clientId = auth()->user()->client_id;

        $query = BudgetAllocation::where('client_id', $clientId)
            ->with(['category', 'store']);

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by period
        if ($request->period_year) {
            $query->whereYear('period_start', $request->period_year);
        }

        $budgets = $query->orderBy('period_start', 'desc')
            ->paginate(20);

        // Get expense categories for dropdown
        $categories = \App\Models\ExpenseCategory::where('client_id', $clientId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Get budget statistics
        $stats = [
            'total_allocated' => BudgetAllocation::where('client_id', $clientId)
                ->where('status', 'active')
                ->sum('total_budget'),
            'total_spent' => BudgetAllocation::where('client_id', $clientId)
                ->where('status', 'active')
                ->sum('spent_amount'),
            'active_budgets' => BudgetAllocation::where('client_id', $clientId)
                ->where('status', 'active')
                ->count(),
            'exceeded_budgets' => BudgetAllocation::where('client_id', $clientId)
                ->where('status', 'exceeded')
                ->count(),
        ];

        // Calculate average utilization
        $activeBudgets = BudgetAllocation::where('client_id', $clientId)
            ->where('status', 'active')
            ->get();

        $stats['avg_utilization'] = $activeBudgets->count() > 0
            ? $activeBudgets->avg('utilization_percentage')
            : 0;

        return Inertia::render('Dashboard/Finance/Budgets', [
            'title' => 'Budgets',
            'budgets' => $budgets,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['status', 'category_id', 'period_year']),
        ]);
    }
}
