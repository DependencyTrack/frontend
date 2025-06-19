import ChartPolicyViolationsClassification from '@/views/dashboard/ChartPolicyViolationsClassification.vue';

describe('ChartPolicyViolationsClassification', () => {
  it('mounts successfully', () => {
    cy.mount(ChartPolicyViolationsClassification, {
      propsData: {
        height: 300,
      },
    });
  });
});
