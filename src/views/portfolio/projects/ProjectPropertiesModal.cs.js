import { shouldShowModal } from '../../../../cypress/support/utils';

import ProjectPropertiesModal from './ProjectPropertiesModal.vue';

describe('ProjectPropertiesModal', () => {
  it('mounts successfully', () => {
    cy.mount(ProjectPropertiesModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('projectPropertiesModal');
  });
});
