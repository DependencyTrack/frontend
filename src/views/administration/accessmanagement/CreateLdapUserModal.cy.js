import CreateLdapUserModal from './CreateLdapUserModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('CreateLdapUserModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(CreateLdapUserModal);

    shouldShowModal('createLdapUserModal');
  });
});
