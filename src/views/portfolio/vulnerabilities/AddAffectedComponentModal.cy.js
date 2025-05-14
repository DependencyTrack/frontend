import AddAffectedComponentModal from './AddAffectedComponentModal.vue';

describe('AddAffectedComponentModal', () => {
  it('mounts successfully', () => {
    cy.mount(AddAffectedComponentModal);

    cy.get('div').should('exist');
  });
});
