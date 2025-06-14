import CreateManagedUserModal from './CreateManagedUserModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('CreateManagedUserModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(CreateManagedUserModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('createManagedUserModal');
  });
});
