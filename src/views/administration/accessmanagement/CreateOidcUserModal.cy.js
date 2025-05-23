import CreateOidcUserModal from './CreateOidcUserModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('CreateOidcUserModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(CreateOidcUserModal);

    shouldShowModal('createOidcUserModal');
  });
});
