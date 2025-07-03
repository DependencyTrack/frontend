import SelectTeamModal from './SelectTeamModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('SelectTeamModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    cy.mount(SelectTeamModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('selectTeamModal');
  });
});
