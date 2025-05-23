import Login from './Login.vue';

describe('Login', () => {
  it('mounts successfully', () => {
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
      },
    });
  });
});
