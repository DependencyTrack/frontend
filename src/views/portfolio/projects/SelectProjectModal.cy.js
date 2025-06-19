import { shouldShowModal } from '../../../../cypress/support/utils';

import SelectProjectModal from './SelectProjectModal.vue';

describe('SelectProjectModal', () => {
  it('mounts successfully', () => {
    cy.mount(SelectProjectModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('selectProjectModal');
  });
});
