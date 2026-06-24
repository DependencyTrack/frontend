export const BANNER_DISMISSED_KEY = 'banner-dismissed';

export const BANNER_CONFIG_GROUP = 'banner';
export const BANNER_CONFIG_PROPERTY = 'config';

export function getBannerConfigUrl(api) {
  return `${api.BASE_URL}/${api.URL_CONFIG_PROPERTY}/internal/${BANNER_CONFIG_GROUP}/${BANNER_CONFIG_PROPERTY}`;
}

export function buildExampleBannerTemplate() {
  return `<div style="background:#321FDB;color:#fff;padding:0.5rem 1rem;border-bottom:1px solid rgba(0,0,0,.2);font-size:1rem;line-height:1.5;text-align:center">
  <strong>Example:</strong> <span>Your HTML-Banner Text</span>
</div>
    `;
}

export function parseBannerConfigFromProperty(response) {
  const propertyValue = response?.data?.propertyValue;
  if (!propertyValue) {
    return null;
  }
  try {
    return JSON.parse(propertyValue);
  } catch (error) {
    console.error('Failed to parse banner config:', error);
    return null;
  }
}

export function serializeBannerConfig(bannerConfig) {
  return JSON.stringify(bannerConfig);
}
