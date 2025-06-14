import Python from './Python.vue';

describe('Python', () => {
  it('mounts successfully', () => {
    cy.mount(Python);

    cy.get('div.card').should('be.visible');
  });
});
