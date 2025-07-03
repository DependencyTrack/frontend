import Repositories from './Repositories.vue';

describe('Repositories', () => {
  it('mounts successfully', () => {
    cy.mount(Repositories);

    cy.get('div.card').should('be.visible');
  });
});
