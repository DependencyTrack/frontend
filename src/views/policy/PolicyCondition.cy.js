import PolicyCondition from './PolicyCondition.vue';

describe('PolicyCondition', () => {
  it('mounts successfully', () => {
    cy.mount(PolicyCondition);

    cy.get('li.list-group-item.align-middle').should('be.visible');
  });
});
