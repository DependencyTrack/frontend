import { shouldShowModal } from '../../../../cypress/support/utils';

import EcosystemModal from './EcosystemModal.vue';

describe('EcosystemModal', () => {
  it('mounts successfully', () => {
    cy.mount(EcosystemModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('ecosystemModal');
  });
});
