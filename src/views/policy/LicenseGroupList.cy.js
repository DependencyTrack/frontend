import LicenseGroupList from './LicenseGroupList.vue';

describe('LicenseGroupList', () => {
  it('mounts successfully', () => {
    cy.setToken(['POLICY_MANAGEMENT']);

    cy.mount(LicenseGroupList);

    cy.get('div.animated.fadeIn').should('be.visible');
  });
});
