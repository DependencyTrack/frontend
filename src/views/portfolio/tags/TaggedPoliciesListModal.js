import TaggedPoliciesListModal from '@/views/portfolio/tags/TaggedPoliciesListModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('TaggedPoliciesListModal', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(TaggedPoliciesListModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
      propsData: {
        tag: 'test-tag',
        index: 0,
      },
    });

    shouldShowModal('taggedPoliciesListModal-0');
  });
});
