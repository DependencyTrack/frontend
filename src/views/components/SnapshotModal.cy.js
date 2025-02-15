import SnapshotModal from './SnapshotModal.vue';
import { shouldShowModal } from '../../../cypress/support/utils';

describe('SnapshotModal', () => {
  it('mounts successfully', () => {
    cy.mount(SnapshotModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('snapshotModal');
  });
});
