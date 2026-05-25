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

    <b-form-group :label="$t('message.since')" label-size="sm" class="mb-2">
      <b-input-group>
        <b-form-input
          :id="`datetime-range-filter-pill-from-${fieldName}`"
          v-model="tmpSince"
          :type="dateOnly ? 'date' : 'datetime-local'"
          size="sm"
        ></b-form-input>
        <b-input-group-append>
          <b-button
            size="sm"
            variant="outline-secondary"
            :disabled="!tmpSince"
            @click="tmpSince = ''"
            :title="$t('message.clear')"
            :aria-label="$t('message.clear') + ' ' + $t('message.since')"
          >
            <span class="fa fa-times-circle" aria-hidden="true"></span>
          </b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
    <b-form-group :label="$t('message.before')" label-size="sm" class="mb-2">
      <b-input-group>
        <b-form-input
          :id="`datetime-range-filter-pill-to-${fieldName}`"
          v-model="tmpBefore"
          :type="dateOnly ? 'date' : 'datetime-local'"
          size="sm"
        ></b-form-input>
        <b-input-group-append>
          <b-button
            size="sm"
            variant="outline-secondary"
            :disabled="!tmpBefore"
            @click="tmpBefore = ''"
            :title="$t('message.clear')"
            :aria-label="$t('message.clear') + ' ' + $t('message.before')"
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
        :disabled="!tmpSince && !tmpBefore"
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
      tmpSince: '',
      tmpBefore: '',
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
      return this.value && (this.value.since || this.value.before);
    },
    displayValue() {
      if (!this.value) return '';

      const since = this.value.since
        ? this.formatDisplayValue(this.value.since, false)
        : '';
      const before = this.value.before
        ? this.formatDisplayValue(this.value.before, true)
        : '';

      if (since && before) {
        return `${since} - ${before}`;
      } else if (since) {
        return `≥ ${since}`;
      } else if (before) {
        return `< ${before}`;
      }
      return '';
    },
  },
  // `before` is stored as an exclusive upper bound: when emitDateAsMillis is on,
  // it's the midnight *after* the selected day, so callers shift by ±1 day
  // when converting between the user-visible date and the stored value.
  methods: {
    syncFromValue() {
      const val = this.value;
      this.tmpSince =
        val && val.since ? this.toInputValue(val.since, false) : '';
      this.tmpBefore =
        val && val.before ? this.toInputValue(val.before, true) : '';
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
        this.tmpSince = '';
        this.tmpBefore = '';
      }
    },
    applyFilter() {
      if (!this.tmpSince && !this.tmpBefore) {
        return;
      }

      this.$emit('input', {
        since: this.toEmitValue(this.tmpSince, false),
        before: this.toEmitValue(this.tmpBefore, true),
      });
      this.$refs.pill.hide();
    },
    clearFilter() {
      this.tmpSince = '';
      this.tmpBefore = '';
      this.$refs.pill.hide();
      this.$emit('input', null);
    },
  },
};
</script>
