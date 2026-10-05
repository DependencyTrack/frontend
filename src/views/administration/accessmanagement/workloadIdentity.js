export const PROVIDER_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;
export const SUBJECT_PATTERN = /^[^*]+(?:[:/]\*)?$/;
export const MIN_SESSION_LIFETIME_SECONDS = 60;
export const MAX_SESSION_LIFETIME_SECONDS = 86400;

export function isValidSessionLifetime(seconds) {
  return (
    Number.isInteger(seconds) &&
    seconds >= MIN_SESSION_LIFETIME_SECONDS &&
    seconds <= MAX_SESSION_LIFETIME_SECONDS
  );
}

export function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch (e) {
    return false;
  }
}

export function parseJwks(value) {
  try {
    const jwks = JSON.parse(value);
    return jwks && Array.isArray(jwks.keys) && jwks.keys.length > 0
      ? jwks
      : null;
  } catch (e) {
    return null;
  }
}
