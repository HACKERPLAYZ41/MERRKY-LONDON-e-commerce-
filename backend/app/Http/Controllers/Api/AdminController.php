<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get Administrative dashboard financial and inventory metrics
     */
    public function stats(Request $request)
    {
        $totalRevenue = (float)Order::where('payment_status', 'Paid')->sum('total_amount');
        $ordersCount = Order::count();
        $customersCount = User::where('role', 'customer')->count();
        $lowStockCount = Product::where('stock', '<=', 5)->count();

        // 1. Low stock products alert list
        $lowStockProducts = Product::where('stock', '<=', 5)
            ->select('id', 'name', 'stock', 'price')
            ->get();

        // 2. Monthly revenue breakdown for charts (Recharts compat)
        $revenueLogs = Order::where('payment_status', 'Paid')
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(id) as orders')
            )
            ->groupBy('month')
            ->orderBy('month', 'ASC')
            ->get();

        // 3. Recent orders list
        $recentOrders = Order::with('user')
            ->orderBy('created_at', 'DESC')
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer_name' => $order->user->name,
                    'total_amount' => (float)$order->total_amount,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at->toDateTimeString()
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'total_revenue' => $totalRevenue,
                'orders_count' => $ordersCount,
                'customers_count' => $customersCount,
                'low_stock_count' => $lowStockCount,
                'low_stock_products' => $lowStockProducts,
                'monthly_revenue' => $revenueLogs,
                'recent_orders' => $recentOrders
            ]
        ]);
    }

    /**
     * Get Admin Audit Action Logs
     */
    public function auditLogs(Request $request)
    {
        $logs = AuditLog::with('user')
            ->orderBy('created_at', 'DESC')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total()
            ]
        ]);
    }
}
