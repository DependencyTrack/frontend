import SelectTagModal from './SelectTagModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('SelectTagModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['VIEW_PORTFOLIO']);

    cy.mount(SelectTagModal, {
      attachTo: document.body,
      stubs: {
        transition: false,
      },
      propsData: {
        policy: {
          uuid: '12345-67890',
        },
      },
    });

    shouldShowModal('selectTagModal');
  });
});
