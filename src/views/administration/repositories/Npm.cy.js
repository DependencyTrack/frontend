import Npm from './Npm.vue';

describe('Npm', () => {
  it('mounts successfully', () => {
    cy.mount(Npm);

    cy.get('div.card').should('be.visible');
  });
});
