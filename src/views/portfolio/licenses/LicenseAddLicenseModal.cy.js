import LicenseAddLicenseModal from '@/views/portfolio/licenses/LicenseAddLicenseModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('LicenseAddLicenseModal', () => {
  it('mounts successfully', () => {
    cy.mount(LicenseAddLicenseModal, {
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
