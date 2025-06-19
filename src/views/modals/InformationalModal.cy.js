import InformationalModal from '@/views/modals/InformationalModal.vue';
import { shouldShowModal } from '../../../cypress/support/utils';

describe('InformationalModal', () => {
  it('contains the message', () => {
    cy.setToken();

    cy.mount(InformationalModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
      propsData: {
        message: 'Foo',
      },
    });

    shouldShowModal('modal-informational');

    cy.get('#modal-informational').invoke('css', 'display', 'block');
    cy.get('#modal-informational').invoke('css', 'opacity', '1');
    cy.get('#modal-informational').invoke('addClass', 'show');

    cy.get('#modal-informational').should('be.visible');

    cy.get('#modal-informational .modal-content').should('be.visible');
    cy.get('#modal-informational .modal-content p')
      .should('be.visible')
      .should('contain.text', 'Foo');
  });
});
