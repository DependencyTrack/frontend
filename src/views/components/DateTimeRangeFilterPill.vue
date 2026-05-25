<template>
  <filter-pill-dropdown
    ref="pill"
    :field-name="fieldName"
    :field-label="fieldLabel"
    :icon="icon"
    :has-filter="hasFilter"
    @hide="onDropdownHide"
    @clear="clearFilter"
    @dismiss="$emit('dismiss')"
  >
    <template #value>{{ displayValue }}</template>

    <b-form-group :label="$t('message.from')" label-size="sm" class="mb-2">
      <b-input-group>
        <b-form-input
          :id="`datetime-range-filter-pill-from-${fieldName}`"
          v-model="tmpFrom"
          :type="dateOnly ? 'date' : 'datetime-local'"
          size="sm"
        ></b-form-input>
        <b-input-group-append>
          <b-button
            size="sm"
            variant="outline-secondary"
            :disabled="!tmpFrom"
            @click="tmpFrom = ''"
            :title="$t('message.clear')"
            :aria-label="$t('message.clear') + ' ' + $t('message.from')"
          >
            <span class="fa fa-times-circle" aria-hidden="true"></span>
          </b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
    <b-form-group :label="$t('message.to')" label-size="sm" class="mb-2">
      <b-input-group>
        <b-form-input
          :id="`datetime-range-filter-pill-to-${fieldName}`"
          v-model="tmpTo"
          :type="dateOnly ? 'date' : 'datetime-local'"
          size="sm"
        ></b-form-input>
        <b-input-group-append>
          <b-button
            size="sm"
            variant="outline-secondary"
            :disabled="!tmpTo"
            @click="tmpTo = ''"
            :title="$t('message.clear')"
            :aria-label="$t('message.clear') + ' ' + $t('message.to')"
          >
            <span class="fa fa-times-circle" aria-hidden="true"></span>
          </b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
    <div class="d-flex justify-content-end">
      <b-button
        variant="primary"
        size="sm"
        @click="applyFilter"
        :disabled="!tmpFrom && !tmpTo"
        >{{ $t('message.apply') }}
      </b-button>
    </div>
  </filter-pill-dropdown>
</template>

<script>
import FilterPillDropdown from '@/views/components/FilterPillDropdown.vue';

export default {
  name: 'DateTimeRangeFilterPill',
  components: { FilterPillDropdown },
  props: {
    fieldName: {
      type: String,
      required: true,
    },
    fieldLabel: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: null,
    },
    dateOnly: {
      type: Boolean,
      default: false,
    },
    emitDateAsMillis: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      tmpFrom: '',
      tmpTo: '',
    };
  },
  watch: {
    value: {
      immediate: true,
      handler() {
        this.syncFromValue();
      },
    },
  },
  computed: {
    hasFilter() {
      return this.value && (this.value.from || this.value.to);
    },
    displayValue() {
      if (!this.value) return '';

      const from = this.value.from
        ? this.formatDisplayValue(this.value.from, false)
        : '';
      const to = this.value.to
        ? this.formatDisplayValue(this.value.to, true)
        : '';

      if (from && to) {
        return `${from} - ${to}`;
      } else if (from) {
        return `≥ ${from}`;
      } else if (to) {
        return `< ${to}`;
      }
      return '';
    },
  },
  // `to` is stored as an exclusive upper bound: when emitDateAsMillis is on,
  // it's the midnight *after* the selected day, so callers shift by ±1 day
  // when converting between the user-visible date and the stored value.
  methods: {
    syncFromValue() {
      const val = this.value;
      this.tmpFrom = val && val.from ? this.toInputValue(val.from, false) : '';
      this.tmpTo = val && val.to ? this.toInputValue(val.to, true) : '';
    },
    formatDisplayValue(val, isExclusiveUpper) {
      if (!val) return '';
      if (this.dateOnly) {
        const date = this.dateOnlyValueToDate(val, isExclusiveUpper);
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
      const date = new Date(val);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    toInputValue(val, isExclusiveUpper) {
      if (!val) return '';
      if (this.dateOnly) {
        return this.formatDateInputValue(
          this.dateOnlyValueToDate(val, isExclusiveUpper),
        );
      }
      const date = new Date(val);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${this.formatDateInputValue(date)}T${hours}:${minutes}`;
    },
    toEmitValue(inputStr, isExclusiveUpper) {
      if (!inputStr) return null;
      if (this.dateOnly) {
        if (this.emitDateAsMillis) {
          const [y, m, d] = inputStr.split('-').map(Number);
          const offset = isExclusiveUpper ? 1 : 0;
          return new Date(y, m - 1, d + offset).getTime();
        }
        return inputStr;
      }
      return new Date(inputStr).getTime();
    },
    dateOnlyValueToDate(val, isExclusiveUpper) {
      if (this.emitDateAsMillis) {
        const date = new Date(Number(val));
        if (isExclusiveUpper) {
          date.setDate(date.getDate() - 1);
        }
        return date;
      }
      const [y, m, d] = String(val).split('-').map(Number);
      return new Date(y, m - 1, d);
    },
    formatDateInputValue(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    open() {
      this.$refs.pill.open();
    },
    onDropdownHide() {
      if (this.hasFilter) {
        this.syncFromValue();
      } else {
        this.tmpFrom = '';
        this.tmpTo = '';
      }
    },
    applyFilter() {
      if (!this.tmpFrom && !this.tmpTo) {
        return;
      }

      this.$emit('input', {
        from: this.toEmitValue(this.tmpFrom, false),
        to: this.toEmitValue(this.tmpTo, true),
      });
      this.$refs.pill.hide();
    },
    clearFilter() {
      this.tmpFrom = '';
      this.tmpTo = '';
      this.$refs.pill.hide();
      this.$emit('input', null);
    },
  },
};
</script>
