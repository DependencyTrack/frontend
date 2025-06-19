import TrivyAnalyzer from './TrivyAnalyzer.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('TrivyAnalyzer', () => {
  it('mounts successfully', () => {
    cy.setToken(['SYSTEM_CONFIGURATION']);

    cy.mount(TrivyAnalyzer, {
      propsData: {
        header: 'Trivy Analyzer',
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
