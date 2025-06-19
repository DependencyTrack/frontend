import { shouldShowModal } from '../../../../cypress/support/utils';

import RepositoryCreateRepositoryModal from './RepositoryCreateRepositoryModal.vue';

describe('RepositoryCreateRepositoryModal', () => {
  it('mounts successfully', () => {
    cy.mount(RepositoryCreateRepositoryModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('repositoryCreateRepositoryModal');
  });
});
