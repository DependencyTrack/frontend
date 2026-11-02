<template>
  <div
    class="dependency-graph-focus-bar d-flex flex-wrap align-items-center row-gap-1 column-gap-3"
  >
    <span class="d-inline-flex align-items-center gap-1">
      <button
        type="button"
        class="btn btn-link p-0"
        :title="$t('message.center_on_component')"
        @click="$emit('center')"
      >
        <i class="fa fa-crosshairs align-middle me-1" aria-hidden="true" />
        {{ $t('message.paths_to_component', { name: component.name }) }}
      </button>
      <button
        type="button"
        class="btn btn-link p-0 text-muted"
        :aria-label="$t('message.clear_paths')"
        :title="$t('message.clear_paths')"
        @click="$emit('clear')"
      >
        <i class="fa fa-fw fa-times align-middle" aria-hidden="true" />
      </button>
    </span>
    <b-form-checkbox id="shortestPathOnly" v-model="shortestOnly" switch>{{
      $t('message.shortest_path')
    }}</b-form-checkbox>
    <span class="text-muted">{{
      $t('message.showing_components', { shown, total }, total)
    }}</span>
  </div>
</template>

<script setup>
defineProps({
  component: { type: Object, required: true },
  shown: { type: Number, required: true },
  total: { type: Number, required: true },
});
defineEmits(['center', 'clear']);
const shortestOnly = defineModel('shortestOnly', { type: Boolean });
</script>

<style lang="scss">
.dependency-graph-focus-bar {
  padding: 0.25rem 0.75rem;
  border-bottom: 1px solid var(--dt-border);
}
.dependency-graph-focus-bar .form-check {
  margin: 0;
}
</style>
