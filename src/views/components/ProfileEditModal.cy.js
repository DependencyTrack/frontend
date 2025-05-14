import ProfileEditModal from './ProfileEditModal.vue';

describe('ProfileEditModal', () => {
  it('mounts successfully', () => {
    cy.mount(ProfileEditModal, {
      prototypeMocks: {
        $toastr: {
          s: cy.stub(),
          w: cy.stub(),
        },
      },
    });
  });
});
