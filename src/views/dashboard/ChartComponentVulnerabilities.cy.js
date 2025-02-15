import ChartComponentVulnerabilities from '@/views/dashboard/ChartComponentVulnerabilities.vue';

describe('ChartComponentVulnerabilities', () => {
  it('mounts successfully', () => {
    cy.mount(ChartComponentVulnerabilities, {
      propsData: {
        height: 300,
      },
    });
  });
});
