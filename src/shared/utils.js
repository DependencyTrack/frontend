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
