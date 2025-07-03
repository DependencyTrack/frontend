import WidgetPortfolioVulnerabilities from '@/views/dashboard/WidgetPortfolioVulnerabilities.vue';

describe('WidgetPortfolioVulnerabilities', () => {
  it('mounts successfully', () => {
    cy.mount(WidgetPortfolioVulnerabilities, {
      propsData: {
        height: 70,
        width: 300,
      },
    });
  });
});
