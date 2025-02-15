export function genAxiosResponse(responses) {
  return (url) => {
    console.log('axios stub for URL: ' + url);
    return Promise.resolve({
      data: responses[url],
    });
  };
}

export function shouldShowModal(id) {
  cy.get('@vue').then((wrapper) => {
    console.log(wrapper);
    wrapper.vm.$root.$emit('bv::show::modal', id);
  });

  cy.get(`#${id}`).should('be.visible');
}
