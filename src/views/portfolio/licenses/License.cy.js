import License from '@/views/portfolio/licenses/License.vue';
import { genAxiosResponse } from '/cypress/support/utils';

describe('License', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(License, {
      prototypeMocks: {
        $route: {
          params: {
            licenseId: 'test-license',
          },
          fullPath: '/licenses/test-license',
        },
        $toastr: {
          s: cy.stub(),
          w: cy.stub(),
        },
        axios: {
          get: genAxiosResponse({
            '/api/v1/license/test-license': {
              name: 'License name',
              licenseId: 'LICENSE-ID',
              isOsiApproved: true,
              isFsfLibre: true,
              isDeprecatedLicenseId: true,
              isCustomLicense: true,
              licenseComments: 'License comments',
              licenseText: 'License text',
              standardLicenseTemplate: 'License template',
              standardLicenseHeader: 'License header',
            },
          }),
        },
      },
    });

    cy.get('.animated').should('exist');
  });
});
