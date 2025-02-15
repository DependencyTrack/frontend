import AboutModal from './AboutModal.vue';
import { shouldShowModal } from '../../../cypress/support/utils';

describe('AboutModal', () => {
  it('mounts successfully', () => {
    const mockCommon = {
      formatTimestamp: cy.stub().returns('01 Jan 2023 at 12:00:00'),
    };

    cy.mount(AboutModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('aboutModal');
  });
});
