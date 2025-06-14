import { shouldShowModal } from '../../../cypress/support/utils';

import CreateLicenseGroupModal from './CreateLicenseGroupModal.vue';

describe('CreateLicenseGroupModal', () => {
  it('mounts successfully', () => {
    cy.mount(CreateLicenseGroupModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('createLicenseGroupModal');
  });
});
