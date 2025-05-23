import ChangePasswordModal from './ChangePasswordModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('ChangePasswordModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    const managedUser = {
      username: 'testuser',
      fullname: 'Test User',
      email: 'test@example.com',
      forcePasswordChange: false,
      nonExpiryPassword: false,
      suspended: false,
    };

    cy.mount(ChangePasswordModal, {
      props: {
        managedUser: managedUser,
      },
    });

    shouldShowModal('changePasswordModal');
  });
});
