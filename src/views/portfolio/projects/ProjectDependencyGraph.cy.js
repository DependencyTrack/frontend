import ProjectDependencyGraph from './ProjectDependencyGraph.vue';

describe('ProjectDependencyGraph', () => {
  it('mounts successfully', () => {
    cy.mount(ProjectDependencyGraph, {
      prototypeMocks: {
        $route: {
          params: {
            componentUuids: [],
          },
        },
      },
      propsData: {
        uuid: '123456-abcdef',
        project: {
          uuid: '123456-abcdef',
        },
      },
    });

    cy.get('div').should('be.visible');
  });
});
