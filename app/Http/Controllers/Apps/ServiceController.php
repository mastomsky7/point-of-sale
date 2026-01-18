<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::with('category');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $services = $query->latest()->paginate(20);

        return Inertia::render('Dashboard/Services/Index', [
            'services' => $services,
            'categories' => Category::all(),
            'filters' => $request->only(['search', 'category_id', 'is_active']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Services/Create', [
            'categories' => Category::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:2048',
            'requires_staff' => 'boolean',
            'commission_percent' => 'integer|min:0|max:100',
        ]);

        if ($request->hasFile('image')) {
            $image = $request->file('image');

            // Generate filename: service-{slug}-{random}
            $slug = \Illuminate\Support\Str::slug($validated['name']);
            $randomString = \Illuminate\Support\Str::random(8);
            $extension = $image->getClientOriginalExtension();
            $filename = "service-{$slug}-{$randomString}.{$extension}";

            $image->storeAs('services', $filename, 'public');
            $validated['image'] = $filename;
        }

        Service::create($validated);

        return redirect()->route('services.index')
            ->with('success', 'Service created successfully!');
    }

    public function edit(Service $service)
    {
        return Inertia::render('Dashboard/Services/Edit', [
            'service' => $service,
            'categories' => Category::all(),
        ]);
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'requires_staff' => 'boolean',
            'commission_percent' => 'integer|min:0|max:100',
        ]);

        if ($request->hasFile('image')) {
            if ($service->getRawOriginal('image')) {
                Storage::disk('public')->delete($service->getRawOriginal('image'));
            }

            $image = $request->file('image');

            // Generate filename: service-{slug}-{random}
            $slug = \Illuminate\Support\Str::slug($validated['name']);
            $randomString = \Illuminate\Support\Str::random(8);
            $extension = $image->getClientOriginalExtension();
            $filename = "service-{$slug}-{$randomString}.{$extension}";

            $image->storeAs('services', $filename, 'public');
            $validated['image'] = $filename;
        }

        $service->update($validated);

        return redirect()->route('services.index')
            ->with('success', 'Service updated successfully!');
    }

    public function destroy(Service $service)
    {
        if ($service->getRawOriginal('image')) {
            Storage::disk('public')->delete($service->getRawOriginal('image'));
        }

        $service->delete();

        return redirect()->back()->with('success', 'Service deleted successfully!');
    }
}
