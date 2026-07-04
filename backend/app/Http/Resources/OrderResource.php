<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_name' => $this->user->name,
            'customer_email' => $this->user->email,
            'total_amount' => (float)$this->total_amount,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'address' => [
                'id' => $this->address?->id,
                'address_line' => $this->address?->address_line,
                'city' => $this->address?->city,
                'state' => $this->address?->state,
                'pincode' => $this->address?->pincode,
                'phone' => $this->address?->phone
            ],
            'razorpay_order_id' => $this->razorpay_order_id,
            'razorpay_payment_id' => $this->razorpay_payment_id,
            'items' => $this->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product?->name,
                    'quantity' => $item->quantity,
                    'price' => (float)$item->price,
                    'size' => $item->size,
                    'color' => $item->color,
                    'image_url' => $item->product?->images->first()?->image_url
                ];
            }),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
