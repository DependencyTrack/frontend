import ProjectFindings from './ProjectFindings.vue';

describe('ProjectFindings', () => {
  it('mounts successfully', () => {
    cy.setToken(['VIEW_VULNERABILITY']);

    cy.mount(ProjectFindings, {
      prototypeMocks: {
        $route: {
          params: {},
        },
      },
    });

    cy.get('#findingsToolbar').should('be.visible');
  });
});
