<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AuditLog;

class AuditLogger
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log state-changing write requests (POST, PUT, PATCH, DELETE) for successful responses
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE']) && $response->getStatusCode() < 400) {
            $user = $request->user();
            if ($user && $user->role === 'admin') {
                $action = strtolower($request->method()) . '_action';
                $path = $request->path();
                
                // Construct clean details payload, hiding credentials
                $details = json_encode([
                    'url' => $request->fullUrl(),
                    'payload' => $request->except(['password', 'password_confirmation', 'two_factor_otp']),
                    'status_code' => $response->getStatusCode()
                ]);

                // Guess model identity from URL if possible
                $modelType = null;
                $modelId = null;

                if (preg_match('/products\/([0-9]+)/', $path, $matches)) {
                    $modelType = 'App\\Models\\Product';
                    $modelId = (int)$matches[1];
                } elseif (preg_match('/categories\/([0-9]+)/', $path, $matches)) {
                    $modelType = 'App\\Models\\Category';
                    $modelId = (int)$matches[1];
                } elseif (preg_match('/orders\/([0-9]+)/', $path, $matches)) {
                    $modelType = 'App\\Models\\Order';
                    $modelId = (int)$matches[1];
                }

                AuditLog::create([
                    'user_id' => $user->id,
                    'action' => $action . ' on ' . $path,
                    'model_type' => $modelType,
                    'model_id' => $modelId,
                    'details' => $details,
                    'ip_address' => $request->ip()
                ]);
            }
        }

        return $response;
    }
}
