import Nuget from './Nuget.vue';

describe('Nuget', () => {
  it('mounts successfully', () => {
    cy.mount(Nuget);

    cy.get('div.card').should('be.visible');
  });
});
