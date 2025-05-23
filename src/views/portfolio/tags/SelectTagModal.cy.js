import SelectTagModal from './SelectTagModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('SelectTagModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['VIEW_PORTFOLIO']);

    cy.mount(SelectTagModal, {
      propsData: {
        policy: {
          uuid: '12345-67890',
        },
      },
    });

    shouldShowModal('selectTagModal');
  });
});
