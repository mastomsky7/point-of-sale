<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarketingController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Dashboard/Marketing/Dashboard', ['title' => 'Marketing Dashboard']);
    }

    public function campaigns()
    {
        return Inertia::render('Dashboard/Marketing/Campaigns/Index', ['title' => 'Campaigns']);
    }

    public function emailCampaigns()
    {
        return Inertia::render('Dashboard/Marketing/Campaigns/Email', ['title' => 'Email Campaigns']);
    }

    public function smsCampaigns()
    {
        return Inertia::render('Dashboard/Marketing/Campaigns/SMS', ['title' => 'SMS Campaigns']);
    }

    public function whatsappCampaigns()
    {
        return Inertia::render('Dashboard/Marketing/Campaigns/WhatsApp', ['title' => 'WhatsApp Campaigns']);
    }

    public function promotions()
    {
        return Inertia::render('Dashboard/Marketing/Promotions', ['title' => 'Promotions']);
    }

    public function discounts()
    {
        return Inertia::render('Dashboard/Marketing/Discounts', ['title' => 'Discounts']);
    }

    public function coupons()
    {
        return Inertia::render('Dashboard/Marketing/Coupons', ['title' => 'Coupons']);
    }

    public function vouchers()
    {
        return Inertia::render('Dashboard/Marketing/Vouchers', ['title' => 'Vouchers']);
    }

    public function loyaltyProgram()
    {
        return Inertia::render('Dashboard/Marketing/Loyalty/Program', ['title' => 'Loyalty Program']);
    }

    public function loyaltySettings()
    {
        return Inertia::render('Dashboard/Marketing/Loyalty/Settings', ['title' => 'Loyalty Settings']);
    }

    public function loyaltyTiers()
    {
        return Inertia::render('Dashboard/Marketing/Loyalty/Tiers', ['title' => 'Loyalty Tiers']);
    }

    public function rewards()
    {
        return Inertia::render('Dashboard/Marketing/Loyalty/Rewards', ['title' => 'Rewards']);
    }

    public function socialMedia()
    {
        return Inertia::render('Dashboard/Marketing/SocialMedia', ['title' => 'Social Media']);
    }

    public function referrals()
    {
        return Inertia::render('Dashboard/Marketing/Referrals', ['title' => 'Referrals']);
    }

    public function marketAnalysis()
    {
        return Inertia::render('Dashboard/Marketing/MarketAnalysis', ['title' => 'Market Analysis']);
    }
}
