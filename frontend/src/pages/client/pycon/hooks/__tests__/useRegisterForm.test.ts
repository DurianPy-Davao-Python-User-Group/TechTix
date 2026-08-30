import { describe, it, expect } from 'vitest';
import { REGISTER_FIELDS } from '../useRegisterForm';

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
