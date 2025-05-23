import SelectCweModal from './SelectCweModal.vue';
import { shouldShowModal } from '../../../../cypress/support/utils';

describe('SelectCweModal', () => {
  it('mounts successfully', () => {
    cy.setToken(['VULNERABILITY_MANAGEMENT']);

    cy.mount(SelectCweModal);

    shouldShowModal('selectCweModal');
  });
});
