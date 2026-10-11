<template>
  <b-modal :id="id" size="lg" hide-header-close no-stacking>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
    >
    </bootstrap-table>

    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">
        {{ $t('message.cancel') }}
      </b-button>
      <b-button size="md" variant="primary" @click="selectValues">
        {{ $t('message.select') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import xssFilters from 'xss-filters';
import common from '../../shared/common';

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    allowedValues: {
      type: Array,
      required: true,
    },
    selectedValues: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      columns: [
        {
          field: 'state',
          checkbox: true,
          align: 'center',
        },
        {
          title: this.$t('message.name'),
          field: 'name',
          sortable: true,
          formatter(value) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ''));
          },
        },
      ],
      options: {
        search: true,
        showColumns: true,
        showRefresh: false,
        pagination: true,
        silentSort: false,
        sidePagination: 'client',
        pageList: '[10, 25, 50, 100]',
        pageSize: 10,
        icons: {
          refresh: 'fa-refresh',
        },
      },
    };
  },
  computed: {
    // Build table data from allowedValues
    data() {
      return this.allowedValues.map((val) => ({
        name: val,
        state: this.selectedValues.includes(val),
      }));
    },
  },
  methods: {
    selectValues() {
      const selections = this.$refs.table
        .getSelections()
        .map((row) => row.name);
      this.$emit('selection', selections);
    },
  },
};
</script>
../../shared/common
