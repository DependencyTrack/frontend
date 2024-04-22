import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

function loadLocaleMessages() {
  const locales = require.context(
    './locales',
    true,
    /[A-Za-z0-9-_,\s]+\.json$/i,
  );
  const messages = {};
  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key);
    }
  });
  return messages;
}

const localeMessages = loadLocaleMessages();

function matchLocale(requestedLocale) {
  console.log(localeMessages);
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

const i18n = new VueI18n({
  locale: matchLocale(
    (localStorage && localStorage.getItem('Locale')) ||
      navigator.language ||
      navigator.userLanguage,
  ),
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: localeMessages,
});

export default i18n;
