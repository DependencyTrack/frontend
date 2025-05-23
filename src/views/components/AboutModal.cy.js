import AboutModal from './AboutModal.vue';

describe('AboutModal', () => {
  it('mounts successfully', () => {
    const mockCommon = {
      formatTimestamp: cy.stub().returns('01 Jan 2023 at 12:00:00'),
    };

    cy.mount(AboutModal);
  });
});
