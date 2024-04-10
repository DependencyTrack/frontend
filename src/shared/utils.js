import common from '@/shared/common';
import flexVerCompare from 'flexver/dist/module';

export function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

/**
 * Provides a function to extract a param from the querystring.
 */
export function getUrlVar(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * retrieves the redirect to url from query param but only if it save for redirection
 * @param {Router} router
 * @returns {string} redirect to url if it save for redirection
 */
export function getRedirectUrl(router) {
  return router.currentRoute.query.redirect &&
    isUrlSaveForRedirect(router.currentRoute.query.redirect)
    ? router.currentRoute.query.redirect
    : undefined;
}

// An array of acceptable root context paths defined in the UI.
const acceptableRootContextPaths = [
  '/dashboard',
  '/projects',
  '/components',
  '/services',
  '/vulnerabilities',
  '/licenses',
  '/policy',
  '/admin',
  '/project',
  '/component',
  '/vulnerability',
  '/license',
  '/vulnerabilityAudit',
  '/policyViolationAudit',
  '/login',
  '/change-password',
];

/**
 * checks if the given url is save for redirecting.
 * @param {string} redirectUrl the url to check.
 * @returns {Boolean}
 */
export function isUrlSaveForRedirect(redirectUrl) {
  const contextRoot = getContextPath();
  try {
    const resultingUrl = new URL(redirectUrl, window.location.origin);
    return (
      resultingUrl.origin === window.location.origin && // catches redirectUrls like //foo.bar
      /^https?:$/.test(resultingUrl.protocol) && // catches file and blob protocol because for "blob:https://mozilla.org" origin will be returned as "https://mozilla.org".
      acceptableRootContextPaths
        .map((r) => contextRoot + r)
        .some((p) => redirectUrl.startsWith(p))
    );
  } catch (invalidUrl) {
    return false;
  }
}

/**
 * Returns the context from which the webapp is running.
 */
export function getContextPath() {
  if (
    acceptableRootContextPaths.some((p) =>
      window.location.pathname.startsWith(p),
    )
  ) {
    // App is deployed in the root context. Return an empty string.
    return '';
  } else {
    // App is deployed in a non-root context. Return the context.
    return window.location.pathname.substring(
      0,
      window.location.pathname.indexOf('/', 2),
    );
  }
}

export function loadUserPreferencesForBootstrapTable(_this, id, columns) {
  const table = _this.$refs.table;
  if (!table) {
    console.error(
      "No table defined in the calling component; Can't apply user preferences",
    );
    return;
  }

  columns.forEach((column) => {
    const isVisible = column.visible;
    const shouldShow =
      localStorage &&
      localStorage.getItem(id + 'Show' + common.capitalize(column.field)) !==
        null
        ? localStorage.getItem(
            id + 'Show' + common.capitalize(column.field),
          ) === 'true'
        : isVisible;
    if (isVisible !== shouldShow) {
      if (shouldShow) {
        table.showColumn(column.field);
      } else {
        table.hideColumn(column.field);
      }
    }
  });
}

export function compareVersions(v1, v2) {
  if (!v1) {
    return 1;
  }
  if (!v2) {
    return -1;
  }
  if (v1.toLowerCase().startsWith('v')) {
    v1 = v1.substring(1);
  }
  if (v2 && v2.toLowerCase().startsWith('v')) {
    v2 = v2.substring(1);
  }
  let v1parts = v1.split(':');
  let v2parts = v2.split(':');
  if (v1parts.length > 1 || v2parts.length > 1) {
    return compareEpochVersions(v1parts, v2parts);
  }
  return flexVerCompare(v1, v2);
}

function compareEpochVersions(v1parts, v2parts) {
  // compare epoch
  let v1epoch = v1parts.length > 1 ? v1parts[0] : '0';
  let v1version = v1parts.length > 1 ? v1parts[1] : v1parts[0];
  let v2epoch = v2parts.length > 1 ? v2parts[0] : '0';
  let v2version = v2parts.length > 1 ? v2parts[1] : v2parts[0];
  let epochCompare = flexVerCompare(v1epoch, v2epoch);
  if (epochCompare == 0) {
    return flexVerCompare(v1version, v2version);
  } else {
    return epochCompare;
  }
}
