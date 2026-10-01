import { createTranslateStub } from '../support/i18n';

// Stands in for `@/i18n`. The real module uses webpack's require.context() to
// load the locale files and issues an HTTP request for the default locale at
// import time; neither survives outside the webpack build.
//
// `t` and `$t` are the same stub instance on purpose: src/shared/utils.js calls
// `i18n.t(...)` on the imported instance, while the formatter factories in
// src/shared/common.js call `i18n.$t(...)` on whatever object they are handed.
const translate = createTranslateStub();

export default {
  t: translate,
  $t: translate,
  te: () => true,
  locale: 'en',
  fallbackLocale: 'en',
};
