import mitt from 'mitt'

const emitter = mitt()

const EventBus = {
  $on: (type, handler) => emitter.on(type, handler),
  $off: (type, handler) => emitter.off(type, handler),
  $emit: (type, payload) => emitter.emit(type, payload),
};

export default EventBus;
