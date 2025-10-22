import Stripe from 'stripe'

// Singleton instance
let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }

    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    })
  }

  return stripeClient
}

// Create a payment link for an invoice
export async function createPaymentLink({
  amount,
  currency = 'usd',
  invoiceNumber,
  clientEmail,
  clientName,
  metadata,
}: {
  amount: number // Amount in cents
  currency?: string
  invoiceNumber: string
  clientEmail?: string
  clientName?: string
  metadata?: Record<string, string>
}) {
  const stripe = getStripeClient()

  // Create a price for this invoice
  const price = await stripe.prices.create({
    unit_amount: Math.round(amount),
    currency,
    product_data: {
      name: `Invoice ${invoiceNumber}`,
    },
  })

  // Create payment link
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    after_completion: {
      type: 'redirect',
      redirect: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoiceNumber}/paid`,
      },
    },
    metadata: {
      invoice_number: invoiceNumber,
      ...metadata,
    },
    customer_creation: 'if_required',
    ...(clientEmail && {
      custom_fields: [
        {
          key: 'email',
          label: {
            type: 'custom',
            custom: 'Email',
          },
          type: 'text',
          optional: false,
        },
      ],
    }),
  })

  return paymentLink
}

// Create a payment intent (for custom checkout)
export async function createPaymentIntent({
  amount,
  currency = 'usd',
  invoiceNumber,
  clientEmail,
  metadata,
}: {
  amount: number // Amount in cents
  currency?: string
  invoiceNumber: string
  clientEmail?: string
  metadata?: Record<string, string>
}) {
  const stripe = getStripeClient()

  return await stripe.paymentIntents.create({
    amount: Math.round(amount),
    currency,
    metadata: {
      invoice_number: invoiceNumber,
      ...metadata,
    },
    receipt_email: clientEmail,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret?: string
): Stripe.Event {
  const stripe = getStripeClient()
  const webhookSecret = secret || process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

// Retrieve payment intent
export async function getPaymentIntent(paymentIntentId: string) {
  const stripe = getStripeClient()
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

// Refund a payment
export async function createRefund(paymentIntentId: string, amount?: number) {
  const stripe = getStripeClient()
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amount && { amount: Math.round(amount) }),
  })
}
