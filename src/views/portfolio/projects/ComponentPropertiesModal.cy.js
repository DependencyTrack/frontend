import { shouldShowModal } from '../../../../cypress/support/utils';

import ComponentPropertiesModal from './ComponentPropertiesModal.vue';

describe('ComponentPropertiesModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['PORTFOLIO_MANAGEMENT']);

    cy.mount(ComponentPropertiesModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('componentPropertiesModal');
  });
});
