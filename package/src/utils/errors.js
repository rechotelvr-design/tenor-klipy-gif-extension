export function isPlaceholderKey(value) {
  if (!value) return true;
  return value.includes('YOUR_') || value.includes('demo') || value.includes('example');
}

export function getErrorMessage(error) {
  if (!error) return 'An unknown error occurred.';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return 'Something went wrong while loading GIFs.';
}

export function createProviderError(provider, reason) {
  return new Error(`${provider}: ${reason}`);
}
