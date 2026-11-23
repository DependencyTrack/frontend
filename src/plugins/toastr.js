import { useModal, useToast } from 'bootstrap-vue-next';

const toastr = {};

export default {
  install(app) {
    const toasts = app.runWithContext(useToast);
    const modals = app.runWithContext(useModal);
    const toast =
      (variant, isStatus = false) =>
      (message, title) => {
        const controller = toasts.create({
          title,
          body: message,
          // BootstrapVue's toasts were tinted, not solid.
          toastClass: `bg-${variant}-subtle text-${variant}-emphasis border-${variant}-subtle`,
          isStatus,
          noProgress: true,
          modelValue: 5000,
        });
        controller.show().then(controller.destroy);
      };
    Object.assign(toastr, {
      s: toast('success', true),
      w: toast('warning'),
      e: toast('danger'),
      i: toast('info', true),
    });
    app.config.globalProperties.$toastr = toastr;
    app.config.globalProperties.$confirm = async (message, options) => {
      const controller = modals.create({
        ...options,
        body: message,
      });
      const stop = app.config.globalProperties.$router.afterEach(() =>
        controller.hide(),
      );
      try {
        return (await controller.show()).ok;
      } finally {
        stop();
        controller.destroy();
      }
    };
    app.config.globalProperties.$confirmDelete = ({ title, message } = {}) => {
      const t = app.config.globalProperties.$t;
      return app.config.globalProperties.$confirm(
        message ?? t('message.delete_confirm'),
        {
          title: title ?? t('message.delete'),
          okVariant: 'danger',
          okTitle: t('message.delete'),
          cancelTitle: t('message.cancel'),
          centered: true,
        },
      );
    };
  },
};

export { toastr };
