import { h } from 'vue';
import { useModal, useToast } from 'bootstrap-vue-next';

const toastr = {};

export default {
  install(app) {
    const toasts = app.runWithContext(useToast);
    const modals = app.runWithContext(useModal);
    // `action` adds a link to a route, `{ label, to }`, and keeps the toast longer.
    const toast =
      (variant, isStatus = false) =>
      (message, title, action) => {
        const router = app.config.globalProperties.$router;
        const controller = toasts.create({
          title,
          body: message,
          // BootstrapVue's toasts were tinted, not solid.
          toastClass: `bg-${variant}-subtle text-${variant}-emphasis border-${variant}-subtle`,
          isStatus,
          noProgress: true,
          modelValue: action ? 10000 : 5000,
          slots: action
            ? {
                default: () => [
                  message,
                  h('div', { class: 'mt-2' }, [
                    h(
                      'a',
                      {
                        href: router.resolve(action.to).href,
                        class: 'fw-bold text-reset',
                        onClick: (event) => {
                          event.preventDefault();
                          router.push(action.to);
                          controller.hide();
                        },
                      },
                      action.label,
                    ),
                  ]),
                ],
              }
            : undefined,
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
