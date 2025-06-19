import { shouldShowModal } from '../../../../cypress/support/utils';

import ComponentCreatePropertyModal from './ComponentCreatePropertyModal.vue';

describe('ComponentCreatePropertyModal', () => {
  it('mounts successfully', () => {
    cy.mount(ComponentCreatePropertyModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
    });

    shouldShowModal('componentCreatePropertyModal');
  });
});
