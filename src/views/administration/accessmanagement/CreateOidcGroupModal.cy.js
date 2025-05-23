import CreateOidcGroupModal from './CreateOidcGroupModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('CreateOidcGroupModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(CreateOidcGroupModal);

    shouldShowModal('createOidcGroupModal');
  });
});
