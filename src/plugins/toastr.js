export default {
  install(Vue) {
    // Toasts shown through a component's $bvToast close when it is destroyed, e.g. on a route change.
    const owner = new Vue();
    const toast =
      (variant, isStatus = false) =>
      (message, title) =>
        owner.$bvToast.toast(message, {
          title,
          variant,
          isStatus,
          solid: true,
          autoHideDelay: 5000,
        });
    Vue.prototype.$toastr = {
      s: toast('success', true),
      w: toast('warning'),
      e: toast('danger'),
      i: toast('info', true),
    };
  },
};
