import ComponentVulnerabilities from './ComponentVulnerabilities.vue';

describe('ComponentVulnerabilities', () => {
  it('mounts successfully', () => {
    cy.mount(ComponentVulnerabilities);

    cy.get('div').should('be.visible');
  });
});
