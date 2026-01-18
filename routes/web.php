<?php

use App\Http\Controllers\Apps\AppointmentController;
use App\Http\Controllers\Apps\AppointmentAnalyticsController;
use App\Http\Controllers\Apps\AppointmentFeedbackController;
use App\Http\Controllers\Apps\BackupController;
use App\Http\Controllers\Apps\CategoryController;
use App\Http\Controllers\Apps\CustomerController;
use App\Http\Controllers\Apps\LicenseController;
use App\Http\Controllers\Apps\StoreSwitcherController;
use App\Http\Controllers\Apps\StoreController;
use App\Http\Controllers\Apps\DashboardWidgetController;
use App\Http\Controllers\Apps\NotificationSettingController;
use App\Http\Controllers\Apps\PaymentSettingController;
use App\Http\Controllers\Apps\PaymentMerchantController;
use App\Http\Controllers\Apps\StoreMerchantMappingController;
use App\Http\Controllers\Apps\ProductController;
use App\Http\Controllers\Apps\ReportController;
use App\Http\Controllers\Apps\ServiceController;
use App\Http\Controllers\Apps\StaffController;
use App\Http\Controllers\Apps\TransactionController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Reports\ProfitReportController;
use App\Http\Controllers\Reports\SalesReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Webhooks\MidtransWebhookController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing Page
Route::get('/', [LandingPageController::class, 'index'])->name('landing');

// Public route for invoice PDF download (for WhatsApp links)
Route::get('/transactions/{invoice}/download', [TransactionController::class, 'downloadPDF'])->name('transactions.download');

// Midtrans webhook routes (public - no auth required)
Route::post('/webhooks/midtrans/notification', [MidtransWebhookController::class, 'handleNotification'])->name('webhooks.midtrans.notification');
Route::get('/webhooks/midtrans/finish', [MidtransWebhookController::class, 'handleFinish'])->name('webhooks.midtrans.finish');

Route::group(['prefix' => 'dashboard', 'middleware' => ['auth', 'check.license']], function () {
    Route::get('/', [DashboardController::class, 'index'])->middleware(['auth', 'verified', 'permission:dashboard-access'])->name('dashboard');
    Route::get('/permissions', [PermissionController::class, 'index'])->middleware('permission:permissions-access')->name('permissions.index');
    // roles route
    Route::resource('/roles', RoleController::class)
        ->except(['create', 'edit', 'show'])
        ->middlewareFor('index', 'permission:roles-access')
        ->middlewareFor('store', 'permission:roles-create')
        ->middlewareFor('update', 'permission:roles-update')
        ->middlewareFor('destroy', 'permission:roles-delete');
    // users route
    Route::resource('/users', UserController::class)
        ->except('show')
        ->middlewareFor('index', 'permission:users-access')
        ->middlewareFor(['create', 'store'], 'permission:users-create')
        ->middlewareFor(['edit', 'update'], 'permission:users-update')
        ->middlewareFor('destroy', 'permission:users-delete');

    Route::resource('categories', CategoryController::class)
        ->middlewareFor(['index', 'show'], 'permission:categories-access')
        ->middlewareFor(['create', 'store'], 'permission:categories-create')
        ->middlewareFor(['edit', 'update'], 'permission:categories-edit')
        ->middlewareFor('destroy', 'permission:categories-delete');
    Route::resource('products', ProductController::class)
        ->middlewareFor(['index', 'show'], 'permission:products-access')
        ->middlewareFor(['create', 'store'], 'permission:products-create')
        ->middlewareFor(['edit', 'update'], 'permission:products-edit')
        ->middlewareFor('destroy', 'permission:products-delete');
    Route::resource('customers', CustomerController::class)
        ->middlewareFor(['index', 'show'], 'permission:customers-access')
        ->middlewareFor(['create', 'store'], 'permission:customers-create')
        ->middlewareFor(['edit', 'update'], 'permission:customers-edit')
        ->middlewareFor('destroy', 'permission:customers-delete');

    // E1: Customer Portal
    Route::get('/customers/{customer}/portal', [CustomerController::class, 'portal'])->middleware('permission:customers-access')->name('customers.portal');

    // Beauty Salon Features
    Route::resource('services', ServiceController::class)
        ->middlewareFor(['index', 'show'], 'permission:services-access')
        ->middlewareFor(['create', 'store'], 'permission:services-create')
        ->middlewareFor(['edit', 'update'], 'permission:services-edit')
        ->middlewareFor('destroy', 'permission:services-delete');

    Route::resource('staff', StaffController::class)
        ->middlewareFor(['index', 'show'], 'permission:staff-access')
        ->middlewareFor(['create', 'store'], 'permission:staff-create')
        ->middlewareFor(['edit', 'update'], 'permission:staff-edit')
        ->middlewareFor('destroy', 'permission:staff-delete');

    Route::resource('appointments', AppointmentController::class)
        ->middlewareFor(['index', 'show'], 'permission:appointments-access')
        ->middlewareFor(['create', 'store'], 'permission:appointments-create')
        ->middlewareFor(['edit', 'update'], 'permission:appointments-edit')
        ->middlewareFor('destroy', 'permission:appointments-delete');

    // Appointment actions
    Route::post('/appointments/{appointment}/confirm', [AppointmentController::class, 'confirm'])->middleware('permission:appointments-edit')->name('appointments.confirm');
    Route::post('/appointments/{appointment}/cancel', [AppointmentController::class, 'cancel'])->middleware('permission:appointments-edit')->name('appointments.cancel');
    Route::post('/appointments/{appointment}/complete', [AppointmentController::class, 'complete'])->middleware('permission:appointments-edit')->name('appointments.complete');
    Route::post('/appointments/{appointment}/resend-whatsapp', [AppointmentController::class, 'resendWhatsApp'])->middleware('permission:appointments-edit')->name('appointments.resendWhatsApp');
    Route::get('/appointments/calendar/events', [AppointmentController::class, 'calendar'])->middleware('permission:appointments-access')->name('appointments.calendar');
    Route::get('/appointments/slots/available', [AppointmentController::class, 'availableSlots'])->middleware('permission:appointments-access')->name('appointments.availableSlots');

    // E2: Appointment Rescheduling
    Route::get('/appointments/{appointment}/reschedule', [AppointmentController::class, 'reschedule'])->middleware('permission:appointments-edit')->name('appointments.reschedule');
    Route::post('/appointments/{appointment}/reschedule', [AppointmentController::class, 'processReschedule'])->middleware('permission:appointments-edit')->name('appointments.process-reschedule');

    // Multi-Tenant: Payment Merchants
    Route::resource('merchants', PaymentMerchantController::class)
        ->middlewareFor(['index', 'show'], 'permission:merchants-access')
        ->middlewareFor(['create', 'store'], 'permission:merchants-create')
        ->middlewareFor(['edit', 'update'], 'permission:merchants-edit')
        ->middlewareFor('destroy', 'permission:merchants-delete');
    Route::post('merchants/{merchant}/set-default', [PaymentMerchantController::class, 'setDefault'])
        ->middleware('permission:merchants-set-default')
        ->name('merchants.set-default');

    // Multi-Tenant: Store Management
    Route::resource('stores', StoreController::class)
        ->middlewareFor(['index', 'show'], 'permission:stores-access')
        ->middlewareFor(['create', 'store'], 'permission:stores-create')
        ->middlewareFor(['edit', 'update'], 'permission:stores-edit')
        ->middlewareFor('destroy', 'permission:stores-delete');
    Route::post('switch-store', [StoreController::class, 'switch'])
        ->middleware('permission:stores-switch')
        ->name('stores.switch');

    // Multi-Tenant: Store-Merchant Mappings
    Route::get('store-merchants', [StoreMerchantMappingController::class, 'index'])
        ->middleware('permission:merchant-mappings-access')
        ->name('store-merchants.index');
    Route::post('store-merchants', [StoreMerchantMappingController::class, 'store'])
        ->middleware('permission:merchant-mappings-manage')
        ->name('store-merchants.store');
    Route::put('store-merchants/{storeMerchant}', [StoreMerchantMappingController::class, 'update'])
        ->middleware('permission:merchant-mappings-manage')
        ->name('store-merchants.update');
    Route::delete('store-merchants/{storeMerchant}', [StoreMerchantMappingController::class, 'destroy'])
        ->middleware('permission:merchant-mappings-manage')
        ->name('store-merchants.destroy');

    // C: Appointment Analytics
    Route::get('/appointments-analytics', [AppointmentAnalyticsController::class, 'index'])->middleware('permission:appointments-access')->name('appointments.analytics');
    Route::get('/appointments-analytics/export', [AppointmentAnalyticsController::class, 'export'])->middleware('permission:appointments-access')->name('appointments.analytics.export');

    // G: Business Intelligence
    Route::get('/business-intelligence', [\App\Http\Controllers\Apps\BusinessIntelligenceController::class, 'index'])->middleware('permission:dashboard-access')->name('business-intelligence');

    // H5: System Health Monitoring
    Route::get('/system-health', [\App\Http\Controllers\Apps\SystemHealthController::class, 'index'])->middleware('permission:dashboard-access')->name('system-health');
    Route::post('/system-health/clear-cache', [\App\Http\Controllers\Apps\SystemHealthController::class, 'clearCache'])->middleware('permission:dashboard-access')->name('system-health.clear-cache');
    Route::post('/system-health/optimize-database', [\App\Http\Controllers\Apps\SystemHealthController::class, 'optimizeDatabase'])->middleware('permission:dashboard-access')->name('system-health.optimize-database');

    // D3: Walk-in to appointment conversion
    Route::get('/appointments/create-from-transaction/{transaction}', [AppointmentController::class, 'createFromTransaction'])->middleware('permission:appointments-create')->name('appointments.create-from-transaction');

    // E3: Appointment Feedback
    Route::get('/appointments/{appointment}/feedback/create', [AppointmentFeedbackController::class, 'create'])->middleware('permission:appointments-access')->name('appointments.feedback.create');
    Route::post('/appointments/{appointment}/feedback', [AppointmentFeedbackController::class, 'store'])->middleware('permission:appointments-access')->name('appointments.feedback.store');
    Route::get('/appointments/{appointment}/feedback', [AppointmentFeedbackController::class, 'show'])->middleware('permission:appointments-access')->name('appointments.feedback.show');
    Route::get('/appointments-feedback-analytics', [AppointmentFeedbackController::class, 'analytics'])->middleware('permission:appointments-access')->name('appointments.feedback.analytics');

    //route customer history
    Route::get('/customers/{customer}/history', [CustomerController::class, 'getHistory'])->middleware('permission:transactions-access')->name('customers.history');

    //route customer store via AJAX (no redirect)
    Route::post('/customers/store-ajax', [CustomerController::class, 'storeAjax'])->middleware('permission:customers-create')->name('customers.storeAjax');

    //route transaction
    Route::get('/transactions', [TransactionController::class, 'index'])->middleware('permission:transactions-access')->name('transactions.index');

    //route transaction searchProduct
    Route::post('/transactions/searchProduct', [TransactionController::class, 'searchProduct'])->middleware('permission:transactions-access')->name('transactions.searchProduct');

    //route transaction addToCart
    Route::post('/transactions/addToCart', [TransactionController::class, 'addToCart'])->middleware('permission:transactions-access')->name('transactions.addToCart');

    //route transaction addServiceToCart (Beauty Salon)
    Route::post('/transactions/addServiceToCart', [TransactionController::class, 'addServiceToCart'])->middleware('permission:transactions-access')->name('transactions.addServiceToCart');

    //route transaction destroyCart
    Route::delete('/transactions/{cart_id}/destroyCart', [TransactionController::class, 'destroyCart'])->middleware('permission:transactions-access')->name('transactions.destroyCart');

    //route transaction updateCart
    Route::patch('/transactions/{cart_id}/updateCart', [TransactionController::class, 'updateCart'])->middleware('permission:transactions-access')->name('transactions.updateCart');

    //route hold transaction
    Route::post('/transactions/hold', [TransactionController::class, 'holdCart'])->middleware('permission:transactions-access')->name('transactions.hold');
    Route::post('/transactions/{holdId}/resume', [TransactionController::class, 'resumeCart'])->middleware('permission:transactions-access')->name('transactions.resume');
    Route::delete('/transactions/{holdId}/clearHold', [TransactionController::class, 'clearHold'])->middleware('permission:transactions-access')->name('transactions.clearHold');
    Route::get('/transactions/held', [TransactionController::class, 'getHeldCarts'])->middleware('permission:transactions-access')->name('transactions.held');

    //route transaction store
    Route::post('/transactions/store', [TransactionController::class, 'store'])->middleware('permission:transactions-access')->name('transactions.store');
    Route::get('/transactions/{invoice}/print', [TransactionController::class, 'print'])->middleware('permission:transactions-access')->name('transactions.print');
    Route::get('/transactions/history', [TransactionController::class, 'history'])->middleware('permission:transactions-access')->name('transactions.history');


    // Settings
    Route::get('/settings/payments', [PaymentSettingController::class, 'edit'])->middleware('permission:payment-settings-access')->name('settings.payments.edit');
    Route::put('/settings/payments', [PaymentSettingController::class, 'update'])->middleware('permission:payment-settings-access')->name('settings.payments.update');

    Route::get('/settings/notifications', [NotificationSettingController::class, 'edit'])->middleware('permission:notification-settings-access')->name('settings.notifications.edit');
    Route::put('/settings/notifications', [NotificationSettingController::class, 'update'])->middleware('permission:notification-settings-access')->name('settings.notifications.update');
    Route::post('/settings/notifications/test-whatsapp', [NotificationSettingController::class, 'testWhatsApp'])->middleware('permission:notification-settings-access')->name('settings.notifications.testWhatsApp');
    Route::post('/settings/notifications/test-email', [NotificationSettingController::class, 'testEmail'])->middleware('permission:notification-settings-access')->name('settings.notifications.testEmail');

    Route::get('/settings/backup', [BackupController::class, 'index'])->middleware('permission:backup-access')->name('settings.backup.index');
    Route::post('/settings/backup/create', [BackupController::class, 'create'])->middleware('permission:backup-access')->name('settings.backup.create');
    Route::get('/settings/backup/download/{filename}', [BackupController::class, 'download'])->middleware('permission:backup-access')->name('settings.backup.download');
    Route::delete('/settings/backup/delete/{filename}', [BackupController::class, 'delete'])->middleware('permission:backup-access')->name('settings.backup.delete');
    Route::post('/settings/backup/restore/{filename}', [BackupController::class, 'restore'])->middleware('permission:backup-access')->name('settings.backup.restore');

    // License Management
    Route::get('/license', [LicenseController::class, 'index'])->name('license.index');
    Route::get('/license/renew', [LicenseController::class, 'renew'])->name('license.renew');

    // Store Switcher (handled by StoreController - see line 134 above)

    // Dashboard Widgets
    Route::get('/widgets/store-comparison', [DashboardWidgetController::class, 'storeComparison'])->name('widgets.store-comparison');
    Route::get('/widgets/license-status', [DashboardWidgetController::class, 'licenseStatus'])->name('widgets.license-status');

    // Offline Sync API Routes
    Route::prefix('api/sync')->middleware('auth:sanctum')->group(function () {
        Route::get('/products', [SyncController::class, 'products'])->name('api.sync.products');
        Route::get('/services', [SyncController::class, 'services'])->name('api.sync.services');
        Route::get('/customers', [SyncController::class, 'customers'])->name('api.sync.customers');
        Route::get('/staff', [SyncController::class, 'staff'])->name('api.sync.staff');
        Route::post('/transactions', [SyncController::class, 'syncTransaction'])->name('api.sync.transactions');
        Route::post('/appointments', [SyncController::class, 'syncAppointment'])->name('api.sync.appointments');
    });

    //reports
    Route::get('/reports/sales', [SalesReportController::class, 'index'])->middleware('permission:reports-access')->name('reports.sales.index');
    Route::get('/reports/profits', [ProfitReportController::class, 'index'])->middleware('permission:profits-access')->name('reports.profits.index');

    // New Report System
    Route::prefix('reports')->middleware('permission:reports-access')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/sales-report', [ReportController::class, 'sales'])->name('reports.sales-report');
        Route::get('/products-report', [ReportController::class, 'products'])->name('reports.products');
        Route::get('/customers-report', [ReportController::class, 'customers'])->name('reports.customers');
        Route::get('/profit-report', [ReportController::class, 'profit'])->name('reports.profit');
        Route::get('/export', [ReportController::class, 'export'])->name('reports.export');
        Route::get('/export-excel', [ReportController::class, 'exportExcel'])->name('reports.export-excel');
    });

    // Enterprise Reporting System
    Route::prefix('enterprise-reports')->name('enterprise.reports.')->middleware('permission:reports-access')->group(function () {
        // Dashboard
        Route::get('/', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'index'])->name('index');

        // Report Views
        Route::get('/sales', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'sales'])->name('sales');
        Route::get('/products', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'products'])->name('products');
        Route::get('/customers', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'customers'])->name('customers');
        Route::get('/profit', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'profit'])->name('profit');
        Route::get('/tax', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'tax'])->name('tax');
        Route::get('/inventory', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'inventory'])->name('inventory');

        // Saved Reports
        Route::get('/saved', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'saved'])->name('saved');
        Route::post('/save', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'save'])->name('save');
        Route::get('/load/{report}', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'load'])->name('load');
        Route::delete('/saved/{report}', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'destroy'])->name('destroy');

        // Scheduled Reports
        Route::get('/schedules', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'schedules'])->name('schedules');
        Route::post('/schedules', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'createSchedule'])->name('schedules.create');
        Route::patch('/schedules/{schedule}', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'updateSchedule'])->name('schedules.update');
        Route::delete('/schedules/{schedule}', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'destroySchedule'])->name('schedules.destroy');
        Route::post('/schedules/{schedule}/toggle', [\App\Http\Controllers\Apps\EnterpriseReportController::class, 'toggleSchedule'])->name('schedules.toggle');

        // Export Routes
        Route::prefix('export')->name('export.')->group(function () {
            Route::get('/sales', [\App\Http\Controllers\Apps\ReportExportController::class, 'sales'])->name('sales');
            Route::get('/products', [\App\Http\Controllers\Apps\ReportExportController::class, 'products'])->name('products');
            Route::get('/customers', [\App\Http\Controllers\Apps\ReportExportController::class, 'customers'])->name('customers');
            Route::get('/profit', [\App\Http\Controllers\Apps\ReportExportController::class, 'profit'])->name('profit');
            Route::get('/tax', [\App\Http\Controllers\Apps\ReportExportController::class, 'tax'])->name('tax');
            Route::get('/inventory', [\App\Http\Controllers\Apps\ReportExportController::class, 'inventory'])->name('inventory');
        });
    });

    // ==================== ENTERPRISE MODULES ====================

    // Finance & Accounting Module
    Route::prefix('finance')->name('finance.')->middleware('permission:finance-access')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Apps\FinanceController::class, 'dashboard'])->name('dashboard');

        // Accounting
        Route::get('/general-ledger', [\App\Http\Controllers\Apps\FinanceController::class, 'generalLedger'])->middleware('permission:ledger-access')->name('general-ledger');
        Route::get('/journal-entries', [\App\Http\Controllers\Apps\FinanceController::class, 'journalEntries'])->middleware('permission:journal-access')->name('journal-entries');
        Route::get('/chart-of-accounts', [\App\Http\Controllers\Apps\FinanceController::class, 'chartOfAccounts'])->middleware('permission:accounts-access')->name('chart-of-accounts');

        // Invoices
        Route::get('/invoices', [\App\Http\Controllers\Apps\FinanceController::class, 'invoices'])->middleware('permission:invoices-access')->name('invoices.index');
        Route::get('/invoices/create', [\App\Http\Controllers\Apps\FinanceController::class, 'createInvoice'])->middleware('permission:invoices-create')->name('invoices.create');
        Route::get('/invoices/recurring', [\App\Http\Controllers\Apps\FinanceController::class, 'recurringInvoices'])->middleware('permission:invoices-recurring')->name('invoices.recurring');

        // Payments
        Route::get('/payments', [\App\Http\Controllers\Apps\FinanceController::class, 'payments'])->middleware('permission:payments-access')->name('payments.index');
        Route::get('/payments/receive', [\App\Http\Controllers\Apps\FinanceController::class, 'receivePayment'])->middleware('permission:payments-view')->name('payments.receive');
        Route::get('/payment-methods', [\App\Http\Controllers\Apps\FinanceController::class, 'paymentMethods'])->middleware('permission:payment-methods-manage')->name('payment-methods');

        // Banking
        Route::get('/bank-accounts', [\App\Http\Controllers\Apps\FinanceController::class, 'bankAccounts'])->middleware('permission:bank-accounts-access')->name('bank-accounts');
        Route::get('/reconciliation', [\App\Http\Controllers\Apps\FinanceController::class, 'reconciliation'])->middleware('permission:bank-reconciliation-access')->name('reconciliation');

        // Expenses & Budgets
        Route::get('/expenses', [\App\Http\Controllers\Apps\FinanceController::class, 'expenses'])->middleware('permission:expenses-access')->name('expenses');
        Route::get('/budgets', [\App\Http\Controllers\Apps\FinanceController::class, 'budgets'])->middleware('permission:budgets-access')->name('budgets');
    });

    // Procurement & Supply Chain Module
    Route::prefix('procurement')->name('procurement.')->middleware('permission:purchase-orders-access')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Apps\ProcurementController::class, 'dashboard'])->name('dashboard');

        // Purchase Orders
        Route::get('/purchase-orders', [\App\Http\Controllers\Apps\ProcurementController::class, 'purchaseOrders'])->middleware('permission:purchase-orders-view')->name('purchase-orders.index');
        Route::get('/purchase-orders/create', [\App\Http\Controllers\Apps\ProcurementController::class, 'createPurchaseOrder'])->middleware('permission:purchase-orders-create')->name('purchase-orders.create');

        // Suppliers
        Route::get('/suppliers', [\App\Http\Controllers\Apps\ProcurementController::class, 'suppliers'])->middleware('permission:suppliers-access')->name('suppliers');
        Route::get('/suppliers/analytics', [\App\Http\Controllers\Apps\ProcurementController::class, 'supplierAnalytics'])->middleware('permission:suppliers-analytics')->name('suppliers.analytics');

        // Warehouses
        Route::get('/warehouses', [\App\Http\Controllers\Apps\ProcurementController::class, 'warehouses'])->middleware('permission:warehouses-access')->name('warehouses');
        Route::get('/stock-transfers', [\App\Http\Controllers\Apps\ProcurementController::class, 'stockTransfers'])->middleware('permission:stock-transfers-access')->name('stock-transfers');
        Route::get('/stock-adjustments', [\App\Http\Controllers\Apps\ProcurementController::class, 'stockAdjustments'])->middleware('permission:stock-adjustments-access')->name('stock-adjustments');

        // Inventory Tracking
        Route::get('/inventory-tracking', [\App\Http\Controllers\Apps\ProcurementController::class, 'inventoryTracking'])->middleware('permission:inventory-tracking-access')->name('inventory-tracking');
        Route::get('/receiving', [\App\Http\Controllers\Apps\ProcurementController::class, 'receiving'])->middleware('permission:receiving-access')->name('receiving');
    });

    // Human Resources Module
    Route::prefix('hr')->name('hr.')->middleware('permission:hr-access')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Apps\HRController::class, 'dashboard'])->name('dashboard');

        // Employees
        Route::get('/employees', [\App\Http\Controllers\Apps\HRController::class, 'employees'])->middleware('permission:employees-access')->name('employees');
        Route::get('/departments', [\App\Http\Controllers\Apps\HRController::class, 'departments'])->middleware('permission:departments-access')->name('departments');

        // Attendance & Leave
        Route::get('/attendance', [\App\Http\Controllers\Apps\HRController::class, 'attendance'])->middleware('permission:attendance-access')->name('attendance');
        Route::get('/leave-management', [\App\Http\Controllers\Apps\HRController::class, 'leaveManagement'])->middleware('permission:leave-management-access')->name('leave-management');
        Route::get('/shifts', [\App\Http\Controllers\Apps\HRController::class, 'shifts'])->middleware('permission:shifts-access')->name('shifts');

        // Payroll
        Route::get('/payroll', [\App\Http\Controllers\Apps\HRController::class, 'payroll'])->middleware('permission:payroll-access')->name('payroll');
        Route::get('/payroll/process', [\App\Http\Controllers\Apps\HRController::class, 'processPayroll'])->middleware('permission:payroll-process')->name('payroll.process');
        Route::get('/salary-structure', [\App\Http\Controllers\Apps\HRController::class, 'salaryStructure'])->middleware('permission:salary-structure-access')->name('salary-structure');

        // Recruitment & Development
        Route::get('/recruitment', [\App\Http\Controllers\Apps\HRController::class, 'recruitment'])->middleware('permission:recruitment-access')->name('recruitment');
        Route::get('/training', [\App\Http\Controllers\Apps\HRController::class, 'training'])->middleware('permission:training-access')->name('training');
        Route::get('/performance', [\App\Http\Controllers\Apps\HRController::class, 'performance'])->middleware('permission:performance-access')->name('performance');
    });

    // Marketing & CRM Module
    Route::prefix('marketing')->name('marketing.')->middleware('permission:marketing-access')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Apps\MarketingController::class, 'dashboard'])->name('dashboard');

        // Campaigns
        Route::get('/campaigns', [\App\Http\Controllers\Apps\MarketingController::class, 'campaigns'])->middleware('permission:campaigns-access')->name('campaigns');
        Route::get('/campaigns/email', [\App\Http\Controllers\Apps\MarketingController::class, 'emailCampaigns'])->middleware('permission:email-campaigns-access')->name('campaigns.email');
        Route::get('/campaigns/sms', [\App\Http\Controllers\Apps\MarketingController::class, 'smsCampaigns'])->middleware('permission:sms-campaigns-access')->name('campaigns.sms');
        Route::get('/campaigns/whatsapp', [\App\Http\Controllers\Apps\MarketingController::class, 'whatsappCampaigns'])->middleware('permission:whatsapp-campaigns-access')->name('campaigns.whatsapp');

        // Promotions
        Route::get('/promotions', [\App\Http\Controllers\Apps\MarketingController::class, 'promotions'])->middleware('permission:promotions-access')->name('promotions');
        Route::get('/discounts', [\App\Http\Controllers\Apps\MarketingController::class, 'discounts'])->middleware('permission:discounts-access')->name('discounts');
        Route::get('/coupons', [\App\Http\Controllers\Apps\MarketingController::class, 'coupons'])->middleware('permission:coupons-access')->name('coupons');
        Route::get('/vouchers', [\App\Http\Controllers\Apps\MarketingController::class, 'vouchers'])->middleware('permission:vouchers-access')->name('vouchers');

        // Loyalty Program
        Route::get('/loyalty-program', [\App\Http\Controllers\Apps\MarketingController::class, 'loyaltyProgram'])->middleware('permission:loyalty-access')->name('loyalty-program');
        Route::get('/loyalty-settings', [\App\Http\Controllers\Apps\MarketingController::class, 'loyaltySettings'])->middleware('permission:loyalty-settings-access')->name('loyalty-settings');
        Route::get('/loyalty-tiers', [\App\Http\Controllers\Apps\MarketingController::class, 'loyaltyTiers'])->middleware('permission:loyalty-tiers-access')->name('loyalty-tiers');
        Route::get('/rewards', [\App\Http\Controllers\Apps\MarketingController::class, 'rewards'])->middleware('permission:rewards-access')->name('rewards');

        // Social & Analysis
        Route::get('/social-media', [\App\Http\Controllers\Apps\MarketingController::class, 'socialMedia'])->middleware('permission:social-media-access')->name('social-media');
        Route::get('/referrals', [\App\Http\Controllers\Apps\MarketingController::class, 'referrals'])->middleware('permission:referrals-access')->name('referrals');
        Route::get('/market-analysis', [\App\Http\Controllers\Apps\MarketingController::class, 'marketAnalysis'])->middleware('permission:market-analysis-access')->name('market-analysis');
    });

    // Integrations Module
    Route::prefix('integrations')->name('integrations.')->middleware('permission:integrations-access')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Apps\IntegrationController::class, 'dashboard'])->name('dashboard');

        // API Management
        Route::get('/api-management', [\App\Http\Controllers\Apps\IntegrationController::class, 'apiManagement'])->middleware('permission:api-access')->name('api-management');
        Route::get('/api-keys', [\App\Http\Controllers\Apps\IntegrationController::class, 'apiKeys'])->middleware('permission:api-keys-access')->name('api-keys');
        Route::get('/webhooks', [\App\Http\Controllers\Apps\IntegrationController::class, 'webhooks'])->middleware('permission:webhooks-access')->name('webhooks');
        Route::get('/api-logs', [\App\Http\Controllers\Apps\IntegrationController::class, 'apiLogs'])->middleware('permission:api-logs-access')->name('api-logs');

        // Third-Party Apps
        Route::get('/third-party', [\App\Http\Controllers\Apps\IntegrationController::class, 'thirdParty'])->middleware('permission:third-party-access')->name('third-party');
        Route::get('/google-suite', [\App\Http\Controllers\Apps\IntegrationController::class, 'googleSuite'])->middleware('permission:google-integration-access')->name('google-suite');
        Route::get('/email-platform', [\App\Http\Controllers\Apps\IntegrationController::class, 'emailPlatform'])->middleware('permission:email-integration-access')->name('email-platform');
        Route::get('/whatsapp-business', [\App\Http\Controllers\Apps\IntegrationController::class, 'whatsappBusiness'])->middleware('permission:whatsapp-integration-access')->name('whatsapp-business');
    });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

// ==================== SUBSCRIPTION WEBHOOKS ====================
// These routes are public (no CSRF protection needed)
Route::post('/webhooks/subscription/midtrans', [\App\Http\Controllers\Webhooks\SubscriptionWebhookController::class, 'midtrans'])
    ->name('webhooks.subscription.midtrans')
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

Route::post('/webhooks/subscription/xendit', [\App\Http\Controllers\Webhooks\SubscriptionWebhookController::class, 'xendit'])
    ->name('webhooks.subscription.xendit')
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

Route::post('/webhooks/subscription/generic', [\App\Http\Controllers\Webhooks\SubscriptionWebhookController::class, 'generic'])
    ->name('webhooks.subscription.generic')
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
