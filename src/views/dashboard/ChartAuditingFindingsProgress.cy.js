import ChartAuditingFindingsProgress from '@/views/dashboard/ChartAuditingFindingsProgress.vue';

describe('ChartAuditingFindingsProgress', () => {
  it('mounts successfully', () => {
    cy.mount(ChartAuditingFindingsProgress, {
      propsData: {
        height: 300,
      },
    });
  });
});
