<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cacheKey = 'products_query_' . md5(json_encode($request->all()));

        $products = Cache::remember($cacheKey, 300, function () use ($request) {
            $query = Product::with('category');

            // Filter by category ID
            if ($request->has('category_id') && $request->category_id !== null && $request->category_id !== 'all') {
                $query->where('category_id', $request->category_id);
            }

            // Filter by category slug
            if ($request->has('category_slug') && $request->category_slug !== 'all') {
                $query->whereHas('category', function ($q) use ($request) {
                    $q->where('slug', $request->category_slug);
                });
            }

            // Search query
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Featured products
            if ($request->boolean('featured')) {
                $query->where('is_featured', true);
            }

            // Sorting
            if ($request->has('sort')) {
                switch ($request->sort) {
                    case 'price_asc':
                        $query->orderBy('price', 'asc');
                        break;
                    case 'price_desc':
                        $query->orderBy('price', 'desc');
                        break;
                    case 'latest':
                    default:
                        $query->orderBy('created_at', 'desc');
                        break;
                }
            } else {
                $query->orderBy('created_at', 'desc');
            }

            return $query->get()->toArray();
        });

        return response()->json([
            'success' => true,
            'count' => count($products),
            'data' => $products
        ]);
    }

    public function show($id): JsonResponse
    {
        $product = Product::with('category')->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        foreach (['gallery', 'sizes', 'colors'] as $field) {
            if ($request->has($field) && is_string($request->$field)) {
                $decoded = json_decode($request->$field, true);
                if (is_array($decoded)) {
                    $request->merge([$field => $decoded]);
                } else if (!empty(trim($request->$field))) {
                    $request->merge([$field => array_map('trim', explode(',', $request->$field))]);
                }
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'sizes' => 'nullable|array',
            'colors' => 'nullable|array',
            'gallery' => 'nullable|array',
            'image_url' => 'required|string',
            'is_featured' => 'nullable|boolean',
            'is_new' => 'nullable|boolean',
            'stock' => 'nullable|integer|min:0',
        ]);

        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']) . '-' . time();
        $validated['sizes'] = $validated['sizes'] ?? ["S", "M", "L", "XL"];
        $validated['colors'] = $validated['colors'] ?? ["Black", "White"];
        $validated['gallery'] = $validated['gallery'] ?? [];

        $product = Product::create($validated);
        Cache::flush();

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully!',
            'data' => $product->load('category')
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        foreach (['gallery', 'sizes', 'colors'] as $field) {
            if ($request->has($field) && is_string($request->$field)) {
                $decoded = json_decode($request->$field, true);
                if (is_array($decoded)) {
                    $request->merge([$field => $decoded]);
                } else if (!empty(trim($request->$field))) {
                    $request->merge([$field => array_map('trim', explode(',', $request->$field))]);
                }
            }
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|exists:categories,id',
            'price' => 'sometimes|required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'sizes' => 'nullable|array',
            'colors' => 'nullable|array',
            'gallery' => 'nullable|array',
            'image_url' => 'sometimes|required|string',
            'is_featured' => 'nullable|boolean',
            'is_new' => 'nullable|boolean',
            'stock' => 'nullable|integer|min:0',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']) . '-' . $id;
        }

        $product->update($validated);
        Cache::flush();

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully!',
            'data' => $product->load('category')
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }

        $product->delete();
        Cache::flush();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully!'
        ]);
    }
}