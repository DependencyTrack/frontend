import SelectProjectModal from './SelectProjectModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('SelectProjectModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(SelectProjectModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('selectProjectModal');
  });
});
