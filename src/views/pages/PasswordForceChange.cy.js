import PasswordForceChange from './PasswordForceChange.vue';

describe('PasswordForceChange', () => {
  it('mounts successfully', () => {
    cy.mount(PasswordForceChange, {
      mocks: {
        $toastr: {
          s: cy.stub(),
        },
      },
    });
  });
});
