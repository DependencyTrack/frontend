import { mount } from '@cypress/vue2';
import InformationalModal from '@/views/modals/InformationalModal.vue';

describe('<InformationalModal />', () => {
  it('contains the message', () => {
    mount(InformationalModal, {
      propsData: {
        message: 'Foo',
      },
    }).then(({ wrapper }) => {
      wrapper.vm.$bvModal.show('modal-informational');

      cy.get('.modal-backdrop').should('be.visible');

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
});
