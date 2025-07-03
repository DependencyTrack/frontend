import CreateOidcUserModal from './CreateOidcUserModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('CreateOidcUserModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(CreateOidcUserModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('createOidcUserModal');
  });
});
