import { shouldShowModal } from '../../../../cypress/support/utils';

import ProjectAddVersionModal from './ProjectAddVersionModal.vue';

describe('ProjectAddVersionModal', () => {
  it('mounts successfully', () => {
    cy.mount(ProjectAddVersionModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('projectAddVersionModal');
  });
});
