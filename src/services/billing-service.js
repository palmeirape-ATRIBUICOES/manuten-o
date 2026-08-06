/* ==========================================================================
   BILLING SERVICE - GATEWAY-AGNOSTIC PAYMENT ABSTRACTION LAYER
   (PREPARED FOR MERCADO PAGO, ASAAS, STRIPE & WEBHOOK INTEGRATION)
   ========================================================================== */

import { subscriptionService } from './subscription-service.js';

const STORAGE_KEY_PAYMENTS = 'saas_asset_payment_history_db';

class BillingService {

  getPaymentHistory(tenantId) {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY_PAYMENTS) || '[]');
    return history.filter(p => p.tenantId === tenantId);
  }

  // Gateway Simulation (Mercado Pago / Asaas / Stripe)
  processSubscriptionPayment({ tenantId, planId, billingCycle, paymentMethod, cardDetails }) {
    const sub = subscriptionService.getTenantSubscription(tenantId);
    const plan = subscriptionService.getPlanDetails(planId);

    const amount = billingCycle === 'YEARLY' ? plan.priceYearly : plan.priceMonthly;
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Simulate successful payment record
    const paymentRecord = {
      id: `pay-${Date.now()}`,
      tenantId: tenantId,
      subscriptionId: sub.id,
      gateway: "MERCADO_PAGO", // Mercado Pago, Asaas, Stripe
      transactionId: transactionId,
      amount: amount,
      billingCycle: billingCycle,
      status: "APPROVED", // APPROVED, PENDING, REFUSED
      paidAt: new Date().toISOString(),
      cardBrand: "Mastercard",
      last4Digits: cardDetails ? cardDetails.number.slice(-4) : "4421"
    };

    const history = JSON.parse(localStorage.getItem(STORAGE_KEY_PAYMENTS) || '[]');
    history.unshift(paymentRecord);
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(history));

    // Upgrade Tenant Subscription Status to Active
    subscriptionService.upgradePlan(tenantId, planId);

    return paymentRecord;
  }

  // Webhook Event Processor Simulator (e.g. payment_intent.succeeded)
  handleWebhookEvent(gatewayName, eventType, payload) {
    console.log(`[Billing Webhook] Recebido webhook do gateway ${gatewayName}: ${eventType}`, payload);

    if (eventType === 'payment.approved' || eventType === 'invoice.paid') {
      const { tenantId, planId } = payload;
      subscriptionService.upgradePlan(tenantId, planId);
      return { status: "processed", action: "subscription_renewed" };
    }

    return { status: "ignored" };
  }
}

export const billingService = new BillingService();
