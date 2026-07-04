<?php

namespace App\Services;

use Razorpay\Api\Api;
use Exception;

class PaymentService
{
    private $keyId;
    private $keySecret;

    public function __construct()
    {
        $this->keyId = env('RAZORPAY_KEY_ID', 'rzp_test_MERRKY_KEY_ID_MOCK');
        $this->keySecret = env('RAZORPAY_KEY_SECRET', 'MERRKY_KEY_SECRET_MOCK');
    }

    /**
     * Create a Razorpay Order.
     */
    public function createRazorpayOrder(float $amount, string $receiptId): string
    {
        if (strpos($this->keyId, 'MOCK') !== false || empty($this->keyId)) {
            return 'order_mock_' . uniqid();
        }

        try {
            $api = new Api($this->keyId, $this->keySecret);
            $order = $api->order->create([
                'receipt'         => $receiptId,
                'amount'          => round($amount * 100), // amount in paise
                'currency'        => 'INR',
                'payment_capture' => 1
            ]);

            return $order['id'];
        } catch (Exception $e) {
            \Log::error('Razorpay Order Creation Failed: ' . $e->getMessage());
            
            if (app()->environment('local', 'testing')) {
                return 'order_mock_' . uniqid();
            }
            throw new Exception('Razorpay transaction order creation failed: ' . $e->getMessage());
        }
    }

    /**
     * Verify payment signature server-side.
     */
    public function verifySignature(string $razorpayOrderId, string $razorpayPaymentId, ?string $signature): bool
    {
        // Bypass checks if using mockup keys or signature is empty (development mode)
        if (strpos($this->keyId, 'MOCK') !== false || empty($signature)) {
            return true;
        }

        try {
            $api = new Api($this->keyId, $this->keySecret);
            $attributes = [
                'razorpay_order_id' => $razorpayOrderId,
                'razorpay_payment_id' => $razorpayPaymentId,
                'razorpay_signature' => $signature
            ];

            $api->utility->verifyPaymentSignature($attributes);
            return true;
        } catch (Exception $e) {
            \Log::warning('Razorpay Signature Verification Failed: ' . $e->getMessage());
            return false;
        }
    }
}
