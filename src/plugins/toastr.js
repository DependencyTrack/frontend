import { h, render } from 'vue';

const toastr = {};

export default {
  install(app) {
    // Toasts shown through a component's $bvToast close when it is destroyed, e.g. on a route change.
    const vnode = h({ render: () => null });
    vnode.appContext = app._context;
    render(vnode, document.createElement('div'));
    const owner = vnode.component.proxy;
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
    Object.assign(toastr, {
      s: toast('success', true),
      w: toast('warning'),
      e: toast('danger'),
      i: toast('info', true),
    });
    app.config.globalProperties.$toastr = toastr;
  },
};

export { toastr };
