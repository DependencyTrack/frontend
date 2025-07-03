import { shouldShowModal } from '../../../../cypress/support/utils';

import ProjectUploadVexModal from './ProjectUploadVexModal.vue';

describe('ProjectUploadVexModal', () => {
  it('mounts successfully', () => {
    cy.mount(ProjectUploadVexModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('projectUploadVexModal');
  });
});
