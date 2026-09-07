import { describe, expect, it } from 'vitest';
import { Event } from '@/model/events';
import { calculateDiscountedPrice, calculateTotalPrice, getEffectivePrice, getOriginalPrice, roundUpToTwoDecimals } from '../pricing';

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

  const saleEvent: Event = {
    ...baseEvent,
    ticketTypes: [
      {
        id: 'coder',
        name: 'Coder Ticket (Early Bird Sale)',
        description: null,
        tier: '1',
        originalPrice: 3000,
        price: 2000,
        maximumQuantity: 100,
        currentSales: 10
      },
      {
        id: 'kasosyo',
        name: 'Kasosyo Ticket',
        description: null,
        tier: '2',
        originalPrice: 6000,
        price: 4500,
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

    it('returns the discounted sale price (not originalPrice) when a ticket is on sale', () => {
      expect(getEffectivePrice(saleEvent, 'coder')).toBe(2000);
      expect(getEffectivePrice(saleEvent, 'kasosyo')).toBe(4500);
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

  describe('getOriginalPrice', () => {
    it('returns originalPrice when ticket has an original price', () => {
      expect(getOriginalPrice(saleEvent, 'coder')).toBe(3000);
      expect(getOriginalPrice(saleEvent, 'kasosyo')).toBe(6000);
    });

    it('returns null when ticket originalPrice is null or not set', () => {
      expect(getOriginalPrice(baseEvent, 'coder')).toBeNull();
    });

    it('returns null when ticket does not match or ticketType is null/undefined', () => {
      expect(getOriginalPrice(saleEvent, 'non-existent')).toBeNull();
      expect(getOriginalPrice(saleEvent, null)).toBeNull();
      expect(getOriginalPrice(saleEvent, undefined)).toBeNull();
    });

    it('returns null when event has no ticketTypes', () => {
      const eventNoTickets: Event = { ...baseEvent, ticketTypes: null };
      expect(getOriginalPrice(eventNoTickets, 'coder')).toBeNull();
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

    it('correctly calculates total using sale price when ticket is on sale', () => {
      const effectivePrice = getEffectivePrice(saleEvent, 'coder'); // 2000, not 3000
      const total = calculateTotalPrice({
        price: effectivePrice,
        sprintDayPrice: 0,
        transactionFee: 0,
        discountPercentage: 0,
        platformFee: 0
      });

      expect(total).toBe(2000);
    });

    it('correctly applies promotional discount code on top of ticket sale price', () => {
      const effectivePrice = getEffectivePrice(saleEvent, 'coder'); // 2000
      const total = calculateTotalPrice({
        price: effectivePrice,
        sprintDayPrice: 0,
        transactionFee: 0,
        discountPercentage: 0.2, // 20% off the sale price
        platformFee: 0
      });

      // 2000 * 0.8 = 1600
      expect(total).toBe(1600);
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
