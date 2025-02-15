import SelectOidcGroupModal from './SelectOidcGroupModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('SelectOidcGroupModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(SelectOidcGroupModal);

    shouldShowModal('selectOidcGroupModal');
  });
});
