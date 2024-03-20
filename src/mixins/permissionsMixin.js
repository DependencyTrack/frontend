import * as permissions from '../shared/permissions';

export default {
  data() {
    return {
      PERMISSIONS: {
        BOM_UPLOAD: permissions.BOM_UPLOAD,
        VIEW_PORTFOLIO: permissions.VIEW_PORTFOLIO,
        PORTFOLIO_MANAGEMENT: permissions.PORTFOLIO_MANAGEMENT,
        ACCESS_MANAGEMENT: permissions.ACCESS_MANAGEMENT,
        VIEW_VULNERABILITY: permissions.VIEW_VULNERABILITY,
        VULNERABILITY_ANALYSIS: permissions.VULNERABILITY_ANALYSIS,
        VIEW_POLICY_VIOLATION: permissions.VIEW_POLICY_VIOLATION,
        VULNERABILITY_MANAGEMENT: permissions.VULNERABILITY_MANAGEMENT,
        POLICY_VIOLATION_ANALYSIS: permissions.POLICY_VIOLATION_ANALYSIS,
        SYSTEM_CONFIGURATION: permissions.SYSTEM_CONFIGURATION,
        POLICY_MANAGEMENT: permissions.POLICY_MANAGEMENT,
      },
    };
  },
  computed: {
    decodedToken() {
      return permissions.decodeToken(permissions.getToken());
    },
  },
  methods: {
    isPermitted(permission) {
      return permissions.hasPermission(permission, this.decodedToken);
    },
    isNotPermitted(permission) {
      return !permissions.hasPermission(permission, this.decodedToken);
    },
  },
};
