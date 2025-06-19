import {
  genAxiosResponse,
  shouldShowModal,
} from '../../../../cypress/support/utils';

import ProjectAddComponentModal from './ProjectAddComponentModal.vue';

describe('ProjectAddComponentModal', () => {
  it('mounts successfully', () => {
    cy.mount(ProjectAddComponentModal, {
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
          }),
        },
      },
    });

    shouldShowModal('projectAddComponentModal');
  });
});
