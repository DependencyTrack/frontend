import {
  genAxiosResponse,
  shouldShowModal,
} from '../../../../cypress/support/utils';

import ProjectCreateProjectModal from './ProjectCreateProjectModal.vue';

describe('ProjectCreateProjectModal', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(ProjectCreateProjectModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
      prototypeMocks: {
        axios: {
          get: genAxiosResponse({
            '/api/v1/configProperty/public/access-management/acl.enabled': {
              propertyValue: 'false',
            },
            '/api/v1/team/visible': [],
            '/api/v1/license/concise': [],
          }),
        },
      },
    });

    shouldShowModal('projectCreateProjectModal');
  });
});
