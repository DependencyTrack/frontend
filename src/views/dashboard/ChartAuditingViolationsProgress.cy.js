import ChartAuditingViolationsProgress from '@/views/dashboard/ChartAuditingViolationsProgress.vue';

describe('ChartAuditingViolationsProgress', () => {
  it('mounts successfully', () => {
    cy.mount(ChartAuditingViolationsProgress, {
      propsData: {
        height: 300,
      },
    });
  });
});
