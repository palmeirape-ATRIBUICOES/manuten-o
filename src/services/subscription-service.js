/* ==========================================================================
   SUBSCRIPTION SERVICE - 30-DAY TRIAL ENGINE, EXPIRATION LOCK & BILLING STATUS
   ========================================================================== */

import { TRIAL_CONFIG, SAAS_PLANS } from '../config/plans.js';

const STORAGE_KEY_SUBSCRIPTIONS = 'saas_asset_subscriptions_db';

class SubscriptionService {

  getTenantSubscription(tenantId) {
    const subscriptions = JSON.parse(localStorage.getItem(STORAGE_KEY_SUBSCRIPTIONS) || '[]');
    let sub = subscriptions.find(s => s.tenantId === tenantId);

    if (!sub) {
      // Default fallback trial
      const now = new Date();
      const trialEnds = new Date(now.getTime() + TRIAL_CONFIG.durationDays * 24 * 60 * 60 * 1000);
      sub = {
        id: `sub-${Date.now()}`,
        tenantId: tenantId,
        planId: TRIAL_CONFIG.defaultPlanId,
        subscriptionStatus: "trial",
        trialStartedAt: now.toISOString(),
        trialEndsAt: trialEnds.toISOString(),
        subscriptionStartedAt: null,
        subscriptionEndsAt: null,
        accessStatus: "FULL_ACCESS"
      };
      subscriptions.push(sub);
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(subscriptions));
    }

    return this.evaluateSubscriptionState(sub);
  }

  evaluateSubscriptionState(sub) {
    const now = new Date();
    const trialEnds = new Date(sub.trialEndsAt);

    // Calculate remaining days
    const diffTime = trialEnds.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    sub.remainingDays = remainingDays > 0 ? remainingDays : 0;

    // Check if trial is active vs expired
    if (sub.subscriptionStatus === 'trial') {
      if (remainingDays <= 0) {
        sub.subscriptionStatus = 'expired';
        sub.accessStatus = 'READ_ONLY';
        this.updateSubscription(sub);
      } else {
        sub.accessStatus = 'FULL_ACCESS';
      }
    } else if (sub.subscriptionStatus === 'active') {
      sub.accessStatus = 'FULL_ACCESS';
    } else if (sub.subscriptionStatus === 'expired' || sub.subscriptionStatus === 'blocked') {
      sub.accessStatus = 'READ_ONLY';
    }

    return sub;
  }

  updateSubscription(updatedSub) {
    const subscriptions = JSON.parse(localStorage.getItem(STORAGE_KEY_SUBSCRIPTIONS) || '[]');
    const index = subscriptions.findIndex(s => s.tenantId === updatedSub.tenantId);
    if (index !== -1) {
      subscriptions[index] = updatedSub;
      localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(subscriptions));
    }
  }

  upgradePlan(tenantId, newPlanId) {
    const sub = this.getTenantSubscription(tenantId);
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    sub.planId = newPlanId;
    sub.subscriptionStatus = 'active';
    sub.subscriptionStartedAt = now.toISOString();
    sub.subscriptionEndsAt = nextMonth.toISOString();
    sub.accessStatus = 'FULL_ACCESS';

    this.updateSubscription(sub);
    return sub;
  }

  getPlanDetails(planId) {
    return SAAS_PLANS.find(p => p.id === planId) || SAAS_PLANS[1];
  }

  isAccessBlocked(tenantId) {
    const sub = this.getTenantSubscription(tenantId);
    return sub.accessStatus === 'READ_ONLY' || sub.subscriptionStatus === 'expired' || sub.subscriptionStatus === 'blocked';
  }

  getTrialBannerConfig(sub) {
    if (sub.subscriptionStatus !== 'trial') return null;

    const days = sub.remainingDays;
    let badgeClass = 'badge-info';
    let messageStyle = 'background-color: #eff6ff; border-color: #bfdbfe; color: #1e40af;';

    if (days <= TRIAL_CONFIG.warningThresholdsDays.highlightRed) {
      badgeClass = 'badge-danger';
      messageStyle = 'background-color: #fef2f2; border-color: #fecaca; color: #991b1b; font-weight: 700;';
    } else if (days <= TRIAL_CONFIG.warningThresholdsDays.highlightOrange) {
      badgeClass = 'badge-warning';
      messageStyle = 'background-color: #fff7ed; border-color: #ffedd5; color: #c2410c; font-weight: 700;';
    } else if (days <= TRIAL_CONFIG.warningThresholdsDays.highlightYellow) {
      badgeClass = 'badge-warning';
      messageStyle = 'background-color: #fefce8; border-color: #fef08a; color: #a16207; font-weight: 600;';
    }

    return {
      days: days,
      badgeClass: badgeClass,
      messageStyle: messageStyle,
      text: days === 1 ? "Último dia do seu teste gratuito! O acesso será limitado ao final do período." : `Você está utilizando o período gratuito. Restam ${days} dias.`
    };
  }
}

export const subscriptionService = new SubscriptionService();
