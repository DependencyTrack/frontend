import AffectedProjects from './AffectedProjects.vue';

describe('AffectedProjects', () => {
  it('mounts successfully', () => {
    cy.mount(AffectedProjects, {
      propsData: {
        source: 'GITHUB',
        vulnId: 'GHSA-1234',
        vulnerability: 'GHSA-1234',
      },
    });

    cy.get('#projectsToolbar').should('exist');
  });
});
