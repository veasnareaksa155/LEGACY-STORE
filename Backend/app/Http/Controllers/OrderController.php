<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'shipping_address' => 'required|string',
            'payment_method' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.size' => 'nullable|string',
            'items.*.color' => 'nullable|string',
        ]);

        $orderNumber = 'LX-' . strtoupper(Str::random(8));
        $totalAmount = 0;

        // Validate stock availability for all items first
        foreach ($validated['items'] as $itemData) {
            $product = \App\Models\Product::find($itemData['product_id']);
            if ($product && $product->stock !== null) {
                if ($product->stock < $itemData['quantity']) {
                    return response()->json([
                        'success' => false,
                        'message' => "Insufficient stock for '{$product->name}'. Only {$product->stock} items left in stock.",
                    ], 422);
                }
            }
        }

        $order = Order::create([
            'order_number' => $orderNumber,
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'phone' => $validated['phone'],
            'shipping_address' => $validated['shipping_address'],
            'payment_method' => $validated['payment_method'] ?? 'card',
            'total_amount' => 0,
            'status' => 'processing',
            'delivery_status' => 'processing',
            'courier_name' => 'Sokha Delivery Express',
            'courier_phone' => '+855 12 888 999',
            'driver_lat' => 11.5564,
            'driver_lng' => 104.9282,
            'estimated_minutes' => 25,
        ]);

        foreach ($validated['items'] as $itemData) {
            $product = \App\Models\Product::find($itemData['product_id']);
            if (!$product)
                continue;

            $itemPrice = $product->price;
            $subtotal = $itemPrice * $itemData['quantity'];
            $totalAmount += $subtotal;

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'price' => $itemPrice,
                'quantity' => $itemData['quantity'],
                'size' => $itemData['size'] ?? null,
                'color' => $itemData['color'] ?? null,
            ]);

            // Decrement inventory stock for purchased items
            if ($product->stock !== null) {
                $product->stock = max(0, $product->stock - $itemData['quantity']);
                $product->save();
            }
        }

        $finalTotal = $request->has('total_amount') && is_numeric($request->total_amount)
            ? floatval($request->total_amount)
            : $totalAmount;

        $order->update(['total_amount' => $finalTotal]);

        return response()->json([
            'success' => true,
            'message' => 'Order created successfully!',
            'data' => $order->load('items')
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Order::with('items')->orderBy('created_at', 'desc');

        if ($request->has('email') && !empty($request->email)) {
            $query->where('customer_email', $request->email);
        }

        $orders = $query->get();

        return response()->json([
            'success' => true,
            'count' => $orders->count(),
            'data' => $orders
        ]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:pending,processing,shipped,delivering,delivered,completed,cancelled',
            'courier_name' => 'nullable|string|max:100',
            'courier_phone' => 'nullable|string|max:50',
            'estimated_minutes' => 'nullable|integer',
        ]);

        $updateData = ['status' => $validated['status']];
        $updateData['delivery_status'] = $validated['status'];

        if (isset($validated['courier_name']))
            $updateData['courier_name'] = $validated['courier_name'];
        if (isset($validated['courier_phone']))
            $updateData['courier_phone'] = $validated['courier_phone'];
        if (isset($validated['estimated_minutes']))
            $updateData['estimated_minutes'] = $validated['estimated_minutes'];

        $order->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully!',
            'data' => $order->load('items')
        ]);
    }

    /**
     * Get real-time delivery status & driver location
     */
    public function getDeliveryStatus($idOrNumber): JsonResponse
    {
        $order = Order::with('items')
            ->where('id', $idOrNumber)
            ->orWhere('order_number', $idOrNumber)
            ->first();

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Driver updates live GPS coordinates & delivery progress
     */
    public function updateDeliveryLocation(Request $request, $id): JsonResponse
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $validated = $request->validate([
            'driver_lat' => 'required|numeric',
            'driver_lng' => 'required|numeric',
            'estimated_minutes' => 'nullable|integer',
            'delivery_status' => 'nullable|string|in:pending,processing,shipped,delivering,delivered,completed',
        ]);

        $updateData = [
            'driver_lat' => $validated['driver_lat'],
            'driver_lng' => $validated['driver_lng'],
        ];

        if (isset($validated['estimated_minutes'])) {
            $updateData['estimated_minutes'] = $validated['estimated_minutes'];
        }

        if (isset($validated['delivery_status'])) {
            $updateData['delivery_status'] = $validated['delivery_status'];
            $updateData['status'] = $validated['delivery_status'];
        }

        $order->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Delivery location updated!',
            'data' => $order
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully!'
        ]);
    }
}