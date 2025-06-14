import Composer from './Composer.vue';

describe('Composer', () => {
  it('mounts successfully', () => {
    cy.mount(Composer);

    cy.get('div.card').should('be.visible');
  });
});
