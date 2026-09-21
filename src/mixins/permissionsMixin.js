/* eslint-disable prettier/prettier */
import * as permissions from '../shared/permissions';

const PERMISSIONS = {};
for (const [name, value] of Object.entries(permissions)) {
  if (typeof value === 'string') {
    PERMISSIONS[name] = value;
  }
}

export default {
  data() {
    return { PERMISSIONS };
  },
  methods: {
    isPermitted(permission) {
      if (typeof permission == 'string') {
        return permissions.hasPermission(permission);
      } else if (Array.isArray(permission)) {
        for (let perm of permission) {
          if (permissions.hasPermission(perm)) {
            return true;
          }
        }
        return false;
      } else {
        throw new Error('permission must be of type string or array');
      }
    },
    isNotPermitted(permission) {
      if (typeof permission == 'string') {
        return !permissions.hasPermission(permission);
      } else if (Array.isArray(permission)) {
        for (let perm of permission) {
          if (permissions.hasPermission(perm)) {
            return false;
          }
        }
        return true;
      } else {
        throw new Error('permission must be of type string or array');
      }
    },
  },
};
