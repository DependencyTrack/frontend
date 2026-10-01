import {
  BANNER_CONFIG_GROUP,
  BANNER_CONFIG_PROPERTY,
  BANNER_DISMISSED_KEY,
  buildExampleBannerTemplate,
  getBannerConfigUrl,
  parseBannerConfigFromProperty,
  serializeBannerConfig,
} from '@/shared/bannerConfig';

describe('shared/bannerConfig', () => {
  describe('constants', () => {
    it('names the dismissal storage key', () => {
      expect(BANNER_DISMISSED_KEY).toBe('banner-dismissed');
    });

    it('names the config property group and key', () => {
      expect(BANNER_CONFIG_GROUP).toBe('banner');
      expect(BANNER_CONFIG_PROPERTY).toBe('config');
    });
  });

  describe('getBannerConfigUrl', () => {
    it('builds the internal config property URL', () => {
      const url = getBannerConfigUrl({
        BASE_URL: 'https://dt.example.com',
        URL_CONFIG_PROPERTY: 'api/v1/configProperty',
      });

      expect(url).toBe(
        'https://dt.example.com/api/v1/configProperty/internal/banner/config',
      );
    });

    it('builds a relative URL when the base URL is empty', () => {
      const url = getBannerConfigUrl({
        BASE_URL: '',
        URL_CONFIG_PROPERTY: 'api/v1/configProperty',
      });

      expect(url).toBe('/api/v1/configProperty/internal/banner/config');
    });
  });

  describe('buildExampleBannerTemplate', () => {
    it('returns an example banner marked as such', () => {
      expect(buildExampleBannerTemplate()).toContain(
        '<strong>Example:</strong>',
      );
    });
  });

  describe('parseBannerConfigFromProperty', () => {
    it('parses the property value', () => {
      const response = {
        data: { propertyValue: '{"enabled":true,"template":"<b>hi</b>"}' },
      };

      expect(parseBannerConfigFromProperty(response)).toEqual({
        enabled: true,
        template: '<b>hi</b>',
      });
    });

    it.each([
      ['an empty property value', { data: { propertyValue: '' } }],
      ['a response without a property value', { data: {} }],
      ['a response without data', {}],
      ['an undefined response', undefined],
      ['a null response', null],
    ])('returns null for %s', (_label, response) => {
      expect(parseBannerConfigFromProperty(response)).toBeNull();
    });

    it('returns null and logs for malformed JSON', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      expect(
        parseBannerConfigFromProperty({
          data: { propertyValue: '{not json' },
        }),
      ).toBeNull();
      expect(consoleError).toHaveBeenCalledTimes(1);
    });
  });

  describe('serializeBannerConfig', () => {
    it('round-trips through parseBannerConfigFromProperty', () => {
      const config = { enabled: true, template: '<b>hi</b>' };

      const parsed = parseBannerConfigFromProperty({
        data: { propertyValue: serializeBannerConfig(config) },
      });

      expect(parsed).toEqual(config);
    });
  });
});
