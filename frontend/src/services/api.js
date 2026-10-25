// In development Vite proxies /api to the backend. In production set VITE_API_URL.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const FALLBACK = 'We could not send your submission. Please try again later.';

export class ApiError extends Error {
  constructor(message, fieldErrors) {
    super(message);
    this.fieldErrors = fieldErrors || null;
  }
}

async function request(path, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, signal: controller.signal });
  } catch (err) {
    throw new ApiError(
      err.name === 'AbortError'
        ? 'The request took too long. Please try again.'
        : 'We could not reach the server. Check your connection and try again.'
    );
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  // Success only counts when the backend itself says so.
  if (!res.ok || !data || data.success !== true) {
    throw new ApiError(data?.message || FALLBACK, data?.errors);
  }
  return data;
}

export function submitContact(values) {
  return request('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
}

export function submitApplication(formData) {
  // Do not set Content-Type: the browser adds the multipart boundary.
  return request('/api/careers/apply', { method: 'POST', body: formData });
}
