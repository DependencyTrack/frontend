import TaggedProjectListModal from '@/views/portfolio/tags/TaggedProjectListModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('TaggedProjectListModal', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(TaggedProjectListModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
      propsData: {
        tag: 'test-tag',
        index: 0,
      },
    });

    shouldShowModal('taggedProjectListModal-0');
  });
});
