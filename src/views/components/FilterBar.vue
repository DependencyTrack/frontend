<template>
  <div :id="toolbarId" class="filter-bar">
    <div
      class="filter-pills"
      role="toolbar"
      :aria-label="$t('message.filters')"
    >
      <slot />
      <b-dropdown
        v-if="addFilterOptions.length > 0"
        size="sm"
        variant="outline-primary"
        class="btn-more-filters"
        no-caret
      >
        <template #button-content>
          <span class="fa fa-plus" aria-hidden="true"></span>
          {{ $t('message.add_filter') }}
        </template>
        <b-dropdown-item
          v-for="filter in addFilterOptions"
          :key="filter.name"
          :title="filter.description || null"
          @click="$emit('show-filter', filter.name)"
          ><span :class="['fa', filter.icon, 'mr-2']" aria-hidden="true"></span
          >{{ filter.label }}</b-dropdown-item
        >
      </b-dropdown>
      <b-button
        v-show="activeFilterCount >= 2"
        size="sm"
        variant="outline-danger"
        class="btn-clear-all-filters"
        @click="$emit('clear-all')"
      >
        <span class="fa fa-remove" aria-hidden="true"></span>
        {{ $t('message.clear_all') }}
      </b-button>
    </div>
    <div
      v-if="$slots.actions || $scopedSlots.actions"
      class="filter-bar-actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterBar',
  props: {
    // Rendered as the element id so bootstrap-table's `toolbar` option can
    // adopt the bar. Omit when the bar is nested inside another toolbar.
    toolbarId: {
      type: String,
      default: null,
    },
    addFilterOptions: {
      type: Array,
      default: () => [],
    },
    activeFilterCount: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<style scoped src="./filter-pills.css"></style>
