/*
 * Permissions Vue Directive
 */
import Vue from 'vue';
import { hasPermission, decodeToken, getToken } from '../shared/permissions';

Vue.directive('permission', function (el, binding) {
  let decodedToken = decodeToken(getToken());
  if (Array.isArray(binding.value)) {
    let permitted = false;
    if (binding.arg === 'and') {
      // This is the AND case. If a user has ALL of the specified permissions, permitted will be true
      permitted = true;
      binding.value.forEach(function (b) {
        if (!hasPermission(b, decodedToken)) {
          permitted = false;
        }
      });
    } else if (binding.arg === 'or') {
      // This is the OR case. If a user has one or more of the specified permissions, permitted will be true
      binding.value.forEach(function (b) {
        if (hasPermission(b, decodedToken)) {
          permitted = true;
        }
      });
    }
    if (!permitted) {
      el.style.display = 'none';
    }
  } else {
    if (!hasPermission(binding.value, decodedToken)) {
      el.style.display = 'none';
    }
  }
});
