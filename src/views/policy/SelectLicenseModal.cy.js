import { shouldShowModal } from '../../../cypress/support/utils';

import SelectLicenseModal from './SelectLicenseModal.vue';

describe('SelectLicenseModal', () => {
  it('mounts successfully', () => {
    cy.mount(SelectLicenseModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('selectLicenseModal');
  });
});
