import EditApiKeyCommentModal from './EditApiKeyCommentModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('EditApiKeyCommentModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['ACCESS_MANAGEMENT']);

    const keyId = '12345';
    const apiKey = {
      publicId: 'abc123',
      comment: 'Test comment',
    };

    cy.mount(EditApiKeyCommentModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
      propsData: {
        keyId: keyId,
        apiKey: apiKey,
      },
    });

    shouldShowModal(`editApiKeyCommentModal-${keyId}`);
  });
});
