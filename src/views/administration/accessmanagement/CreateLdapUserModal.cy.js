import CreateLdapUserModal from './CreateLdapUserModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('CreateLdapUserModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(CreateLdapUserModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('createLdapUserModal');
  });
});
