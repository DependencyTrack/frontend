const handlers = new Map();

export default {
  on(type, handler) {
    handlers.set(type, [...(handlers.get(type) ?? []), handler]);
  },
  off(type, handler) {
    handlers.set(
      type,
      handler ? (handlers.get(type) ?? []).filter((h) => h !== handler) : [],
    );
  },
  emit(type, ...args) {
    for (const handler of handlers.get(type) ?? []) {
      try {
        handler(...args);
      } catch (error) {
        console.error(error);
      }
    }
  },
};
