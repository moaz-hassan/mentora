import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET;
if (!stripeSecret) {
  console.warn('Warning: STRIPE_SECRET is not configured. Stripe features will be disabled.');
}

const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

export const createPaymentIntent = async ({ amount, currency = 'USD', metadata = {} }) => {
  if (!stripe) throw new Error('Stripe not configured');

  const amountInCents = Math.round(Number(amount) * 100);

  const intent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: (currency || 'USD').toLowerCase(),
    metadata,
    automatic_payment_methods: { enabled: true },
  });

  return intent;
};

export const constructEvent = (rawBody, signature) => {
  if (!stripe) throw new Error('Stripe not configured');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
};
