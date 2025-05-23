import TaggedNotificationRuleListModal from './TaggedNotificationRuleListModal.vue';

describe('TaggedNotificationRuleListModal', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(TaggedNotificationRuleListModal, {
      propsData: {
        tag: 'test-tag',
        index: 0,
      },
    });

    cy.get('div').should('exist');
  });
});
