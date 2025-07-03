import ChartPortfolioVulnerabilities from '@/views/dashboard/ChartPortfolioVulnerabilities.vue';

describe('ChartPortfolioVulnerabilities', () => {
  it('mounts successfully', () => {
    cy.mount(ChartPortfolioVulnerabilities, {
      propsData: {
        height: 300,
      },
    });
  });
});
