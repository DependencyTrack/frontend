import Showdown from './Showdown.vue';

describe('Showdown', () => {
  it('mounts successfully', () => {
    const markdown = '# Heading\n\nThis is a paragraph with **bold** text.';

    cy.mount(Showdown, {
      propsData: {
        markdown,
      },
    });
  });
});
