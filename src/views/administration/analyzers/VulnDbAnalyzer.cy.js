import VulnDbAnalyzer from './VulnDbAnalyzer.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('VulnDbAnalyzer', () => {
  it('mounts successfully', () => {
    cy.setToken(['SYSTEM_CONFIGURATION']);

    cy.mount(VulnDbAnalyzer, {
      propsData: {
        header: 'VulnDB Analyzer',
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
