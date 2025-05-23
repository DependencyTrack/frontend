import TaggedCollectionProjectListModal from './TaggedCollectionProjectListModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('TaggedCollectionProjectListModal', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(TaggedCollectionProjectListModal, {
      propsData: {
        tag: 'test-tag',
        index: 0,
      },
    });

    shouldShowModal('taggedCollectionProjectListModal-0');
  });
});
