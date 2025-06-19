import Alerts from './Alerts.vue';

describe('Alerts', () => {
  it('mounts successfully', () => {
    cy.mount(Alerts, {
      stubs: {
        'create-alert-modal': true,
      },
    });

    cy.get('div.card').should('be.visible');
  });
});
