/*
* Permissions Vue Directive
*/
import Vue from 'vue'

Vue.directive('permission', function(el, binding) {
  let decodedToken = decodeToken(getToken());
  if (Array.isArray(binding.value)) {
    let permitted = false;
    binding.value.forEach(function (b) {
      if(hasPermission(b, decodedToken)) {
        permitted = true;
      }
    });
    if (!permitted) {
      el.style.display = "none";
    }
  } else {
    if (! hasPermission(binding.value, decodedToken)) {
      el.style.display = "none";
    }
  }
});


/**
 * Determines if the current logged in user has a specific permission.
 * If the decodedToken is not passed, the function will automatically
 * retrieve and decode it.
 */
const hasPermission = function hasPermission(permission, decodedToken) {
  let token = decodedToken;
  if (!decodedToken) {
    token = decodeToken(getToken());
  }
  if (token !== null && token.hasOwnProperty("permissions")) {
    let permissions = token.permissions.split(",");
    for (let i = 0; i < permissions.length; i++) {
      if (permissions[i] === permission) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Returns the decoded token as a JSON object.
 */
const decodeToken = function decodeToken(token) {
  let base64Url = token.split('.')[1];
  let base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
};

/**
 * Retrieves the token from session storage.
 */
const getToken = function getToken() {
  return sessionStorage.getItem("token");
};
