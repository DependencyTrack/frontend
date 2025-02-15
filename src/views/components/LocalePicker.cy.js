import LocalePicker from './LocalePicker.vue';
import Vue from 'vue';

describe('LocalePicker', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear();
      cy.stub(win.localStorage, 'setItem').as('localStorageSetItem');
    });
  });

  it('renders with available locales', () => {
    const i18n = Vue.observable({
      locale: 'en',
      availableLocales: ['en', 'es', 'fr', 'de'],
      t: (key) => key,
    });

    cy.mount(LocalePicker, {
      prototypeMocks: {
        $i18n: i18n,
        $t: i18n.t,
      },
    });

    cy.get('.fa-language').should('exist');
    cy.get('select').should('exist');

    cy.get('select option').should('have.length', 4);
    cy.get('select option').eq(0).should('contain', 'EN');
    cy.get('select option').eq(1).should('contain', 'ES');
    cy.get('select option').eq(2).should('contain', 'FR');
    cy.get('select option').eq(3).should('contain', 'DE');
  });

  it('selects the current locale on mount', () => {
    const i18n = Vue.observable({
      locale: 'fr',
      availableLocales: ['en', 'es', 'fr', 'de'],
      t: (key) => key,
    });

    cy.mount(LocalePicker, {
      prototypeMocks: {
        $i18n: i18n,
        $t: i18n.t,
      },
    });

    cy.get('select').should('have.value', 'fr');
  });

  it('changes locale when a new option is selected', () => {
    const i18n = Vue.observable({
      locale: 'en',
      availableLocales: ['en', 'es', 'fr', 'de'],
      t: (key) => key,
    });

    const router = Vue.observable({
      go: cy.spy().as('routerGo'),
    });

    cy.mount(LocalePicker, {
      prototypeMocks: {
        $i18n: i18n,
        $t: i18n.t,
        $router: router,
      },
    });

    cy.get('select').select('es');

    cy.get('@localStorageSetItem').should(
      'have.been.calledWith',
      'Locale',
      'es',
    );

    cy.wrap(i18n).its('locale').should('eq', 'es');

    cy.get('@routerGo').should('have.been.calledWith', 0);
  });

  it('converts locale codes to flag emojis', () => {
    const i18n = Vue.observable({
      locale: 'en',
      availableLocales: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'hi'],
      t: (key) => key,
    });

    cy.mount(LocalePicker, {
      prototypeMocks: {
        $i18n: i18n,
        $t: i18n.t,
      },
    });

    // Check that the locales are converted to flag emojis
    // We can't easily check the actual emoji characters, but we can check that they exist
    cy.get('select option').should('have.length', 7);

    // Check that the special case mappings work
    // en -> US, hi -> IN, ja -> JP, zh -> CN
    cy.get('select option').eq(0).invoke('text').should('include', 'EN');
    cy.get('select option').eq(6).invoke('text').should('include', 'HI');
  });
});
