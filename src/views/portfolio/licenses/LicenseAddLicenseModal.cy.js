import LicenseAddLicenseModal from '@/views/portfolio/licenses/LicenseAddLicenseModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('LicenseAddLicenseModal', () => {
  it('mounts successfully', () => {
    cy.mount(LicenseAddLicenseModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
      prototypeMocks: {
        $toastr: {
          s: cy.stub(),
          w: cy.stub(),
        },
      },
    });

    shouldShowModal('licenseAddLicenseModal');
  });
});
