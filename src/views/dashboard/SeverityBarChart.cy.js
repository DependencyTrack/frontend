import SeverityBarChart from '@/views/dashboard/SeverityBarChart.vue';

describe('SeverityBarChart', () => {
  it('mounts successfully', () => {
    cy.mount(SeverityBarChart, {
      propsData: {
        height: 300,
        width: 500,
      },
    });
  });
});
