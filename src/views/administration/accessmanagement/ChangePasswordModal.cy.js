import ChangePasswordModal from './ChangePasswordModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('ChangePasswordModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(ChangePasswordModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
      propsData: {
        managedUser: {
          username: 'testuser',
          fullname: 'Test User',
          email: 'test@example.com',
          forcePasswordChange: false,
          nonExpiryPassword: false,
          suspended: false,
        },
      },
    });

    shouldShowModal('changePasswordModal');
  });
});
