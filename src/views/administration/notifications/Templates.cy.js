import Templates from './Templates.vue';

describe('Templates', () => {
  it('mounts successfully', () => {
    cy.mount(Templates);

    cy.get('div.card').should('be.visible');
  });
});
