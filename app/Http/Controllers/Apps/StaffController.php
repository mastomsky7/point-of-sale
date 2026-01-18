<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $query = Staff::with('user');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('specialization', 'like', "%{$request->search}%");
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $staff = $query->latest()->paginate(20);

        return Inertia::render('Dashboard/Staff/Index', [
            'staff' => $staff,
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Staff/Create', [
            'users' => User::whereDoesntHave('staff')->get(['id', 'name', 'email']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id|unique:staff,user_id',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'specialization' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|max:2048',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'working_hours' => 'nullable|array',
            'day_off' => 'nullable|array',
        ]);

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('staff', 'public');
        }

        Staff::create($validated);

        return redirect()->route('staff.index')
            ->with('success', 'Staff member created successfully!');
    }

    public function edit(Staff $staff)
    {
        return Inertia::render('Dashboard/Staff/Edit', [
            'staff' => $staff,
            'users' => User::whereDoesntHave('staff')
                ->orWhere('id', $staff->user_id)
                ->get(['id', 'name', 'email']),
        ]);
    }

    public function update(Request $request, Staff $staff)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id|unique:staff,user_id,' . $staff->id,
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'specialization' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'working_hours' => 'nullable|array',
            'day_off' => 'nullable|array',
        ]);

        if ($request->hasFile('avatar')) {
            if ($staff->getRawOriginal('avatar')) {
                Storage::disk('public')->delete($staff->getRawOriginal('avatar'));
            }
            $validated['avatar'] = $request->file('avatar')->store('staff', 'public');
        }

        $staff->update($validated);

        return redirect()->route('staff.index')
            ->with('success', 'Staff member updated successfully!');
    }

    public function destroy(Staff $staff)
    {
        if ($staff->getRawOriginal('avatar')) {
            Storage::disk('public')->delete($staff->getRawOriginal('avatar'));
        }

        $staff->delete();

        return redirect()->back()->with('success', 'Staff member deleted successfully!');
    }
}
