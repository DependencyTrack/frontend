import SelectLdapGroupModal from './SelectLdapGroupModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('SelectLdapGroupModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(SelectLdapGroupModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('selectLdapGroupModal');
  });
});
