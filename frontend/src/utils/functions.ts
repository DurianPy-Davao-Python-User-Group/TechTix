export const arraysEqual = (arrayA: any[], arrayB: any[]) => {
  return Array.isArray(arrayA) && Array.isArray(arrayB) && arrayA.length === arrayB.length && arrayA.every((value, index) => value === arrayB[index]);
};

export const deepEqual = <T extends { [_: string]: any }>(a: T, b: T) => {
  if (a === b) {
    return true;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
    return a === b;
  }

  if (a === null || a === undefined || b === null || b === undefined) {
    return false;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  aKeys.sort();
  bKeys.sort();
  for (let i = 0; i < aKeys.length; i++) {
    if (aKeys[i] !== bKeys[i]) {
      return false;
    }

    const key = aKeys[i];
    if (!deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return typeof a === typeof b;
};

export const isEmpty = (value: any) => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  if (typeof value === 'function') {
    return value.toString().trim() === 'function() {}';
  }

  return false;
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const formatMoney = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

export const formatPercentage = (float: number) => {
  return `${(float * 100).toFixed(2)}%`;
};

export const isValidContactNumber = (value: string) => {
  if (value.trim() === '') {
    return true;
  }

  const phoneNumberPattern = /^\d{11}$/;
  return phoneNumberPattern.test(value);
};

export const getPathFromUrl = (url: string) => {
  return url.split('?')[0];
};

export const baseUrl = getPathFromUrl(window.location.href);

export const reloadPage = () => {
  window.location.href = window.location.origin + window.location.pathname;
};

export const scrollToView = () => {
  const viewportHeight = window.innerHeight;
  const scrollAmount = viewportHeight * 0.2;
  window.scrollTo({ top: scrollAmount, behavior: 'smooth' });
};

export const downloadFile = (fileLink: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = fileLink;
  link.download = fileName;

  link.click();
};

export const decodeObjectKeys = (objectKey: string) => `${decodeURIComponent(objectKey?.split('/').pop() ?? '')}`;

export const hasOnlyValidKeys = (obj: unknown, validKeys: string[]): obj is Record<string, unknown> => {
  if (typeof obj !== 'object' || obj === null) return false;
  return Object.keys(obj).every((key) => validKeys.includes(key));
};

export const isPresignedUrlExpired = (url?: string | null, bufferSeconds = 30): boolean => {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    const amzDate = parsed.searchParams.get('X-Amz-Date');
    const amzExpires = parsed.searchParams.get('X-Amz-Expires');

    if (amzDate && amzExpires) {
      const year = parseInt(amzDate.substring(0, 4), 10);
      const month = parseInt(amzDate.substring(4, 6), 10) - 1;
      const day = parseInt(amzDate.substring(6, 8), 10);
      const hour = parseInt(amzDate.substring(9, 11), 10);
      const min = parseInt(amzDate.substring(11, 13), 10);
      const sec = parseInt(amzDate.substring(13, 15), 10);

      const creationTimeMs = Date.UTC(year, month, day, hour, min, sec);
      const durationMs = parseInt(amzExpires, 10) * 1000;
      const expirationTimeMs = creationTimeMs + durationMs;

      return Date.now() >= expirationTimeMs - bufferSeconds * 1000;
    }

    const expires = parsed.searchParams.get('Expires');
    if (expires) {
      const expirationTimeMs = parseInt(expires, 10) * 1000;
      return Date.now() >= expirationTimeMs - bufferSeconds * 1000;
    }
  } catch {
    // If not a valid URL
  }
  return false;
};
