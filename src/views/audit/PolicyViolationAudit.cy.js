import PolicyViolationAudit from './PolicyViolationAudit.vue';

describe('PolicyViolationAudit', () => {
  it('mounts successfully', () => {
    cy.setToken(['VIEW_POLICY_VIOLATION']);

    cy.mount(PolicyViolationAudit);

    cy.get('div.animated.fadeIn').should('be.visible');
  });
});
