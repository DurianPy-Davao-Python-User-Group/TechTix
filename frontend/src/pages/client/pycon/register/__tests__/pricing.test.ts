import { describe, expect, it } from 'vitest';
import { Event } from '@/model/events';
import { calculateDiscountedPrice, calculateTotalPrice, getEffectivePrice, roundUpToTwoDecimals } from '../pricing';

describe('PyCon pricing utilities', () => {
  const baseEvent: Event = {
    eventId: 'pycon-2026',
    name: 'PyCon Davao 2026',
    description: 'Python Conference',
    email: 'hello@durianpy.org',
    startDate: '2026-10-17',
    endDate: '2026-10-18',
    venue: 'Davao City',
    paidEvent: true,
    price: 1500,
    status: 'open',
    bannerLink: null,
    logoLink: null,
    certificateTemplate: null,
    isLimitedSlot: false,
    isApprovalFlow: false,
    registrationCount: 0,
    maximumSlots: null,
    hasMultipleTicketTypes: true,
    platformFee: 0.05,
    sprintDay: true,
    sprintDayPrice: 200,
    sprintDayRegistrationCount: 0,
    maximumSprintDaySlots: 100,
    ticketTypes: [
      {
        id: 'coder',
        name: 'Coder Ticket',
        description: null,
        tier: '1',
        originalPrice: null,
        price: 2500,
        maximumQuantity: 100,
        currentSales: 10
      },
      {
        id: 'kasosyo',
        name: 'Kasosyo Ticket',
        description: null,
        tier: '2',
        originalPrice: null,
        price: 5000,
        maximumQuantity: 50,
        currentSales: 5
      }
    ]
  };

  describe('getEffectivePrice', () => {
    it('returns the matched ticket price when ticketType is selected', () => {
      expect(getEffectivePrice(baseEvent, 'coder')).toBe(2500);
      expect(getEffectivePrice(baseEvent, 'kasosyo')).toBe(5000);
    });

    it('falls back to event.price when ticketType does not match', () => {
      expect(getEffectivePrice(baseEvent, 'non-existent')).toBe(1500);
    });

    it('falls back to event.price when ticketType is null or undefined', () => {
      expect(getEffectivePrice(baseEvent, null)).toBe(1500);
      expect(getEffectivePrice(baseEvent, undefined)).toBe(1500);
    });

    it('falls back to event.price when event has no ticketTypes', () => {
      const eventNoTickets: Event = { ...baseEvent, ticketTypes: null };
      expect(getEffectivePrice(eventNoTickets, 'coder')).toBe(1500);
    });
  });

  describe('calculateTotalPrice with effectivePrice', () => {
    it('correctly calculates total using ticket price', () => {
      const effectivePrice = getEffectivePrice(baseEvent, 'coder');
      const total = calculateTotalPrice({
        price: effectivePrice,
        sprintDayPrice: 200,
        transactionFee: 50,
        discountPercentage: 0.1,
        platformFee: 0.05
      });

      // discountedPrice = 2500 * 0.9 = 2250
      // platformFeePrice = 2500 * 0.05 = 125
      // sprintDayPrice = 200
      // transactionFee = 50
      // total = 2250 + 50 + 125 + 200 = 2625
      expect(total).toBe(2625);
    });

    it('calculates 0 total for 100% discount without sprint day or fees', () => {
      const effectivePrice = getEffectivePrice(baseEvent, 'coder');
      const total = calculateTotalPrice({
        price: effectivePrice,
        sprintDayPrice: 0,
        transactionFee: 0,
        discountPercentage: 1,
        platformFee: 0
      });

      expect(total).toBe(0);
    });
  });
});
