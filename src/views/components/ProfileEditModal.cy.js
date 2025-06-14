import ProfileEditModal from './ProfileEditModal.vue';
import { shouldShowModal } from '../../../cypress/support/utils';

describe('ProfileEditModal', () => {
  it('mounts successfully', () => {
    cy.mount(ProfileEditModal, {
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

    shouldShowModal('profileEditModal');
  });
});
