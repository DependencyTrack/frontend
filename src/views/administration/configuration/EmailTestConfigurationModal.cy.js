import { shouldShowModal } from '../../../../cypress/support/utils';

import EmailTestConfigurationModal from './EmailTestConfigurationModal.vue';

describe('EmailTestConfigurationModal', () => {
  it('mounts successfully', () => {
    cy.mount(EmailTestConfigurationModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('emailTestConfigurationModal');
  });
});
