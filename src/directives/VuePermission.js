/*
* Permissions Vue Directive
*/
import Vue from 'vue'
import {hasPermission, decodeToken, getToken} from '../shared/auth'

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
