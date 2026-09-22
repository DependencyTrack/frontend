import Vue from 'vue';

Vue.config.productionTip = false;
Vue.config.devtools = false;

// Vue reports unregistered components and failed prop validation through
// warnHandler instead of throwing, so a broken template would otherwise produce
// a passing test plus a warning nobody reads.
//
// Render errors are not handled here: Vue Test Utils installs its own
// Vue.config.errorHandler and rethrows them already.
//
// Note this deliberately does not fail on bare console.error/console.warn:
// several functions under test call console.error on purpose, and those calls
// are asserted with jest.spyOn instead.
Vue.config.warnHandler = (msg, vm, trace) => {
  throw new Error(`Unexpected Vue warning: ${msg}${trace}`);
};

// Several modules under test write to storage, the URL or document.body.
// Resetting globally keeps a leak in one file from making another file flaky.
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, '', '/');
  document.body.className = '';
});
