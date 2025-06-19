import Maven from './Maven.vue';

describe('Maven', () => {
  it('mounts successfully', () => {
    cy.mount(Maven);

    cy.get('div.card').should('be.visible');
  });
});
