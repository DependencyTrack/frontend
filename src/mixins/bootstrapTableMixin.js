import Vue from 'vue';

let nextCellId = 0;

export default {
  data() {
    return {
      vueFormatters: [],
    };
  },
  created() {
    this.pendingCells = new Map();
    this.mountedCells = [];
  },
  beforeDestroy() {
    this.mountedCells.forEach((cell) => cell.$destroy());
  },
  methods: {
    vueFormatter(obj) {
      const key = `_vue_formatter_${this.vueFormatters.length}`;
      this.vueFormatters.push({
        el: `.${key}`,
        name: key,
        ...obj,
      });
      return `<div class="${key}"/>`;
    },
    vueFormatterInit() {
      if (!this.vueFormatters.length) {
        return;
      }
      for (let i = this.vueFormatters.length - 1; i >= 0; i--) {
        const formatter = this.vueFormatters[i];
        if (document.getElementsByClassName(formatter.name)) {
          new Vue(formatter);
          this.vueFormatters.splice(i, 1);
        }
      }
    },
    // Returns a placeholder for a formatter, which mountCells() replaces with the component.
    cell(component, props) {
      const id = nextCellId++;
      this.pendingCells.set(id, { component, props });
      return `<div data-cell-id="${id}"></div>`;
    },
    mountCells() {
      this.mountedCells = this.mountedCells.filter((cell) => {
        if (cell.$el.isConnected) {
          return true;
        }
        cell.$destroy();
        return false;
      });
      this.pendingCells.forEach(({ component, props }, id) => {
        const el = document.querySelector(`[data-cell-id="${id}"]`);
        if (el) {
          // A root of its own, so that bv::show::modal on $root only reaches this cell's modals.
          const cell = new Vue({
            router: this.$router,
            i18n: this.$i18n,
            render: (h) => h(component, { props }),
          });
          this.mountedCells.push(cell.$mount(el));
        }
      });
      this.pendingCells.clear();
    },
  },
};
