import SnykAnalyzer from './SnykAnalyzer.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('SnykAnalyzer', () => {
  it('mounts successfully', () => {
    cy.setToken(['SYSTEM_CONFIGURATION']);

    cy.mount(SnykAnalyzer, {
      propsData: {
        header: 'Snyk Analyzer',
      },
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({
            '/api/v1/configProperty/': [],
          }),
        },
        $toastr: {
          s: cy.stub(),
          w: cy.stub(),
        },
      },
    });

    cy.get('.card-body').should('exist');
  });
});
