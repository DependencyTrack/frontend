import '@cypress/code-coverage/support';
import { mount } from '@cypress/vue2';
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import 'font-awesome/css/font-awesome.css';

Vue.use(BootstrapVue);

/**
 * Enhanced mount command with common mocks
 *
 * @param {Object} component - The Vue component to mount
 * @param {Object} options - Mount options
 * @param {Object} options.mocks - Custom mocks to override defaults
 * @param {Object} options.mockCurrentUser - Whether to mock current user (default: true)
 * @param {Object} options.mockApi - Whether to mock Vue.prototype.$api (default: false)
 */
Cypress.Commands.add('mount', (component, options = {}) => {
  const defaultMocks = {
    $t: (key) => key,
    $toastr: {
      s: cy.stub(),
      w: cy.stub(),
      e: cy.stub(),
      i: cy.stub(),
    },
    $root: {
      $emit: cy.stub(),
    },
  };

  // Add current user mock if needed
  if (options.mockCurrentUser !== false) {
    const mockCurrentUser = {
      username: 'testuser',
      fullname: 'Test User',
      email: 'test@example.com',
    };

    defaultMocks.currentUser = mockCurrentUser;
    defaultMocks.$currentUser = mockCurrentUser;
  }

  // Setup API mocking if requested
  if (options.mockApi) {
    cy.mockApi();
  }

  // Merge default mocks with provided mocks
  options.mocks = {
    ...defaultMocks,
    ...(options.mocks || {}),
  };

  return mount(component, options);
});

/**
 * Custom command to mock Vue.prototype.$api
 * Returns the original $api value for cleanup
 */
Cypress.Commands.add('mockApi', () => {
  const originalApi = Vue.prototype.$api;
  Vue.prototype.$api = {
    BASE_URL: 'api',
    URL_USER_MANAGED: 'user/managed',
    URL_USER_SELF: 'user/self',
    URL_ABOUT: 'version',
  };

  return originalApi;
});

/**
 * Custom command to stub window.location
 * This avoids the "Cannot redefine property: location" error
 * by using a safer approach to mock the location object
 *
 * @param {Object} locationStub - The location object properties to stub
 * @example
 * cy.stubWindowLocation({
 *   origin: 'https://example.com',
 *   pathname: '/dashboard'
 * });
 */
Cypress.Commands.add('stubWindowLocation', (locationStub = {}) => {
  const defaultLocation = {
    origin: 'https://example.com',
    pathname: '/',
    search: '',
    hash: '',
    href: 'https://example.com/',
    protocol: 'https:',
    host: 'example.com',
    hostname: 'example.com',
    port: '',
    ...locationStub,
  };

  cy.window().then((win) => {
    cy.stub(win, 'location').value(defaultLocation);
  });
});
