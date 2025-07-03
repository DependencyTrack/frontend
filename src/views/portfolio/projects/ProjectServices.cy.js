import ProjectServices from './ProjectServices.vue';

describe('ProjectServices', () => {
  it('mounts successfully', () => {
    cy.mount(ProjectServices);

    cy.get('table').should('be.visible');
  });
});
