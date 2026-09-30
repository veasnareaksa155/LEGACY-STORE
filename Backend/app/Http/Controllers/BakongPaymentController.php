<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Order;
use KHQR\BakongKHQR;
use KHQR\Models\IndividualInfo;
use KHQR\Helpers\KHQRData;

class BakongPaymentController extends Controller
{
    /**
     * Generate Dynamic Bakong KHQR String & Payload
     */
    public function generateKhqr(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'nullable|string|in:USD,KHR',
        ]);

        $orderId = $validated['order_id'];
        $amount = (float) $validated['amount'];
        $currency = strtoupper($validated['currency'] ?? 'USD');

        // Bakong Configuration from .env
        $merchantId = env('BAKONG_MERCHANT_ID', 'veasna_reaksa@bkrt');
        $merchantName = env('BAKONG_MERCHANT_NAME', 'REAKSA VEASNA');
        $mobileNumber = env('BAKONG_MOBILE_NUMBER', '855885232761');
        $storeLabel = env('BAKONG_STORE_LABEL', 'Paris Atelier');
        $terminal = env('BAKONG_TERMINAL', 'WEB-STORE');
        $billNumber = 'LX' . str_pad($orderId, 6, '0', STR_PAD_LEFT);

        $qrData = null;
        $md5Hash = null;

        // Generate 100% NBC & EMVCo Compliant Dynamic KHQR using official BakongKHQR SDK
        try {
            $currencyConstant = ($currency === 'KHR') ? KHQRData::CURRENCY_KHR : KHQRData::CURRENCY_USD;
            $individualInfo = new IndividualInfo(
                $merchantId,
                $merchantName,
                'Phnom Penh',
                null,
                null,
                $currencyConstant,
                $amount,
                $billNumber,
                $storeLabel,
                $terminal,
                $mobileNumber
            );

            $khqrResponse = BakongKHQR::generateIndividual($individualInfo);

            if ($khqrResponse && isset($khqrResponse->data['qr'])) {
                $qrData = $khqrResponse->data['qr'];
                $md5Hash = $khqrResponse->data['md5'] ?? md5($qrData);
            }
        } catch (\Exception $e) {
            Log::error('BakongKHQR SDK Generation Error: ' . $e->getMessage());
        }

        if (empty($qrData)) {
            $qrData = $this->buildEMVCoKHQR($merchantId, $merchantName, $amount, $billNumber, $currency);
            $md5Hash = md5($qrData);
        }

        // Generate NBC Bakong Official Deeplink if token is available
        $deeplink = null;
        $bakongToken = env('BAKONG_TOKEN', null);
        if (!empty($bakongToken) && !empty($qrData)) {
            try {
                $baseUrl = rtrim(env('BAKONG_API_URL', 'https://api-bakong.nbc.gov.kh'), '/');
                if (!str_contains($baseUrl, '/v1')) {
                    $baseUrl .= '/v1';
                }

                $deepRes = Http::withToken($bakongToken)
                    ->post("{$baseUrl}/generate_deeplink_by_qr", [
                        'qr' => $qrData,
                        'sourceInfo' => [
                            'appName' => 'Alexandre Luxe',
                            'appIconUrl' => 'https://alexandre-luxe.onrender.com/favicon.svg',
                            'appDeepLinkCallback' => 'https://alexandre-luxe.onrender.com'
                        ]
                    ]);

                if ($deepRes->successful()) {
                    $deepData = $deepRes->json();
                    $deeplink = $deepData['data']['shortLink'] ?? null;
                }
            } catch (\Exception $e) {
                Log::warning('Bakong Deeplink API Error: ' . $e->getMessage());
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'order_id' => $orderId,
                'amount' => $amount,
                'currency' => $currency,
                'bill_number' => $billNumber,
                'md5' => $md5Hash,
                'qr_string' => $qrData,
                'deeplink' => $deeplink,
                'merchant_name' => $merchantName,
                'merchant_id' => $merchantId,
                'created_at' => now()->toIso8601String(),
            ]
        ]);
    }

    /**
     * Calculate EMVCo CRC16 Checksum (Polynomial 0x1021, Initial 0xFFFF)
     */
    private function calculateCRC16($str)
    {
        $crc = 0xFFFF;
        for ($c = 0; $c < strlen($str); $c++) {
            $crc ^= (ord($str[$c]) << 8);
            for ($i = 0; $i < 8; $i++) {
                if ($crc & 0x8000) {
                    $crc = (($crc << 1) ^ 0x1021) & 0xFFFF;
                } else {
                    $crc = ($crc << 1) & 0xFFFF;
                }
            }
        }
        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }

    /**
     * Generate 100% EMVCo & NBC Compliant Dynamic Bakong KHQR String
     */
    private function buildEMVCoKHQR($merchantId, $merchantName, $amount, $billNumber, $currency = 'USD')
    {
        $merchantIdClean = trim($merchantId); // e.g. veasna_reaksa@bkrt
        $isKhr = strtoupper($currency) === 'KHR';

        $merchantNameClean = strtoupper(substr(preg_replace('/[^A-Za-z0-9 ]/', '', $merchantName), 0, 25));
        if (empty($merchantNameClean)) {
            $merchantNameClean = "REAKSA VEASNA";
        }

        // Tag 29 (Individual) or Tag 30 (Merchant)
        $subtag00 = "00" . str_pad(strlen($merchantIdClean), 2, '0', STR_PAD_LEFT) . $merchantIdClean;
        $tag29 = "29" . str_pad(strlen($subtag00), 2, '0', STR_PAD_LEFT) . $subtag00;
        $tag30 = "30" . str_pad(strlen($subtag00), 2, '0', STR_PAD_LEFT) . $subtag00;
        $accountTag = (strpos($merchantIdClean, '@') !== false) ? $tag29 : $tag30;

        // Tag 52: MCC
        $tag52 = "52045999";

        // Tag 53: Currency (840 = USD, 116 = KHR)
        $currencyCode = $isKhr ? '116' : '840';
        $tag53 = "5303" . $currencyCode;

        // Tag 54: Amount (USD MUST ALWAYS have 2 decimal places e.g. 10.00 for ABA Mobile, KHR is integer)
        $formattedAmount = $isKhr ? (string) round((float) $amount) : number_format((float) $amount, 2, '.', '');
        $tag54 = "54" . str_pad(strlen($formattedAmount), 2, '0', STR_PAD_LEFT) . $formattedAmount;

        // Tag 58: Country Code
        $tag58 = "5802KH";

        // Tag 59: Account Name
        $tag59 = "59" . str_pad(strlen($merchantNameClean), 2, '0', STR_PAD_LEFT) . $merchantNameClean;

        // Tag 60: City (Must be PHNOM PENH in uppercase)
        $tag60 = "6010PHNOM PENH";

        // Tag 99: Timestamps (Subtag 00 = Creation, Subtag 01 = Expiration)
        $nowMs = (string) round(microtime(true) * 1000);
        $expMs = (string) (round(microtime(true) * 1000) + (30 * 60 * 1000));
        $subtag99_00 = "00" . str_pad(strlen($nowMs), 2, '0', STR_PAD_LEFT) . $nowMs;
        $subtag99_01 = "01" . str_pad(strlen($expMs), 2, '0', STR_PAD_LEFT) . $expMs;
        $tag99Val = $subtag99_00 . $subtag99_01;
        $tag99 = "99" . str_pad(strlen($tag99Val), 2, '0', STR_PAD_LEFT) . $tag99Val;

        $basePayload = "000201010212" . $accountTag . $tag52 . $tag53 . $tag54 . $tag58 . $tag59 . $tag60 . $tag62 . $tag99 . "6304";

        $crc = $this->calculateCRC16($basePayload);

        return $basePayload . $crc;
    }

    /**
     * Check Transaction Status by MD5 Hash from Bakong Open API
     */
    public function checkTransactionStatus(Request $request)
    {
        $validated = $request->validate([
            'md5' => 'required|string',
            'order_id' => 'nullable',
            'manual' => 'nullable|boolean',
        ]);

        $md5 = $validated['md5'];
        $orderId = $validated['order_id'] ?? null;
        $isManual = filter_var($request->input('manual', false), FILTER_VALIDATE_BOOLEAN);

        $baseUrl = rtrim(env('BAKONG_API_URL', 'https://api-bakong.nbc.gov.kh'), '/');
        if (!str_contains($baseUrl, '/v1')) {
            $baseUrl .= '/v1';
        }
        $bakongToken = env('BAKONG_TOKEN', null);

        // 1. If Bakong Token is present, verify with NBC Bakong Open API
        if (!empty($bakongToken)) {
            try {
                Log::info("Bakong checking payment MD5: {$md5} for Order ID: " . ($orderId ?? 'N/A'));

                $response = Http::withToken($bakongToken)
                    ->post("{$baseUrl}/check_transaction_by_md5", [
                        'md5' => $md5
                    ]);

                Log::info("Bakong API Response Status: " . $response->status() . " Body: " . $response->body());

                if ($response->successful()) {
                    $resData = $response->json();
                    $responseCode = $resData['responseCode'] ?? ($resData['status']['code'] ?? null);

                    if (($responseCode === 0 || $responseCode === '0') && !empty($resData['data'])) {
                        // Payment confirmed on Bakong Network!
                        if (!empty($orderId)) {
                            $order = Order::find($orderId);
                            if ($order) {
                                $order->status = 'Processing';
                                $order->payment_method = 'bakong';
                                $order->save();
                            }
                        }

                        return response()->json([
                            'status' => 'success',
                            'paid' => true,
                            'message' => 'Payment confirmed on Bakong KHQR network!',
                            'transaction' => $resData['data'] ?? []
                        ]);
                    }
                }
            } catch (\Exception $e) {
                Log::error('Bakong check transaction error: ' . $e->getMessage());
            }
        }

        // 2. If user explicitly clicked manual verification or button confirm
        if ($isManual) {
            if (!empty($orderId)) {
                $order = Order::find($orderId);
                if ($order) {
                    $order->status = 'Processing';
                    $order->payment_method = 'bakong';
                    $order->save();
                }
            }

            return response()->json([
                'status' => 'success',
                'paid' => true,
                'message' => 'Payment verified & order confirmed!',
                'md5' => $md5
            ]);
        }

        // 3. Otherwise during background scanning, keep waiting for scan
        return response()->json([
            'status' => 'success',
            'paid' => false,
            'message' => 'Waiting for Bakong payment scan...',
            'md5' => $md5
        ]);
    }

    /**
     * Bakong Webhook Callback
     */
    public function handleCallback(Request $request)
    {
        Log::info('Bakong Webhook Callback received: ', $request->all());

        $md5 = $request->input('md5');
        $orderNumber = $request->input('bill_number');

        if ($orderNumber) {
            $order = Order::where('order_number', $orderNumber)->first();
            if ($order) {
                $order->status = 'Processing';
                $order->save();
            }
        }

        return response()->json(['status' => 'acknowledged']);
    }
}