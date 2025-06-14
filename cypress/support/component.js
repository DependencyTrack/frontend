import '@cypress/code-coverage/support';
import { mount } from '@cypress/vue2';
import Vue from 'vue';

import api from '@/shared/api.json';
import oidc from '@/shared/oidc.json';
import version from '@/version';
import '@/validation';
import { installBootstrap } from '@/plugins/bootstrap';
import installPermissionDirective from '@/directives/VuePermission';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/assets/scss/style.scss';

Vue.prototype.$api = api;
Vue.prototype.$oidc = oidc;
Vue.prototype.$version = version;

Vue.prototype.$dtrack = Vue.prototype.dtrack = {
  application: 'Dependency-Track',
  version: '4.8.0',
  uuid: '12345-67890-abcdef',
  timestamp: Date.now(),
  framework: {
    name: 'Alpine',
    version: '3.16',
  },
  database: {
    productName: 'PostgreSQL',
    productVersion: '14.5',
  },
  systemUuid: '98765-43210-fedcba',
  systemInitialDate: new Date().toISOString(),
};

installBootstrap(Vue);

/**
 * Enhanced mount command with common mocks
 *
 * @param {Object} component - The Vue component to mount
 * @param {Object} options - Mount options
 * @param {Object} options.mocks - Custom mocks to override defaults
 */
Cypress.Commands.add('mount', (component, options = {}) => {
  const defaultPrototypeMocks = {
    $i18n: Vue.observable({
      locale: 'en',
      availableLocales: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'hi'],
      t: (key) => key,
    }),
    $t: (key) => key,
    $router: {
      afterEach: cy.stub(),
    },
  };

  const prototypeMocks = {
    ...defaultPrototypeMocks,
    ...(options.prototypeMocks || {}),
  };

  const localVue = Vue.extend();
  // TODO installBootstrapPageTitlePlugin(localVue, prototypeMocks.$router);
  installPermissionDirective(localVue);
  Object.keys(prototypeMocks).forEach((key) => {
    Object.defineProperty(localVue.prototype, key, {
      value: prototypeMocks[key],
      writable: true,
      configurable: true,
      enumerable: true,
    });
  });

  return mount(component, {
    ...options,
    localVue,
  }).then(({ wrapper }) => {
    return cy.wrap(wrapper).as('vue');
  });
});

Cypress.Commands.add('setToken', (permissions = []) => {
  const tokenPayload = {
    permissions: permissions.join(','),
  };

  // Encode the payload to Base64URL
  const base64Url = Cypress.Buffer.from(JSON.stringify(tokenPayload))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const fakeToken = `fake-header.${base64Url}.fake-signature`;

  cy.window().then((win) => {
    win.sessionStorage.setItem('token', fakeToken);
  });
});
