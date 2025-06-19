import { shouldShowModal } from '../../../../cypress/support/utils';

import ProjectUploadBomModal from './ProjectUploadBomModal.vue';

describe('ProjectUploadBomModal', () => {
  it('mounts successfully', () => {
    cy.mount(ProjectUploadBomModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('projectUploadBomModal');
  });
});
