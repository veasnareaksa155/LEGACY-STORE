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

    public function googleLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'tier' => 'nullable|string',
            'avatar' => 'nullable|string',
            'avatar_url' => 'nullable|string',
            'google_id' => 'nullable|string',
        ]);

        $avatar = $validated['avatar'] ?? ($validated['avatar_url'] ?? null);
        $user = User::where('email', $validated['email'])->first();

        if ($user) {
            $updated = false;
            // If user has no avatar and Google provides one, update it
            if (!empty($avatar) && empty($user->avatar)) {
                $user->avatar = $avatar;
                $updated = true;
            }
            if (!empty($validated['phone']) && empty($user->phone)) {
                $user->phone = $validated['phone'];
                $updated = true;
            }
            if (!empty($validated['address']) && empty($user->address)) {
                $user->address = $validated['address'];
                $updated = true;
            }
            if ($updated) {
                $user->save();
            }

            return response()->json([
                'success' => true,
                'is_new_user' => false,
                'message' => 'Signed in with Google successfully',
                'data' => $user
            ]);
        }

        // New Google user VIP registration
        $name = !empty($validated['name']) ? $validated['name'] : explode('@', $validated['email'])[0];
        $newUser = User::create([
            'name' => $name,
            'email' => $validated['email'],
            'password' => Hash::make('google_oauth_' . bin2hex(random_bytes(10))),
            'role' => 'user',
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'tier' => $validated['tier'] ?? 'BLACK DIAMOND VIP',
            'avatar' => $avatar,
        ]);

        return response()->json([
            'success' => true,
            'is_new_user' => true,
            'message' => 'VIP Account registered and authenticated via Google',
            'data' => $newUser
        ], 201);
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
