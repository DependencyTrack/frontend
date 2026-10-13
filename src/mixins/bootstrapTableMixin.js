import { h, render } from 'vue';

let nextCellId = 0;

export default {
  created() {
    this.pendingCells = new Map();
    this.mountedCells = [];
  },
  beforeUnmount() {
    this.mountedCells.forEach(({ container }) => render(null, container));
  },
  methods: {
    // Returns a placeholder for a formatter, which mountCells() replaces with the component.
    cell(component, props) {
      const id = nextCellId++;
      this.pendingCells.set(id, { component, props });
      return `<div data-cell-id="${id}"></div>`;
    },
    mountCells() {
      this.mountedCells = this.mountedCells.filter(({ vnode, container }) => {
        if (vnode.el.isConnected) {
          return true;
        }
        render(null, container);
        return false;
      });
      this.pendingCells.forEach(({ component, props }, id) => {
        const el = document.querySelector(`[data-cell-id="${id}"]`);
        if (el) {
          // Without a parent, the cell is a root of its own, so that bv::show::modal on $root only reaches this cell's modals.
          const vnode = h(component, props);
          vnode.appContext = this.$.appContext;
          const container = document.createElement('div');
          render(vnode, container);
          el.replaceWith(...container.childNodes);
          this.mountedCells.push({ vnode, container });
        }
      });
      this.pendingCells.clear();
    },
  },
};
