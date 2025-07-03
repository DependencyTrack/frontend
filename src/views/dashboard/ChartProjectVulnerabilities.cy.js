import ChartProjectVulnerabilities from '@/views/dashboard/ChartProjectVulnerabilities.vue';

describe('ChartProjectVulnerabilities', () => {
  it('mounts successfully', () => {
    cy.mount(ChartProjectVulnerabilities, {
      propsData: {
        height: 300,
      },
    });
  });
});
