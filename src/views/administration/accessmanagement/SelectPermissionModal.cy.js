import SelectPermissionModal from './SelectPermissionModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('SelectPermissionModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(SelectPermissionModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('selectPermissionModal');
  });
});
