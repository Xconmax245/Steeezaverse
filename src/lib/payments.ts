// Payment gateway abstraction — Paystack + Flutterwave, NGN only.
// NOTE: We call the REST APIs directly with fetch rather than the installed
// `paystack` npm wrapper on purpose: that package is callback-based, unmaintained
// (depends on the deprecated `request` lib), and has no clean initialize
// endpoint. flutterwave-node-v3 likewise lacks a payments-initialize wrapper.
// Keep using fetch here — do not "fix" this back to the SDKs without a real
// reason.

export type PaymentGateway = 'paystack' | 'flutterwave';

export interface InitializePaymentParams {
  gateway: PaymentGateway;
  email: string;
  /** Amount in NGN (major units, e.g. 25_000). */
  amount: number;
  reference: string;
  callbackUrl: string;
  orderId: string;
}

export interface PaymentSession {
  gateway: PaymentGateway;
  reference: string;
  /** URL to redirect the customer to for payment. */
  authorizationUrl: string;
}

const PAYSTACK_API = 'https://api.paystack.co';
const FLUTTERWAVE_API = 'https://api.flutterwave.com/v3';

export async function initializePayment(
  params: InitializePaymentParams
): Promise<PaymentSession> {
  if (params.gateway === 'paystack') {
    return initPaystack(params);
  }
  return initFlutterwave(params);
}

async function initPaystack(
  params: InitializePaymentParams
): Promise<PaymentSession> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error('PAYSTACK_SECRET_KEY is not configured');

  // Paystack amounts are in kobo (NGN * 100).
  const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100),
      currency: 'NGN',
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: { order_id: params.orderId },
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || 'Paystack initialization failed');
  }

  return {
    gateway: 'paystack',
    reference: json.data.reference,
    authorizationUrl: json.data.authorization_url,
  };
}

async function initFlutterwave(
  params: InitializePaymentParams
): Promise<PaymentSession> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) throw new Error('FLUTTERWAVE_SECRET_KEY is not configured');

  const res = await fetch(`${FLUTTERWAVE_API}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: params.reference,
      amount: params.amount.toFixed(2),
      currency: 'NGN',
      redirect_url: params.callbackUrl,
      customer: { email: params.email },
      meta: { order_id: params.orderId },
    }),
  });

  const json = await res.json();
  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Flutterwave initialization failed');
  }

  return {
    gateway: 'flutterwave',
    reference: json.data.tx_ref,
    authorizationUrl: json.data.link,
  };
}

/**
 * Verifies a webhook's paid amount matches the order total.
 * - Paystack sends amount in kobo (integer).
 * - Flutterwave sends amount in NGN (may carry decimals).
 * Tolerates a small float drift from Flutterwave.
 */
export function verifyWebhookAmount(
  gateway: PaymentGateway,
  orderTotal: number,
  webhookAmount: number
): boolean {
  if (gateway === 'paystack') {
    return Math.round(orderTotal * 100) === Math.round(webhookAmount);
  }
  return Math.abs(orderTotal - webhookAmount) < 0.01;
}