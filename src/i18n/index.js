import { createI18n } from 'vue-i18n';
import axios from 'axios';
import api from '../shared/api.json';
import en from './locales/en.json';

async function getDefaultLanguage() {
  try {
    let url = `${api.BASE_URL}/${api.URL_CONFIG_PROPERTY}/public/general/default.locale`;
    let response = await axios.get(url);
    return decodeURIComponent(response.data.propertyValue);
  } catch (error) {
    console.error('Error fetching default language:', error);
    return '';
  }
}

function localeMessageLoaders() {
  const locales = import.meta.glob(['./locales/*.json', '!./locales/en.json'], {
    import: 'default',
  });
  const loaders = { en: async () => en };
  Object.keys(locales).forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\.json$/i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      loaders[locale] = locales[key];
    }
  });
  return loaders;
}

const localeLoaders = localeMessageLoaders();
export const availableLocales = Object.keys(localeLoaders).sort();

function matchLocale(requestedLocale) {
  let exactMatch = availableLocales.find(
    (locale) => requestedLocale === locale,
  );
  if (exactMatch) {
    console.debug(`Matched exact locale ${requestedLocale}`);
    return exactMatch;
  }

  let localeParts = requestedLocale.split('-');
  if (localeParts.length !== 2) {
    console.debug(
      `Found no matching locale for ${requestedLocale}, falling back to en`,
    );
    return 'en';
  }

  let baseLocale = localeParts[0];
  let baseLocaleMatch = availableLocales.find(
    (locale) => baseLocale === locale,
  );
  if (baseLocaleMatch) {
    console.debug(`Matched base locale ${baseLocale} for ${requestedLocale}`);
    return baseLocaleMatch;
  }

  console.debug(
    `Found no matching locale for ${requestedLocale}, falling back to en`,
  );
  return 'en';
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en },
});

getDefaultLanguage().then(async (defaultLanguage) => {
  const matchedLocale = matchLocale(
    (localStorage && localStorage.getItem('Locale')) ||
      defaultLanguage ||
      navigator.language ||
      navigator.userLanguage,
  );
  i18n.global.setLocaleMessage(
    matchedLocale,
    await localeLoaders[matchedLocale](),
  );
  i18n.global.locale.value = matchedLocale;
});

export default i18n;
