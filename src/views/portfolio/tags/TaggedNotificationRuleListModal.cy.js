import TaggedNotificationRuleListModal from './TaggedNotificationRuleListModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('TaggedNotificationRuleListModal', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(TaggedNotificationRuleListModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
      propsData: {
        tag: 'test-tag',
        index: 0,
      },
    });

    shouldShowModal('taggedNotificationRuleListModal-0');
  });
});
