import FindingAudit from './FindingAudit.vue';
import { genAxiosResponse } from '../../../../cypress/support/utils';

describe('FindingAudit', () => {
  it('mounts successfully', () => {
    cy.setToken(['VULNERABILITY_ANALYSIS']);

    cy.mount(FindingAudit, {
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({
            '/api/v1/analysis?project=undefined&component=123456-abcdef-component&vulnerability=123456-abcdef-vulnerability':
              {},
          }),
        },
      },
      propsData: {
        finding: {
          uuid: '123456-abcdef-finding',
          vulnerability: {
            uuid: '123456-abcdef-vulnerability',
          },
          component: {
            uuid: '123456-abcdef-component',
          },
        },
      },
    });

    cy.get('div.row').should('be.visible');
  });
});
