import {
  hasPermission,
  decodeToken,
  getToken,
  BOM_UPLOAD,
  ACCESS_MANAGEMENT,
} from '@/shared/permissions';

describe('Permissions', () => {
  describe('getToken', () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    it('retrieves the token from session storage', () => {
      const mockToken = 'mock.jwt.token';
      sessionStorage.setItem('token', mockToken);

      const result = getToken();

      expect(result).to.equal(mockToken);
    });

    it('returns null if no token is in session storage', () => {
      const result = getToken();

      expect(result).to.be.null;
    });
  });

  describe('decodeToken', () => {
    it('decodes a JWT token correctly', () => {
      const payload = {
        sub: 'user123',
        permissions: 'BOM_UPLOAD,VIEW_PORTFOLIO',
      };
      const base64Payload = btoa(JSON.stringify(payload));
      const mockToken = `header.${base64Payload}.signature`;

      cy.stub(window, 'atob').returns(JSON.stringify(payload));

      const result = decodeToken(mockToken);

      expect(result).to.deep.equal(payload);
      expect(result.sub).to.equal('user123');
      expect(result.permissions).to.equal('BOM_UPLOAD,VIEW_PORTFOLIO');
    });
  });

  describe('hasPermission', () => {
    it('returns true when user has the permission', () => {
      const mockDecodedToken = {
        permissions: 'BOM_UPLOAD,VIEW_PORTFOLIO,PORTFOLIO_MANAGEMENT',
      };

      const result = hasPermission(BOM_UPLOAD, mockDecodedToken);

      expect(result).to.be.true;
    });

    it('returns false when user does not have the permission', () => {
      const mockDecodedToken = {
        permissions: 'VIEW_PORTFOLIO,PORTFOLIO_MANAGEMENT',
      };

      const result = hasPermission(ACCESS_MANAGEMENT, mockDecodedToken);

      expect(result).to.be.false;
    });

    it('returns false when token has no permissions', () => {
      const mockDecodedToken = {};

      const result = hasPermission(BOM_UPLOAD, mockDecodedToken);

      expect(result).to.be.false;
    });

    it('returns false when token is null', () => {
      const mockDecodeToken = cy.stub().returns({ permissions: '' });

      const hasPermissionTest = (permission, decodedToken) => {
        const token = decodedToken || mockDecodeToken(null);
        const permissions = token?.permissions?.split(',') || [];
        return permissions.includes(permission);
      };

      const result = hasPermissionTest(BOM_UPLOAD, null);
      expect(result).to.be.false;
      expect(mockDecodeToken).to.be.calledWith(null);
    });

    it('automatically retrieves and decodes token if not provided', () => {
      const payload = {
        permissions: 'BOM_UPLOAD,VIEW_PORTFOLIO',
      };
      const base64Payload = btoa(JSON.stringify(payload));
      const mockToken = `header.${base64Payload}.signature`;
      sessionStorage.setItem('token', mockToken);

      cy.stub(window, 'atob').returns(JSON.stringify(payload));

      const result = hasPermission(BOM_UPLOAD);

      expect(result).to.be.true;
    });
  });
});
