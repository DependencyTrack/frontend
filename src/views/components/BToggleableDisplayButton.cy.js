import BToggleableDisplayButton from './BToggleableDisplayButton.vue';

describe('BToggleableDisplayButton', () => {
  it('mounts successfully with props', () => {
    cy.mount(BToggleableDisplayButton, {
      propsData: {
        variant: 'primary',
        label: 'Test Button',
      },
    });

    cy.get('button').should('contain', 'Test Button');
    cy.get('.fa-chevron-down').should('exist');
    cy.get('.fa-chevron-up').should('not.exist');
  });

  it('emits toggle event when clicked', () => {
    const onToggle = cy.spy().as('toggleSpy');

    cy.mount(BToggleableDisplayButton, {
      propsData: {
        variant: 'primary',
        label: 'Toggle Button',
      },
      listeners: {
        toggle: onToggle,
      },
    });

    cy.get('button').click();
    cy.get('@toggleSpy').should('have.been.calledOnce');
  });

  it('changes icon when toggled', () => {
    cy.mount(BToggleableDisplayButton, {
      propsData: {
        variant: 'primary',
        label: 'Toggle Button',
      },
    });

    cy.get('.fa-chevron-down').should('exist');
    cy.get('.fa-chevron-up').should('not.exist');

    cy.get('button').click();

    cy.get('.fa-chevron-up').should('exist');
    cy.get('.fa-chevron-down').should('not.exist');
  });
});
