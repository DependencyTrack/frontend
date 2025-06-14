import Cpan from './Cpan.vue';

describe('Cpan', () => {
  it('mounts successfully', () => {
    cy.mount(Cpan);

    cy.get('div.card').should('be.visible');
  });
});
