import { shouldShowModal } from '../../../../cypress/support/utils';

import CreateTemplateModal from './CreateTemplateModal.vue';

describe('CreateTemplateModal', () => {
  it('mounts successfully', () => {
    cy.mount(CreateTemplateModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('createTemplateModal');
  });
});
