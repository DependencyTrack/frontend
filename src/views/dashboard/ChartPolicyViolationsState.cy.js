import ChartPolicyViolationsState from '@/views/dashboard/ChartPolicyViolationsState.vue';

describe('ChartPolicyViolationsState', () => {
  it('mounts successfully', () => {
    cy.mount(ChartPolicyViolationsState, {
      propsData: {
        height: 300,
      },
    });
  });
});
