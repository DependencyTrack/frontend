import AddAffectedComponentModal from './AddAffectedComponentModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('AddAffectedComponentModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['VULNERABILITY_MANAGEMENT']);

    cy.mount(AddAffectedComponentModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('addAffectedComponentModal');
  });
});
