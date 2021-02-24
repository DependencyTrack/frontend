export function random (min, max) {
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
  return (new URLSearchParams(window.location.search)).get(name);
}

/**
 * retrieves the redirect to url from query param but only if it save for redirection
 * @param {Router} router
 * @returns {string} redirect to url if it save for redirection
 */
export function getRedirectUrl(router) {
  return router.currentRoute.query.redirect && isUrlSaveForRedirect(router.currentRoute.query.redirect) ? router.currentRoute.query.redirect : undefined;
}

// An array of acceptable root context paths defined in the UI.
const acceptableRootContextPaths = [
    '/dashboard', '/projects', '/components', '/services', '/vulnerabilities', '/licenses', '/policy', '/admin',
    '/project', '/component', '/vulnerability', '/license', '/login', '/change-password'
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
    return resultingUrl.origin === window.location.origin // catches redirectUrls like //foo.bar
            && /^https?:$/.test(resultingUrl.protocol) // catches file and blob protocol because for "blob:https://mozilla.org" origin will be returned as "https://mozilla.org".
            && acceptableRootContextPaths.map(r => contextRoot + r).some(p => redirectUrl.startsWith(p));
  } catch(invalidUrl) {
    return false;
  }
}

/**
 * Returns the context from which the webapp is running.
 */
export function getContextPath() {
  if (acceptableRootContextPaths.some(p => window.location.pathname.startsWith(p))) {
    // App is deployed in the root context. Return an empty string.
    return "";
  } else {
    // App is deployed in a non-root context. Return the context.
    return window.location.pathname.substring(0, window.location.pathname.indexOf("/",2));
  }
}
