import { createI18n } from 'vue-i18n';
import axios from 'axios';

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

function loadLocaleMessages() {
  // import default is needed otherwise 404 will be missing as well as it won't be the raw json reference
  const locales = import.meta.glob('./locales/*.json', {
    eager: true,
    import: 'default',
  });
  const messages = {};
  for (const [path, locale] of Object.entries(locales)) {
    const matched = path.match(/\/locales\/([A-Za-z0-9-_]+)\.json$/);

    if (matched && matched.length > 1) {
      const localeKey = matched[1];
      messages[localeKey] = locale;
    }
  }
  return messages;
}

const localeMessages = loadLocaleMessages();

function matchLocale(requestedLocale) {
  let exactMatch = Object.keys(localeMessages).find(
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
  let baseLocaleMatch = Object.keys(localeMessages).find(
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
  locale: 'en',
  fallbackLocale: import.meta.env.VITE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: localeMessages,
});

getDefaultLanguage().then((defaultLanguage) => {
  const matchedLocale = matchLocale(
    (localStorage && localStorage.getItem('Locale')) ||
      defaultLanguage ||
      navigator.language ||
      navigator.userLanguage,
  );
  i18n.locale = matchedLocale;
});

export default i18n;
