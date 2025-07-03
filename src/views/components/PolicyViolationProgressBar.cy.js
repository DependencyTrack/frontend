import PolicyViolationProgressBar from './PolicyViolationProgressBar.vue';

describe('PolicyViolationProgressBar', () => {
  it('mounts successfully', () => {
    const mockMetrics = {
      policyViolationsTotal: 100,
      policyViolationsInfo: 30,
      policyViolationsWarn: 40,
      policyViolationsFail: 30,
      policyViolationsLicenseTotal: 50,
      policyViolationsOperationalTotal: 30,
      policyViolationsSecurityTotal: 20,
    };

    cy.mount(PolicyViolationProgressBar, {
      propsData: {
        metrics: mockMetrics,
      },
    });
  });
});
