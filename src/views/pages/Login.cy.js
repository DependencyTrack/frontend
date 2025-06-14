import Login from './Login.vue';
import { genAxiosResponse } from '../../../cypress/support/utils';

describe('Login', () => {
  it('mounts successfully', () => {
    cy.intercept(
      '/api/v1/configProperty/public/general/welcome.message.enabled',
      {
        propertyValue: 'false',
      },
    );

    cy.mount(Login, {
      prototypeMocks: {
        $oidc: {
          ISSUER: '',
          CLIENT_ID: '',
          FLOW: 'implicit',
          SCOPE: 'openid',
          LOGIN_BUTTON_TEXT: '',
        },
        $bvModal: {
          show: cy.stub(),
        },
        $toastr: {
          s: cy.stub(),
          e: cy.stub(),
          w: cy.stub(),
        },
        axios: {
          get: genAxiosResponse({
            'api/v1/configProperty/public/general/welcome.message.enabled': {
              propertyValue: 'false',
            },
          }),
        },
      },
    });
  });
});
