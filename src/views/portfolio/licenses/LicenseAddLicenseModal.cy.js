import LicenseAddLicenseModal from '@/views/portfolio/licenses/LicenseAddLicenseModal.vue';

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

    cy.get('div').should('exist');
  });
});
