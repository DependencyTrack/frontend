import ProjectEpss from './ProjectEpss.vue';

describe('ProjectEpss', () => {
  it('mounts successfully', () => {
    cy.mount(ProjectEpss);

    cy.get('#epssToolbar').should('be.visible');
  });
});
