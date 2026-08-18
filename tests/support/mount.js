import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, mount, shallowMount } from '@vue/test-utils';
import { createTranslateStub } from './i18n';

/**
 * BootstrapVue is installed per call rather than globally in tests/setup.js, so
 * specs that do not render b-* components do not pay for registering it.
 *
 * If the component suite outgrows this, swap the whole-library install for the
 * handful of plugins actually used (InputGroup, FormSelect, FormInput, Button,
 * Dropdown, FormGroup). That change stays contained in this factory.
 */
export function createTestLocalVue() {
  const localVue = createLocalVue();
  localVue.use(BootstrapVue);
  return localVue;
}

function withDefaults(options) {
  return {
    localVue: options.localVue || createTestLocalVue(),
    ...options,
    mocks: {
      $t: createTranslateStub(),
      ...options.mocks,
    },
  };
}

export function mountWithBootstrapVue(component, options = {}) {
  return mount(component, withDefaults(options));
}

export function shallowMountWithBootstrapVue(component, options = {}) {
  return shallowMount(component, withDefaults(options));
}

/**
 * Mounts without BootstrapVue, for components that only need the $t stub.
 */
export function mountWithTranslations(component, options = {}) {
  return mount(component, {
    ...options,
    mocks: {
      $t: createTranslateStub(),
      ...options.mocks,
    },
  });
}
