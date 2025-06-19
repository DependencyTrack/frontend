import ServiceDashboard from './ServiceDashboard.vue';

describe('ServiceDashboard', () => {
  it('mounts successfully', () => {
    cy.setToken();

    cy.mount(ServiceDashboard);

    cy.get('#chart-portfolio-vulns').should('be.visible');
  });
});
