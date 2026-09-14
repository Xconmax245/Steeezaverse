// Payment gateway abstraction — Paystack only, NGN only.
// NOTE: We call the REST API directly with fetch rather than the installed
// `paystack` npm wrapper on purpose: that package is callback-based, unmaintained
// (depends on the deprecated `request` lib), and has no clean initialize
// endpoint. Keep using fetch here — do not "fix" this back to the SDK without a
// real reason.

export type PaymentGateway = 'paystack';

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

export async function initializePayment(
  params: InitializePaymentParams
): Promise<PaymentSession> {
  return initPaystack(params);
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

/**
 * Verifies a webhook's paid amount matches the order total.
 * Paystack sends amount in kobo (integer).
 */
export function verifyWebhookAmount(
  gateway: PaymentGateway,
  orderTotal: number,
  webhookAmount: number
): boolean {
  return Math.round(orderTotal * 100) === Math.round(webhookAmount);
}