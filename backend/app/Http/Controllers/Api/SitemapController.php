<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate dynamic XML sitemap for SEO crawlers
     */
    public function index()
    {
        $frontendUrl = env('CORS_ALLOWED_ORIGIN', 'http://localhost:5173');

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // 1. Home URL
        $xml .= '<url>';
        $xml .= '<loc>' . $frontendUrl . '/</loc>';
        $xml .= '<changefreq>daily</changefreq>';
        $xml .= '<priority>1.0</priority>';
        $xml .= '</url>';

        // 2. Categories URLs
        $categories = Category::all();
        foreach ($categories as $cat) {
            $xml .= '<url>';
            $xml .= '<loc>' . $frontendUrl . '/products?category=' . urlencode($cat->slug) . '</loc>';
            $xml .= '<lastmod>' . $cat->updated_at->toAtomString() . '</lastmod>';
            $xml .= '<changefreq>weekly</changefreq>';
            $xml .= '<priority>0.8</priority>';
            $xml .= '</url>';
        }

        // 3. Products URLs
        $products = Product::all();
        foreach ($products as $prod) {
            $xml .= '<url>';
            $xml .= '<loc>' . $frontendUrl . '/products/' . urlencode($prod->slug) . '</loc>';
            $xml .= '<lastmod>' . $prod->updated_at->toAtomString() . '</lastmod>';
            $xml .= '<changefreq>daily</changefreq>';
            $xml .= '<priority>0.9</priority>';
            $xml .= '</url>';
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
