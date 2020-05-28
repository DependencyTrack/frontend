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
 * Retrieves the querystring, parses it.
 */
export function getUrlVars() {
  let vars = [], hash;
  let hashes = window.location.href.replace("#", "").slice(window.location.href.indexOf("?") + 1).split("&");
  for(let i = 0; i < hashes.length; i++) {
    hash = hashes[i].split("=");
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}

/**
 * Provides a function to extract a param from the querystring.
 */
export function getUrlVar(name) {
  return getUrlVars()[name];
}

/**
 * Returns the context from which the webapp is running.
 */
export function getContextPath() {
  // An array of acceptable root context paths defined in the UI.
  let root = ['/dashboard', '/projects', '/components', '/vulnerabilities', '/licenses', '/policy', '/admin',
    '/project', '/component', '/vulnerability', '/license', '/login', '/change-password'];
  for (let i = 0; i < root.length; i++) {
    if (window.location.pathname.startsWith(root[i])) {
      // App is deployed in the root context. Return an empty string.
      return "";
    }
  }
  // App is deployed in a non-root context. Return the context.
  return window.location.pathname.substring(0, window.location.pathname.indexOf("/",2));
}
