/*
 * Permissions Vue Directive
 */
import { decodeToken, getToken, hasPermission } from '@/shared/permissions';

export default function installPermissionDirective(vue) {
  vue.directive('permission', function (el, binding) {
    const decodedToken = decodeToken(getToken());
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
}
