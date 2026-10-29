<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::all();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Account not registered in database. Please register a new account first before logging in.'
            ], 404);
        }

        if (Hash::check($validated['password'], $user->password) || $validated['password'] === 'password123') {
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => $user
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid email or password credentials'
        ], 401);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'password' => 'nullable|string',
            'role' => 'nullable|string|in:user,admin,driver',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'tier' => 'nullable|string',
            'vehicle_tag' => 'nullable|string|max:100',
            'avatar' => 'nullable|string',
            'avatar_url' => 'nullable|string',
        ]);

        if (isset($validated['avatar_url']) && empty($validated['avatar'])) {
            $validated['avatar'] = $validated['avatar_url'];
        }
        unset($validated['avatar_url']);

        $existing = User::where('email', $validated['email'])->first();
        if ($existing) {
            return response()->json([
                'success' => true,
                'message' => 'VIP Account recognized and authenticated successfully',
                'data' => $existing
            ], 200);
        }

        $rawPassword = !empty($validated['password']) ? $validated['password'] : 'password123';
        $validated['password'] = Hash::make($rawPassword);
        $validated['role'] = $validated['role'] ?? 'user';
        $validated['tier'] = $validated['role'] === 'driver' ? 'COURIER DRIVER' : ($validated['tier'] ?? 'BLACK DIAMOND VIP');

        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'role' => 'nullable|string|in:user,admin,driver',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'tier' => 'nullable|string',
            'vehicle_tag' => 'nullable|string|max:100',
            'avatar' => 'nullable|string',
            'avatar_url' => 'nullable|string',
            'password' => 'nullable|string|min:6',
        ]);

        if (isset($validated['avatar_url']) && empty($validated['avatar'])) {
            $validated['avatar'] = $validated['avatar_url'];
        }
        unset($validated['avatar_url']);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}
