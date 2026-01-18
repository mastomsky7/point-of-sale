<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProcurementController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Dashboard/Procurement/Dashboard', ['title' => 'Procurement Dashboard']);
    }

    public function purchaseOrders()
    {
        return Inertia::render('Dashboard/Procurement/PurchaseOrders/Index', ['title' => 'Purchase Orders']);
    }

    public function createPurchaseOrder()
    {
        return Inertia::render('Dashboard/Procurement/PurchaseOrders/Create', ['title' => 'Create Purchase Order']);
    }

    public function suppliers()
    {
        return Inertia::render('Dashboard/Procurement/Suppliers/Index', ['title' => 'Suppliers']);
    }

    public function supplierAnalytics()
    {
        return Inertia::render('Dashboard/Procurement/Suppliers/Analytics', ['title' => 'Supplier Analytics']);
    }

    public function warehouses()
    {
        return Inertia::render('Dashboard/Procurement/Warehouses/Index', ['title' => 'Warehouses']);
    }

    public function stockTransfers()
    {
        return Inertia::render('Dashboard/Procurement/StockTransfers', ['title' => 'Stock Transfers']);
    }

    public function stockAdjustments()
    {
        return Inertia::render('Dashboard/Procurement/StockAdjustments', ['title' => 'Stock Adjustments']);
    }

    public function inventoryTracking()
    {
        return Inertia::render('Dashboard/Procurement/InventoryTracking', ['title' => 'Inventory Tracking']);
    }

    public function receiving()
    {
        return Inertia::render('Dashboard/Procurement/Receiving', ['title' => 'Goods Receiving']);
    }
}
