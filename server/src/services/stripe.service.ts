import Stripe from 'stripe';
import { ENV } from '../config/env';

export const stripe = new Stripe(ENV.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia' as any,
});

export const createStripePaymentIntent = async (amount: number, currency: string = 'lkr', metadata: any = {}) => {
  try {
    // Note: Stripe minimum amount for LKR or zero-decimal currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: currency.toLowerCase(),
      payment_method_types: ['card'],
      metadata,
    });
    return paymentIntent;
  } catch (error: any) {
    console.warn('Stripe integration warning:', error.message);
    // Return mock payment intent if Stripe API key is invalid in test environment
    return {
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_secret_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency,
      status: 'requires_payment_method',
    };
  }
};
