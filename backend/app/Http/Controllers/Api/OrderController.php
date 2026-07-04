<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Cart;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\OrderService;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    private $orderService;
    private $cartService;

    public function __construct(OrderService $orderService, CartService $cartService)
    {
        $this->orderService = $orderService;
        $this->cartService = $cartService;
    }

    /**
     * List user orders (Admin gets all, Customers get their own)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            $orders = Order::with(['user', 'address', 'items.product'])->orderBy('created_at', 'DESC')->get();
        } else {
            $orders = Order::with(['user', 'address', 'items.product'])->where('user_id', $user->id)->orderBy('created_at', 'DESC')->get();
        }

        return OrderResource::collection($orders);
    }

    /**
     * Initiate Checkout & Razorpay Order
     */
    public function checkout(CheckoutRequest $request)
    {
        $user = $request->user();
        
        // Find user cart
        $cart = Cart::where('user_id', $user->id)->first();
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Shopping cart not found.'
            ], 404);
        }

        try {
            $result = $this->orderService->checkout($user->id, $request->address_id, $cart);

            return response()->json([
                'success' => true,
                'message' => 'Order created. Transaction initiated.',
                'order_id' => $result['order']->id,
                'total_amount' => $result['total_amount'],
                'razorpay_order_id' => $result['razorpay_order_id'],
                'razorpay_key_id' => env('RAZORPAY_KEY_ID', 'rzp_test_MERRKY_KEY_ID_MOCK')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Verify payment signature server-side
     */
    public function verifyPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'razorpay_order_id' => 'required|string|max:100',
            'razorpay_payment_id' => 'required|string|max:100',
            'razorpay_signature' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred.',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $order = $this->orderService->confirmOrder(
                $request->razorpay_order_id,
                $request->razorpay_payment_id,
                $request->razorpay_signature
            );

            return response()->json([
                'success' => true,
                'message' => 'Payment verified and order confirmed successfully.',
                'order_id' => $order->id
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment verification failed: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update order status (Admin CRUD)
     */
    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:Pending,Confirmed,Shipped,Delivered,Cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors occurred.',
                'errors' => $validator->errors()
            ], 400);
        }

        $oldStatus = $order->status;
        $newStatus = $request->status;

        if ($oldStatus === $newStatus) {
            return response()->json([
                'success' => true,
                'message' => 'Order status is already ' . $newStatus
            ]);
        }

        try {
            \DB::transaction(function () use ($order, $newStatus, $oldStatus) {
                $order->update(['status' => $newStatus]);

                // If status is updated to Cancelled, return stock items back
                if ($newStatus === 'Cancelled') {
                    foreach ($order->items as $item) {
                        $product = $item->product;
                        $product->increment('stock', $item->quantity);
                    }
                }
                
                // If status was Cancelled and is re-opened, re-deduct stock
                if ($oldStatus === 'Cancelled' && $newStatus !== 'Cancelled') {
                    foreach ($order->items as $item) {
                        $product = $item->product;
                        $newStock = max(0, $product->stock - $item->quantity);
                        $product->update(['stock' => $newStock]);
                    }
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully.',
                'status' => $newStatus
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate HTML Invoice for download/printing
     */
    public function getInvoice(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::with(['user', 'address', 'items.product'])->findOrFail($id);

        // Ensure ownership OR admin privileges
        if ($order->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access.'
            ], 403);
        }

        $address = $order->address;
        $itemsHtml = '';
        $subtotal = 0;

        foreach ($order->items as $item) {
            $productName = $item->product ? $item->product->name : 'Unknown Product';
            $qty = $item->quantity;
            $price = $item->price;
            $total = $qty * $price;
            $subtotal += $total;

            $meta = '';
            if ($item->size) $meta .= "Size: {$item->size} ";
            if ($item->color) $meta .= "Color: {$item->color}";

            $itemsHtml .= "
                <tr style='border-bottom: 1px solid #eaeaea;'>
                    <td style='padding: 12px 0; font-size: 13px; color: #111;'>
                        <strong>{$productName}</strong><br>
                        <span style='font-size: 10px; color: #888; text-transform: uppercase;'>{$meta}</span>
                    </td>
                    <td style='padding: 12px 0; font-size: 13px; color: #555; text-align: center;'>{$qty}</td>
                    <td style='padding: 12px 0; font-size: 13px; color: #555; text-align: right;'>₹{$price}</td>
                    <td style='padding: 12px 0; font-size: 13px; color: #111; font-weight: bold; text-align: right;'>₹{$total}</td>
                </tr>
            ";
        }

        $tax = round($subtotal * 0.18, 2); // 18% GST mock
        $grandTotal = $order->total_amount;

        $invoiceDate = $order->created_at->format('d M Y');
        $invoiceNum = "MKY-" . str_pad($order->id, 6, '0', STR_PAD_LEFT);
        
        $customerName = $order->user ? $order->user->name : 'Valued Customer';
        $customerEmail = $order->user ? $order->user->email : '';
        $addrLine = $address ? $address->address_line : 'No Address Provided';
        $city = $address ? $address->city : '';
        $state = $address ? $address->state : '';
        $pincode = $address ? $address->pincode : '';
        $phone = $address ? $address->phone : '';

        $html = "
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <title>Invoice - {$invoiceNum}</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 40px; color: #111; background: #fff; }
                .invoice-box { max-width: 800px; margin: auto; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; }
                .title { font-size: 24px; font-weight: 300; text-transform: uppercase; color: #555; }
                .details { display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 12px; line-height: 1.6; }
                .details h4 { margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px; color: #888; font-size: 10px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                th { text-transform: uppercase; font-size: 10px; letter-spacing: 1px; color: #888; border-bottom: 1px solid #111; padding-bottom: 8px; text-align: left; }
                .totals { display: flex; justify-content: flex-end; font-size: 13px; line-height: 2; }
                .totals-table { width: 250px; }
                .totals-table td { padding: 4px 0; }
                .footer { text-align: center; margin-top: 60px; font-size: 10px; color: #888; border-top: 1px solid #eaeaea; padding-top: 20px; text-transform: uppercase; letter-spacing: 1px; }
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class='invoice-box'>
                <div class='no-print' style='text-align: right; margin-bottom: 20px;'>
                    <button onclick='window.print()' style='background: #111; color: #fff; border: none; padding: 8px 16px; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; border-radius: 3px;'>Print Invoice</button>
                </div>
                <div class='header'>
                    <div class='logo'>MERRKY LONDON</div>
                    <div class='title'>Invoice</div>
                </div>
                <div class='details'>
                    <div>
                        <h4>MERRKY LONDON</h4>
                        18 Conduit St, Mayfair<br>
                        London, W1S 2XN<br>
                        United Kingdom<br>
                        support@merrky.com
                    </div>
                    <div>
                        <h4>Bill To</h4>
                        <strong>{$customerName}</strong><br>
                        {$addrLine}<br>
                        {$city}, {$state} - {$pincode}<br>
                        Phone: {$phone}<br>
                        Email: {$customerEmail}
                    </div>
                    <div style='text-align: right;'>
                        <h4>Invoice details</h4>
                        <strong>Invoice No:</strong> {$invoiceNum}<br>
                        <strong>Date:</strong> {$invoiceDate}<br>
                        <strong>Payment Status:</strong> {$order->payment_status}<br>
                        <strong>Delivery Status:</strong> {$order->status}
                    </div>
                </div>
                
                <table style='width: 100%;'>
                    <thead>
                        <tr>
                            <th style='width: 50%;'>Item description</th>
                            <th style='width: 10%; text-align: center;'>Qty</th>
                            <th style='width: 20%; text-align: right;'>Price</th>
                            <th style='width: 20%; text-align: right;'>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {$itemsHtml}
                    </tbody>
                </table>

                <div class='totals'>
                    <table class='totals-table'>
                        <tr>
                            <td style='color: #888;'>Subtotal</td>
                            <td style='text-align: right; font-weight: 500;'>₹{$subtotal}</td>
                        </tr>
                        <tr>
                            <td style='color: #888;'>GST (Included 18%)</td>
                            <td style='text-align: right; font-weight: 500;'>₹{$tax}</td>
                        </tr>
                        <tr style='border-top: 1px solid #111; font-size: 15px; font-weight: bold;'>
                            <td style='padding-top: 8px;'>Grand Total</td>
                            <td style='text-align: right; padding-top: 8px;'>₹{$grandTotal}</td>
                        </tr>
                    </table>
                </div>

                <div class='footer'>
                    Thank you for shopping with MERRKY LONDON. Est. 2026.
                </div>
            </div>
        </body>
        </html>
        ";

        return response($html, 200)->header('Content-Type', 'text/html');
    }
}
