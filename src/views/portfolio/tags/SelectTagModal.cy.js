import SelectTagModal from './SelectTagModal.vue';

describe('SelectTagModal', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(SelectTagModal, {
      propsData: {
        policy: {
          uuid: '12345-67890',
        },
      },
    });

    cy.get('div').should('exist');
  });
});
