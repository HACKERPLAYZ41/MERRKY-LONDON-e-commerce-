<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Customer Registration
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:users,email',
            'password' => 'required|string|min:6|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred.',
                'errors' => $validator->errors()
            ], 400);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'customer'
        ]);

        // Issue tokens
        $accessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully.',
            'token' => $accessToken,
            'refresh_token' => $refreshToken,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => 'customer'
            ]
        ], 201);
    }

    /**
     * Customer / General Login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:150',
            'password' => 'required|string|min:6|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred.',
                'errors' => $validator->errors()
            ], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.'
            ], 401);
        }

        // Customer login completes directly without 2FA
        $accessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'token' => $accessToken,
            'refresh_token' => $refreshToken,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ]
        ]);
    }

    /**
     * Admin login with 2FA Initiation
     */
    public function adminLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:150',
            'password' => 'required|string|min:6|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred.',
                'errors' => $validator->errors()
            ], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.'
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Administrator privileges required.'
            ], 403);
        }

        // Generate 6-digit OTP
        $otpCode = (string)mt_rand(100000, 999999);
        $user->update([
            'two_factor_otp' => $otpCode,
            'two_factor_expires_at' => now()->addMinutes(5)
        ]);

        // Email OTP simulated via Laravel Mail log / service
        $emailFrom = env('MAILGUN_FROM_EMAIL', 'noreply@merrkylondon.com');
        \Log::info("MAIL SIMULATION: Sending 2FA verification email to {$user->email}. Sender: {$emailFrom}. Code: [{$otpCode}]");

        try {
            Mail::raw("Your MERRKY LONDON administrative 2FA verification code is: {$otpCode}. It expires in 5 minutes.", function ($message) use ($user, $emailFrom) {
                $message->from(parse_url($emailFrom, PHP_URL_PATH) ? 'noreply@merrkylondon.com' : $emailFrom, 'MERRKY LONDON');
                $message->to($user->email)->subject('Admin Login 2FA Verification Code');
            });
        } catch (\Exception $e) {
            \Log::warning('Email SMTP sending failed, using log fallback: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'requires_2fa' => true,
            'message' => 'A 2-Factor verification code has been dispatched to your email.',
            'email' => $user->email,
            // In local dev mode, expose the OTP directly so no log file is needed
            'dev_otp' => app()->environment('local') ? $otpCode : null,
        ]);
    }

    /**
     * Admin 2FA Code Verification
     */
    public function adminVerify2fa(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:150',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred.',
                'errors' => $validator->errors()
            ], 400);
        }

        $user = User::where('email', $request->email)
            ->where('role', 'admin')
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }

        if ($user->two_factor_otp !== $request->otp || now()->greaterThan($user->two_factor_expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired verification code.'
            ], 401);
        }

        // Clear 2FA OTP state upon verification
        $user->update([
            'two_factor_otp' => null,
            'two_factor_expires_at' => null
        ]);

        // Issue tokens
        $accessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Administrative login successful.',
            'token' => $accessToken,
            'refresh_token' => $refreshToken,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => 'admin'
            ]
        ]);
    }

    /**
     * Refresh Expired Access Token using Refresh Token
     */
    public function refresh(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Check that the token used to authenticate this request is a refresh_token
        $currentToken = $user->currentAccessToken();
        if ($currentToken->name !== 'refresh_token') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid token context. Please submit a valid refresh token.'
            ], 401);
        }

        // Revoke the old tokens to prevent replay attacks
        $user->tokens()->delete();

        // Reissue token pair
        $accessToken = $user->createToken('access_token', ['*'], now()->addMinutes(15))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Tokens refreshed successfully.',
            'token' => $accessToken,
            'refresh_token' => $refreshToken
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.'
        ]);
    }
}
