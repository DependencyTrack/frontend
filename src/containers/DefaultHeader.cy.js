import DefaultHeader from './DefaultHeader.vue';

describe('DefaultHeader', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(DefaultHeader);

    cy.get('img[alt="Dependency-Track Logo"]').should('exist');
  });
});
