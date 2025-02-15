import CreateTeamModal from './CreateTeamModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('CreateTeamModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(CreateTeamModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('createTeamModal');
  });
});
