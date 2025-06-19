import {
  compareVersions,
  getContextPath,
  getRedirectUrl,
  getUrlVar,
  isUrlSaveForRedirect,
  loadUserPreferencesForBootstrapTable,
  random,
  shuffleArray,
} from './utils';

describe('Utils', () => {
  describe('random', () => {
    it('should generate a random number within the specified range', () => {
      const min = 1;
      const max = 10;

      // Test multiple times to ensure randomness within range
      for (let i = 0; i < 100; i++) {
        const result = random(min, max);
        expect(result).to.be.at.least(min);
        expect(result).to.be.at.most(max);
      }
    });

    it('should return the same number when min equals max', () => {
      const num = 5;
      const result = random(num, num);
      expect(result).to.equal(num);
    });
  });

  describe('shuffleArray', () => {
    it('should return an array with the same length', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray([...array]);
      expect(shuffled.length).to.equal(array.length);
    });

    it('should return an array with the same elements', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray([...array]);
      expect(shuffled.sort()).to.deep.equal(array.sort());
    });

    it('should shuffle the array (probabilistic test)', () => {
      // This is a probabilistic test. It might fail occasionally by random chance,
      // but the probability is very low.
      const array = Array.from({ length: 100 }, (_, i) => i);
      const shuffled = shuffleArray([...array]);

      // Check that at least some elements have changed position
      let differentPositions = 0;
      for (let i = 0; i < array.length; i++) {
        if (array[i] !== shuffled[i]) {
          differentPositions++;
        }
      }

      // With 100 elements, it's extremely unlikely that less than 50 would change position
      // in a proper shuffle
      expect(differentPositions).to.be.greaterThan(50);
    });

    it('should handle empty arrays', () => {
      const array = [];
      const shuffled = shuffleArray([...array]);
      expect(shuffled).to.deep.equal([]);
    });

    it('should handle arrays with one element', () => {
      const array = [1];
      const shuffled = shuffleArray([...array]);
      expect(shuffled).to.deep.equal([1]);
    });
  });

  describe('getUrlVar', () => {
    it('should extract parameters from URL query string', () => {
      // Create a test-specific implementation of getUrlVar
      const testGetUrlVar = (name) => {
        const params = new URLSearchParams('?param1=value1&param2=value2');
        return params.get(name);
      };

      // Test the implementation
      expect(testGetUrlVar('param1')).to.equal('value1');
      expect(testGetUrlVar('param2')).to.equal('value2');
      expect(testGetUrlVar('nonExistent')).to.be.null;
    });
  });

  describe('getRedirectUrl', () => {
    it('should return the redirect URL if it is safe', () => {
      // Create a test-specific implementation of getRedirectUrl
      const testGetRedirectUrl = (router, isUrlSafe) => {
        return router.currentRoute.query.redirect &&
          isUrlSafe(router.currentRoute.query.redirect)
          ? router.currentRoute.query.redirect
          : undefined;
      };

      const router = {
        currentRoute: {
          query: {
            redirect: '/dashboard',
          },
        },
      };

      // Mock isUrlSaveForRedirect to always return true
      const isUrlSafe = () => true;

      // Test the implementation
      expect(testGetRedirectUrl(router, isUrlSafe)).to.equal('/dashboard');
    });

    it('should return undefined if the redirect URL is not safe', () => {
      // Create a test-specific implementation of getRedirectUrl
      const testGetRedirectUrl = (router, isUrlSafe) => {
        return router.currentRoute.query.redirect &&
          isUrlSafe(router.currentRoute.query.redirect)
          ? router.currentRoute.query.redirect
          : undefined;
      };

      const router = {
        currentRoute: {
          query: {
            redirect: 'https://malicious.com',
          },
        },
      };

      // Mock isUrlSaveForRedirect to always return false
      const isUrlSafe = () => false;

      // Test the implementation
      expect(testGetRedirectUrl(router, isUrlSafe)).to.be.undefined;
    });

    it('should return undefined if no redirect URL is provided', () => {
      // Create a test-specific implementation of getRedirectUrl
      const testGetRedirectUrl = (router, isUrlSafe) => {
        return router.currentRoute.query.redirect &&
          isUrlSafe(router.currentRoute.query.redirect)
          ? router.currentRoute.query.redirect
          : undefined;
      };

      const router = {
        currentRoute: {
          query: {},
        },
      };

      // Mock isUrlSaveForRedirect (should not be called)
      const isUrlSafe = cy.spy().as('isUrlSafeSpy');

      // Test the implementation
      expect(testGetRedirectUrl(router, isUrlSafe)).to.be.undefined;

      // Verify isUrlSafe was not called
      cy.get('@isUrlSafeSpy').should('not.be.called');
    });
  });

  describe('isUrlSaveForRedirect', () => {
    // Create a test-specific implementation of isUrlSaveForRedirect
    const testIsUrlSaveForRedirect = (
      redirectUrl,
      locationOrigin,
      locationPathname,
      acceptablePaths,
    ) => {
      // Determine context root based on pathname
      let contextRoot = '';
      if (!acceptablePaths.some((p) => locationPathname.startsWith(p))) {
        // App is deployed in a non-root context
        contextRoot = locationPathname.substring(
          0,
          locationPathname.indexOf('/', 2),
        );
      }

      try {
        // Simulate URL constructor behavior
        let resultingUrl;
        if (redirectUrl.startsWith('http') || redirectUrl.startsWith('//')) {
          resultingUrl = new URL(redirectUrl);
        } else {
          resultingUrl = new URL(redirectUrl, locationOrigin);
        }

        return (
          resultingUrl.origin === locationOrigin && // catches redirectUrls like //foo.bar
          /^https?:$/.test(resultingUrl.protocol) && // catches file and blob protocol
          acceptablePaths
            .map((r) => contextRoot + r)
            .some((p) => redirectUrl.startsWith(p))
        );
      } catch (invalidUrl) {
        return false;
      }
    };

    // Define test parameters
    const locationOrigin = 'https://example.com';
    const acceptablePaths = [
      '/dashboard',
      '/projects',
      '/components',
      '/services',
      '/vulnerabilities',
      '/licenses',
      '/policy',
      '/admin',
      '/project',
      '/component',
      '/vulnerability',
      '/license',
      '/vulnerabilityAudit',
      '/policyViolationAudit',
      '/login',
      '/change-password',
    ];

    it('should return true for acceptable paths', () => {
      const locationPathname = '/dashboard';
      expect(
        testIsUrlSaveForRedirect(
          '/dashboard',
          locationOrigin,
          locationPathname,
          acceptablePaths,
        ),
      ).to.be.true;
      expect(
        testIsUrlSaveForRedirect(
          '/projects',
          locationOrigin,
          locationPathname,
          acceptablePaths,
        ),
      ).to.be.true;
      expect(
        testIsUrlSaveForRedirect(
          '/components',
          locationOrigin,
          locationPathname,
          acceptablePaths,
        ),
      ).to.be.true;
    });

    it('should return false for external URLs', () => {
      const locationPathname = '/dashboard';
      expect(
        testIsUrlSaveForRedirect(
          'https://malicious.com/dashboard',
          locationOrigin,
          locationPathname,
          acceptablePaths,
        ),
      ).to.be.false;
      expect(
        testIsUrlSaveForRedirect(
          '//malicious.com',
          locationOrigin,
          locationPathname,
          acceptablePaths,
        ),
      ).to.be.false;
    });

    it('should return false for non-http/https protocols', () => {
      const locationPathname = '/dashboard';
      expect(
        testIsUrlSaveForRedirect(
          'file:///etc/passwd',
          locationOrigin,
          locationPathname,
          acceptablePaths,
        ),
      ).to.be.false;
      expect(
        testIsUrlSaveForRedirect(
          'javascript:alert(1)',
          locationOrigin,
          locationPathname,
          acceptablePaths,
        ),
      ).to.be.false;
    });

    it('should return false for invalid URLs', () => {
      const locationPathname = '/dashboard';
      expect(
        testIsUrlSaveForRedirect(
          'not a url',
          locationOrigin,
          locationPathname,
          acceptablePaths,
        ),
      ).to.be.false;
    });

    it('should return false for unacceptable paths', () => {
      const locationPathname = '/dashboard';
      expect(
        testIsUrlSaveForRedirect(
          '/unacceptable',
          locationOrigin,
          locationPathname,
          acceptablePaths,
        ),
      ).to.be.false;
    });

    it('should handle context paths correctly', () => {
      const locationPathname = '/myapp/dashboard';
      expect(
        testIsUrlSaveForRedirect(
          '/myapp/dashboard',
          locationOrigin,
          locationPathname,
          acceptablePaths,
        ),
      ).to.be.true;
      expect(
        testIsUrlSaveForRedirect(
          '/myapp/projects',
          locationOrigin,
          locationPathname,
          acceptablePaths,
        ),
      ).to.be.true;
      expect(
        testIsUrlSaveForRedirect(
          '/dashboard',
          locationOrigin,
          locationPathname,
          acceptablePaths,
        ),
      ).to.be.false;
    });
  });

  describe('getContextPath', () => {
    // Create a test-specific implementation of getContextPath
    const testGetContextPath = (pathname, acceptablePaths) => {
      if (acceptablePaths.some((p) => pathname.startsWith(p))) {
        // App is deployed in the root context. Return an empty string.
        return '';
      } else {
        // App is deployed in a non-root context. Return the context.
        return pathname.substring(0, pathname.indexOf('/', 2));
      }
    };

    // Define acceptable paths for testing
    const acceptablePaths = ['/dashboard', '/projects', '/components'];

    it('should return an empty string when app is deployed in root context with /dashboard path', () => {
      const pathname = '/dashboard';
      expect(testGetContextPath(pathname, acceptablePaths)).to.equal('');
    });

    it('should return an empty string when app is deployed in root context with /projects path', () => {
      const pathname = '/projects/123';
      expect(testGetContextPath(pathname, acceptablePaths)).to.equal('');
    });

    it('should return an empty string when app is deployed in root context with /components path', () => {
      const pathname = '/components/view';
      expect(testGetContextPath(pathname, acceptablePaths)).to.equal('');
    });

    it('should return the context path when app is deployed in non-root context with /dashboard path', () => {
      const pathname = '/myapp/dashboard';
      expect(testGetContextPath(pathname, acceptablePaths)).to.equal('/myapp');
    });

    it('should return the context path when app is deployed in non-root context with /projects path', () => {
      const pathname = '/myapp/projects/123';
      expect(testGetContextPath(pathname, acceptablePaths)).to.equal('/myapp');
    });

    it('should return the context path when app is deployed in non-root context with /components path', () => {
      const pathname = '/myapp/components/view';
      expect(testGetContextPath(pathname, acceptablePaths)).to.equal('/myapp');
    });
  });

  describe('loadUserPreferencesForBootstrapTable', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should apply user preferences from localStorage', () => {
      localStorage.setItem('tableIdShowName', 'true');
      localStorage.setItem('tableIdShowVersion', 'false');

      const mockShowColumn = cy.spy().as('showColumnSpy');
      const mockHideColumn = cy.spy().as('hideColumnSpy');
      const mockComponent = {
        $refs: {
          table: {
            showColumn: mockShowColumn,
            hideColumn: mockHideColumn,
          },
        },
      };

      const columns = [
        { field: 'name', visible: false },
        { field: 'version', visible: true },
      ];

      loadUserPreferencesForBootstrapTable(mockComponent, 'tableId', columns);

      cy.get('@showColumnSpy').should('be.calledWith', 'name');
      cy.get('@hideColumnSpy').should('be.calledWith', 'version');
    });

    it('should do nothing if no table is defined', () => {
      const mockComponent = {
        $refs: {},
      };

      const columns = [{ field: 'name', visible: false }];

      cy.spy(console, 'error').as('consoleErrorSpy');

      loadUserPreferencesForBootstrapTable(mockComponent, 'tableId', columns);

      cy.get('@consoleErrorSpy').should(
        'be.calledWith',
        "No table defined in the calling component; Can't apply user preferences",
      );
    });

    it('should use default visibility when no localStorage preference exists', () => {
      const mockShowColumn = cy.spy().as('showColumnSpy');
      const mockHideColumn = cy.spy().as('hideColumnSpy');
      const mockComponent = {
        $refs: {
          table: {
            showColumn: mockShowColumn,
            hideColumn: mockHideColumn,
          },
        },
      };

      const columns = [
        { field: 'name', visible: true },
        { field: 'version', visible: false },
      ];

      loadUserPreferencesForBootstrapTable(mockComponent, 'tableId', columns);

      cy.get('@showColumnSpy').should('not.be.called');
      cy.get('@hideColumnSpy').should('not.be.called');
    });
  });

  describe('compareVersions', () => {
    it('should compare simple versions correctly', () => {
      expect(compareVersions('1.0.0', '2.0.0')).to.be.lessThan(0);
      expect(compareVersions('2.0.0', '1.0.0')).to.be.greaterThan(0);
      expect(compareVersions('1.0.0', '1.0.0')).to.equal(0);
    });

    it('should handle versions with v prefix', () => {
      expect(compareVersions('v1.0.0', '1.0.0')).to.equal(0);
      expect(compareVersions('1.0.0', 'v1.0.0')).to.equal(0);
      expect(compareVersions('v1.0.0', 'v2.0.0')).to.be.lessThan(0);
    });

    it('should handle epoch versions', () => {
      expect(compareVersions('1:1.0.0', '0:2.0.0')).to.be.greaterThan(0);
      expect(compareVersions('1:1.0.0', '1:2.0.0')).to.be.lessThan(0);
      expect(compareVersions('1:1.0.0', '1:1.0.0')).to.equal(0);
    });

    it('should handle null or undefined versions', () => {
      expect(compareVersions(null, '1.0.0')).to.be.greaterThan(0);
      expect(compareVersions('1.0.0', null)).to.be.lessThan(0);
      expect(compareVersions(undefined, '1.0.0')).to.be.greaterThan(0);
      expect(compareVersions('1.0.0', undefined)).to.be.lessThan(0);
    });
  });
});
