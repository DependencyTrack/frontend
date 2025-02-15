import InternalAnalyzer from './InternalAnalyzer.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('InternalAnalyzer', () => {
  it('mounts successfully', () => {
    cy.setToken(['SYSTEM_CONFIGURATION']);

    cy.mount(InternalAnalyzer, {
      propsData: {
        header: 'Internal Analyzer',
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
