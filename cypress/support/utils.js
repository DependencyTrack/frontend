export function genAxiosResponse(responses) {
  return (url) => {
    if (responses[url] === undefined) {
      console.warn('axios stub for URL not available: ' + url);
      return Promise.resolve({
        data: null,
        statusCode: 500,
      });
    }

    console.log('axios stub for URL: ' + url);
    return Promise.resolve({
      data: responses[url],
    });
  };
}

export function shouldShowModal(id) {
  cy.get('@vue').then((wrapper) => {
    const $root = wrapper.vm.$root;
    const bvModal = $root.$bvModal;
    if (bvModal) {
      bvModal.show(id);
    } else {
      $root.$emit('bv::show::modal', id);
    }
  });

  cy.get(`#${id}`).should('exist');
  cy.get(`#${id}`).should('be.visible');
}
