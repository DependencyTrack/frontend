import GoModules from './GoModules.vue';

describe('GoModules', () => {
  it('mounts successfully', () => {
    cy.mount(GoModules);

    cy.get('div.card').should('be.visible');
  });
});
