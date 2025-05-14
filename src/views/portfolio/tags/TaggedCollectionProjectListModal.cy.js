import TaggedCollectionProjectListModal from './TaggedCollectionProjectListModal.vue';

describe('TaggedCollectionProjectListModal', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(TaggedCollectionProjectListModal, {
      propsData: {
        tag: 'test-tag',
        index: 0,
      },
    });

    cy.get('div').should('exist');
  });
});
