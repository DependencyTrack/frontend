import ProfileEditModal from './ProfileEditModal.vue';

describe('ProfileEditModal', () => {
  it('mounts successfully', () => {
    const mockAxios = {
      post: cy.stub().resolves({ data: {} }),
      get: cy.stub().resolves({ data: {} }),
    };

    cy.mount(ProfileEditModal, {
      mockApi: true,
      mocks: {
        axios: mockAxios,
      },
    });
  });
});
