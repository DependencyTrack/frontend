import EditApiKeyCommentModal from './EditApiKeyCommentModal.vue';

describe('EditApiKeyCommentModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    const keyId = '12345';
    const apiKey = {
      publicId: 'abc123',
      comment: 'Test comment',
    };

    // Create a stub for BInputGroupFormInput component
    const BInputGroupFormInput = {
      template: '<input id="name-input" :value="value" />',
      props: [
        'value',
        'id',
        'label',
        'inputGroupSize',
        'type',
        'lazy',
        'feedback',
        'autofocus',
      ],
    };

    cy.mount(EditApiKeyCommentModal, {
      attachTo: document.body,
      propsData: {
        keyId: keyId,
        apiKey: apiKey,
      },
      stubs: {
        'b-input-group-form-input': BInputGroupFormInput,
      },
    });

    cy.get(`#editApiKeyCommentModal-${keyId}`).should('exist');
  });
});
