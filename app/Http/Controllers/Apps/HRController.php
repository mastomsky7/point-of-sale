<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HRController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Dashboard/HR/Dashboard', ['title' => 'HR Dashboard']);
    }

    public function employees()
    {
        return Inertia::render('Dashboard/HR/Employees/Index', ['title' => 'Employees']);
    }

    public function departments()
    {
        return Inertia::render('Dashboard/HR/Departments', ['title' => 'Departments']);
    }

    public function attendance()
    {
        return Inertia::render('Dashboard/HR/Attendance', ['title' => 'Attendance']);
    }

    public function leaveManagement()
    {
        return Inertia::render('Dashboard/HR/LeaveManagement', ['title' => 'Leave Management']);
    }

    public function shifts()
    {
        return Inertia::render('Dashboard/HR/Shifts', ['title' => 'Shifts']);
    }

    public function payroll()
    {
        return Inertia::render('Dashboard/HR/Payroll/Index', ['title' => 'Payroll']);
    }

    public function processPayroll()
    {
        return Inertia::render('Dashboard/HR/Payroll/Process', ['title' => 'Process Payroll']);
    }

    public function salaryStructure()
    {
        return Inertia::render('Dashboard/HR/Payroll/SalaryStructure', ['title' => 'Salary Structure']);
    }

    public function recruitment()
    {
        return Inertia::render('Dashboard/HR/Recruitment', ['title' => 'Recruitment']);
    }

    public function training()
    {
        return Inertia::render('Dashboard/HR/Training', ['title' => 'Training']);
    }

    public function performance()
    {
        return Inertia::render('Dashboard/HR/Performance', ['title' => 'Performance']);
    }
}
