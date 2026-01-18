<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IntegrationController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Dashboard/Integrations/Dashboard', ['title' => 'Integrations Dashboard']);
    }

    public function apiManagement()
    {
        return Inertia::render('Dashboard/Integrations/API/Management', ['title' => 'API Management']);
    }

    public function apiKeys()
    {
        return Inertia::render('Dashboard/Integrations/API/Keys', ['title' => 'API Keys']);
    }

    public function webhooks()
    {
        return Inertia::render('Dashboard/Integrations/API/Webhooks', ['title' => 'Webhooks']);
    }

    public function apiLogs()
    {
        return Inertia::render('Dashboard/Integrations/API/Logs', ['title' => 'API Logs']);
    }

    public function thirdParty()
    {
        return Inertia::render('Dashboard/Integrations/ThirdParty', ['title' => 'Third-Party Apps']);
    }

    public function googleSuite()
    {
        return Inertia::render('Dashboard/Integrations/Google', ['title' => 'Google Suite']);
    }

    public function emailPlatform()
    {
        return Inertia::render('Dashboard/Integrations/Email', ['title' => 'Email Platform']);
    }

    public function whatsappBusiness()
    {
        return Inertia::render('Dashboard/Integrations/WhatsApp', ['title' => 'WhatsApp Business']);
    }
}
