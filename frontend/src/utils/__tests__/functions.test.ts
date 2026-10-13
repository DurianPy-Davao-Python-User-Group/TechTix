import { describe, expect, it } from 'vitest';
import { isPresignedUrlExpired } from '../functions';

describe('isPresignedUrlExpired', () => {
  it('returns true for null or empty url', () => {
    expect(isPresignedUrlExpired(null)).toBe(true);
    expect(isPresignedUrlExpired(undefined)).toBe(true);
    expect(isPresignedUrlExpired('')).toBe(true);
  });

  it('correctly detects an expired AWS SigV4 URL', () => {
    // Amz date in 2020 with 900 seconds expiry (definitely in the past)
    const expiredUrl = 'https://my-bucket.s3.amazonaws.com/test.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20200101T000000Z&X-Amz-Expires=900';
    expect(isPresignedUrlExpired(expiredUrl)).toBe(true);
  });

  it('correctly detects a future AWS SigV4 URL that is NOT expired', () => {
    // Amz date in the far future
    const futureDate = new Date(Date.now() + 3600 * 1000).toISOString().replace(/[:-]/g, '').replace(/\..+/, 'Z');
    const validUrl = `https://my-bucket.s3.amazonaws.com/test.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=${futureDate}&X-Amz-Expires=900`;
    expect(isPresignedUrlExpired(validUrl)).toBe(false);
  });

  it('correctly detects an expired SigV2 URL using Expires param', () => {
    // Unix timestamp 1000 seconds in the past
    const pastExpires = Math.floor(Date.now() / 1000) - 1000;
    const expiredUrl = `https://my-bucket.s3.amazonaws.com/test.png?AWSAccessKeyId=AKIAIOSFODNN7EXAMPLE&Expires=${pastExpires}`;
    expect(isPresignedUrlExpired(expiredUrl)).toBe(true);
  });

  it('correctly detects a valid SigV2 URL in the future', () => {
    const futureExpires = Math.floor(Date.now() / 1000) + 3600;
    const validUrl = `https://my-bucket.s3.amazonaws.com/test.png?AWSAccessKeyId=AKIAIOSFODNN7EXAMPLE&Expires=${futureExpires}`;
    expect(isPresignedUrlExpired(validUrl)).toBe(false);
  });

  it('returns false for generic URLs without presigned expiration params', () => {
    expect(isPresignedUrlExpired('https://example.com/image.png')).toBe(false);
  });
});
