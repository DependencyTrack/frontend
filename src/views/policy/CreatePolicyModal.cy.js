import { shouldShowModal } from '../../../cypress/support/utils';

import CreatePolicyModal from './CreatePolicyModal.vue';

describe('CreatePolicyModal', () => {
  it('mounts successfully', () => {
    cy.mount(CreatePolicyModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('createPolicyModal');
  });
});
