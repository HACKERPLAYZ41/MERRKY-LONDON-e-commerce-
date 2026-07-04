<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Cart;
use App\Models\Address;
use Exception;
use Illuminate\Support\Facades\DB;

class OrderService
{
    private $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Checkout process.
     */
    public function checkout(int $userId, int $addressId, Cart $cart): array
    {
        $address = Address::where('user_id', $userId)->findOrFail($addressId);

        if ($cart->items->isEmpty()) {
            throw new Exception("Your shopping cart is empty.");
        }

        return DB::transaction(function () use ($userId, $addressId, $cart) {
            $totalAmount = 0.00;
            $itemsToProcess = [];

            // 1. Validate stock & compute pricing
            foreach ($cart->items as $item) {
                $product = $item->product;

                if ($product->stock < $item->quantity) {
                    throw new Exception("Insufficient stock for product '{$product->name}'. Available: {$product->stock}");
                }

                $activePrice = $product->discount_price !== null ? (float)$product->discount_price : (float)$product->price;
                $totalAmount += $activePrice * $item->quantity;

                $itemsToProcess[] = [
                    'product' => $product,
                    'quantity' => $item->quantity,
                    'price' => $activePrice,
                    'size' => $item->size,
                    'color' => $item->color
                ];
            }

            // 2. Generate Razorpay transaction order
            $receiptId = 'rcpt_' . time() . '_' . $userId;
            $razorpayOrderId = $this->paymentService->createRazorpayOrder($totalAmount, $receiptId);

            // 3. Create Order
            $order = Order::create([
                'user_id' => $userId,
                'total_amount' => $totalAmount,
                'status' => 'Pending',
                'payment_status' => 'Unpaid',
                'address_id' => $addressId,
                'razorpay_order_id' => $razorpayOrderId,
            ]);

            // 4. Create Order Items
            foreach ($itemsToProcess as $it) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $it['product']->id,
                    'quantity' => $it['quantity'],
                    'price' => $it['price'],
                    'size' => $it['size'],
                    'color' => $it['color']
                ]);
            }

            return [
                'order' => $order,
                'razorpay_order_id' => $razorpayOrderId,
                'total_amount' => $totalAmount
            ];
        });
    }

    /**
     * Confirm order on successful signature.
     */
    public function confirmOrder(string $razorpayOrderId, string $razorpayPaymentId, ?string $signature): Order
    {
        $order = Order::where('razorpay_order_id', $razorpayOrderId)->firstOrFail();

        if ($order->payment_status === 'Paid') {
            return $order;
        }

        // Verify Razorpay Payment Signature
        $isValid = $this->paymentService->verifySignature($razorpayOrderId, $razorpayPaymentId, $signature);

        if (!$isValid) {
            throw new Exception("Payment signature verification failed.");
        }

        return DB::transaction(function () use ($order, $razorpayPaymentId) {
            // Update Order payment status
            $order->update([
                'payment_status' => 'Paid',
                'status' => 'Confirmed',
                'razorpay_payment_id' => $razorpayPaymentId
            ]);

            // Deduct product stock inventory
            foreach ($order->items as $item) {
                $product = $item->product;
                $newStock = max(0, $product->stock - $item->quantity);
                $product->update(['stock' => $newStock]);
            }

            // Clear User Cart
            $cart = Cart::where('user_id', $order->user_id)->first();
            if ($cart) {
                $cart->items()->delete();
            }

            return $order;
        });
    }
}
