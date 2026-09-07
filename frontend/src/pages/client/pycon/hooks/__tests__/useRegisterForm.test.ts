import { describe, it, expect } from 'vitest';
import { REGISTER_FIELDS, isMatchingStoredEmail, isTicketAvailable } from '../useRegisterForm';
import { TicketType } from '@/model/events';

describe('REGISTER_FIELDS mapping', () => {
  it('contains the correct active fields for BasicInfo step', () => {
    expect(REGISTER_FIELDS.BasicInfo).toEqual([
      'firstName',
      'lastName',
      'nickname',
      'pronouns',
      'contactNumber',
      'organization',
      'jobTitle',
      'facebookLink',
      'linkedInLink'
    ]);
  });

  it('excludes email and unused socials from BasicInfo step', () => {
    expect(REGISTER_FIELDS.BasicInfo).not.toContain('email');
    expect(REGISTER_FIELDS.BasicInfo).not.toContain('middleName');
    expect(REGISTER_FIELDS.BasicInfo).not.toContain('github');
    expect(REGISTER_FIELDS.BasicInfo).not.toContain('xTwitter');
  });
});

describe('isMatchingStoredEmail', () => {
  it('returns true when stored email matches current user email exactly', () => {
    expect(isMatchingStoredEmail('user@durianpy.org', 'user@durianpy.org')).toBe(true);
  });

  it('returns true for case-insensitive and trimmed email match', () => {
    expect(isMatchingStoredEmail('  User@DurianPy.org  ', 'user@durianpy.org')).toBe(true);
    expect(isMatchingStoredEmail('user@durianpy.org', 'USER@DURIANPY.ORG ')).toBe(true);
  });

  it('returns false when emails differ', () => {
    expect(isMatchingStoredEmail('other@durianpy.org', 'user@durianpy.org')).toBe(false);
  });

  it('returns false when either email is null, undefined, or empty', () => {
    expect(isMatchingStoredEmail('', 'user@durianpy.org')).toBe(false);
    expect(isMatchingStoredEmail('user@durianpy.org', '')).toBe(false);
    expect(isMatchingStoredEmail(null, 'user@durianpy.org')).toBe(false);
    expect(isMatchingStoredEmail('user@durianpy.org', undefined)).toBe(false);
    expect(isMatchingStoredEmail(undefined, undefined)).toBe(false);
  });
});

describe('isTicketAvailable', () => {
  const baseTicket: TicketType = {
    id: 'coder',
    name: 'Coder',
    description: null,
    tier: 'standard',
    originalPrice: null,
    price: 500,
    maximumQuantity: 100,
    currentSales: 50
  };

  it('returns true when current sales is less than maximumQuantity', () => {
    expect(isTicketAvailable(baseTicket)).toBe(true);
  });

  it('returns false when current sales reaches or exceeds maximumQuantity (sold out)', () => {
    expect(isTicketAvailable({ ...baseTicket, currentSales: 100 })).toBe(false);
    expect(isTicketAvailable({ ...baseTicket, currentSales: 105 })).toBe(false);
  });

  it('returns true when maximumQuantity is 0 or null (unlimited slots)', () => {
    expect(isTicketAvailable({ ...baseTicket, maximumQuantity: 0, currentSales: 50 })).toBe(true);
  });

  it('returns false when ticket is null or undefined', () => {
    expect(isTicketAvailable(null)).toBe(false);
    expect(isTicketAvailable(undefined)).toBe(false);
  });
});
