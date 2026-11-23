<template>
  <div class="collapsible-json mt-1">
    <a
      href="#"
      class="collapsible-toggle"
      :class="labelClass"
      @click.prevent="expanded = !expanded"
    >
      <i
        class="fa"
        :class="expanded ? 'fa-chevron-down' : 'fa-chevron-right'"
      ></i>
      {{ label }}
    </a>
    <pre v-if="expanded" class="event-json mt-1">{{ formatted }}</pre>
  </div>
</template>

<script>
export default {
  props: {
    label: { type: String, required: true },
    data: { type: [Object, String, Array], default: null },
    variant: { type: String, default: null },
  },
  data() {
    return { expanded: false };
  },
  computed: {
    formatted() {
      if (typeof this.data === 'string') {
        return this.data;
      }
      try {
        return JSON.stringify(this.data, null, 2);
      } catch {
        return String(this.data);
      }
    },
    labelClass() {
      return this.variant === 'danger' ? 'text-danger' : '';
    },
  },
};
</script>

<style scoped>
.collapsible-toggle {
  font-size: 0.85rem;
  text-decoration: none;
  cursor: pointer;
}

.collapsible-toggle .fa {
  font-size: 0.7rem;
  margin-right: 0.25rem;
}

.event-json {
  font-size: 0.8rem;
  max-height: 300px;
  overflow: auto;
}
</style>
