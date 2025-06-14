import CreateOidcGroupModal from './CreateOidcGroupModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('CreateOidcGroupModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(CreateOidcGroupModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('createOidcGroupModal');
  });
});
