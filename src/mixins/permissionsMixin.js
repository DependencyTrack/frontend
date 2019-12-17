import * as permissions from "../shared/permissions";

export default {
  data() {
    return {
      PERMISSIONS: {
        BOM_UPLOAD: permissions.BOM_UPLOAD,
        VIEW_PORTFOLIO: permissions.VIEW_PORTFOLIO,
        PORTFOLIO_MANAGEMENT: permissions.PORTFOLIO_MANAGEMENT,
        ACCESS_MANAGEMENT: permissions.ACCESS_MANAGEMENT,
        VULNERABILITY_ANALYSIS: permissions.VULNERABILITY_ANALYSIS,
        SYSTEM_CONFIGURATION: permissions.SYSTEM_CONFIGURATION
      }
    }
  },
  computed: {
    decodedToken () {
      return permissions.decodeToken(permissions.getToken());
    }
  },
  methods: {
    isPermitted (permission) {
      return permissions.hasPermission(permission, this.decodedToken);
    },
    isNotPermitted (permission) {
      return !permissions.hasPermission(permission, this.decodedToken);
    },
  }
};
