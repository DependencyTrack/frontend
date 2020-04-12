<template>
  <div class="animated fadeIn" v-permission="'POLICY_MANAGEMENT'">
    <div id="policiesToolbar" class="bs-table-custom-toolbar">
      <b-button size="md" variant="outline-primary" v-b-modal.createPolicyModal v-permission="PERMISSIONS.POLICY_MANAGEMENT">
        <span class="fa fa-plus"></span> {{ $t('message.create_policy') }}
      </b-button>
    </div>
    <bootstrap-table
      ref="table"
      :columns="columns"
      :data="data"
      :options="options"
      v-on:onLoadSuccess="tableLoaded" />
    <create-policy-modal v-on:refreshTable="refreshTable" />
  </div>
</template>

<script>
  import common from "../../shared/common";
  import xssFilters from "xss-filters";
  import CreatePolicyModal from "./CreatePolicyModal";
  import permissionsMixin from "../../mixins/permissionsMixin";
  import i18n from "../../i18n";
  import ActionableListGroupItem from "../components/ActionableListGroupItem";
  import BInputGroupFormInput from "../../forms/BInputGroupFormInput";
  import EventBus from "../../shared/eventbus";
  import bootstrapTableMixin from "../../mixins/bootstrapTableMixin";
  import BInputGroupFormSelect from "../../forms/BInputGroupFormSelect";
  import PolicyCondition from "./PolicyCondition";

  export default {
    mixins: [permissionsMixin, bootstrapTableMixin],
    components: {
      CreatePolicyModal
    },
    mounted() {
      EventBus.$on('policyManagement:policies:rowUpdate', (index, row) => {
        this.$refs.table.updateRow( {index: index, row: row});
        this.$refs.table.expandRow(index);
      });
      EventBus.$on('policyManagement:policies:rowDeleted', (index, row) => {
        this.refreshTable();
      });
    },
    beforeDestroy() {
      EventBus.$off('policyManagement:policies:rowUpdate');
      EventBus.$off('policyManagement:policies:rowDeleted');
    },
    methods: {
      tableLoaded: function(data) {
        if (data && Object.prototype.hasOwnProperty.call(data, "total")) {
          this.$emit('total', data.total);
        } else {
          this.$emit('total', '?');
        }
      },
      refreshTable: function() {
        this.$refs.table.refresh({
          silent: true
        });
      }
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('message.name'),
            field: "name",
            sortable: true,
            formatter(value, row, index) {
              return common.formatNotificationLabel(row.violationState) + ` ${xssFilters.inHTMLData(value)}`;
              //return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          }
        ],
        data: [],
        options: {
          showHeader: false,
          search: true,
          showColumns: false,
          showRefresh: true,
          pagination: true,
          silentSort: false,
          sidePagination: 'server',
          queryParamsType: 'pageSize',
          pageList: '[10, 25, 50, 100]',
          pageSize: 10,
          icons: {
            refresh: 'fa-refresh'
          },
          detailView: true,
          detailViewIcon: false,
          detailViewByClick: true,
          detailFormatter: (index, row) => {
            return this.vueFormatter({
              i18n,
              template: `
                <div>
                <b-row class="expanded-row">
                  <b-col sm="6">
                    <b-input-group-form-input id="identifier" :label="this.$t('message.name')" input-group-size="mb-3"
                        required="true" type="text" v-model="name" lazy="true"
                        v-debounce:750ms="updatePolicy" :debounce-events="'keyup'" />
                  </b-col>
                  <b-col sm="3">
                    <b-input-group-form-select id="input-repository-type" required="true"
                               v-model="operator" :options="operators"
                               :label="$t('message.operator')" />
                  </b-col>
                  <b-col sm="3">
                    <b-input-group-form-select id="input-repository-type" required="true"
                               v-model="violationState" :options="violationStates"
                               :label="$t('message.violation_state')" />
                  </b-col>
                </b-row>
                <b-row class="expanded-row">
                  <b-col sm="12">
                    <b-form-group :label="this.$t('message.conditions')">
                      <div class="list-group">
                        <span v-for="(condition, conditionIndex) in conditions">
                          <policy-condition :policy="policy" :condition="condition" v-on:conditionRemoved="removeCondition(condition, conditionIndex, index)" />
                        </span>
                        <actionable-list-group-item add-icon="true" v-on:actionClicked="addCondition" />
                      </div>
                    </b-form-group>
                    <div style="text-align:right">
                       <b-button variant="outline-danger" @click="deletePolicy">{{ $t('message.delete_policy') }}</b-button>
                    </div>
                  </b-col>
                </b-row>
                </div>
              `,
              mixins: [permissionsMixin],
              components: {
                ActionableListGroupItem,
                BInputGroupFormInput,
                BInputGroupFormSelect,
                PolicyCondition
              },
              data() {
                return {
                  policy: row,
                  name: row.name,
                  operator: row.operator,
                  violationState: row.violationState,
                  conditions: row.policyConditions,
                  operators: [
                    { value: 'ANY', text: 'Any' },
                    { value: 'ALL', text: 'All' }
                  ],
                  violationStates: [
                    { value: 'INFO', text: this.$t('violation.info') },
                    { value: 'WARN', text: this.$t('violation.warn') },
                    { value: 'FAIL', text: this.$t('violation.fail') }
                  ]
                }
              },
              methods: {
                addCondition: function() {
                  if (! this.conditions) {
                    this.conditions = [];
                  }
                  this.conditions.push({});
                },
                removeCondition: function(condition, conditionIndex, index) {
                  this.conditions = [];
                  this.refreshPolicy();
                  //this.conditions.splice(conditionIndex, 1);
                },
                refreshPolicy: function() {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}/${this.policy.uuid}`;
                  this.axios.get(url).then((response) => {
                    this.policy = response.data;
                    EventBus.$emit('policyManagement:policies:rowUpdate', index, this.policy);
                  });
                },
                updatePolicy: function () {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}`;
                  this.axios.post(url, {
                    uuid: this.policy.uuid,
                    name: this.name,
                    operator: this.operator,
                    violationState: this.violationState
                  }).then((response) => {
                    this.policy = response.data;
                    EventBus.$emit('policyManagement:policies:rowUpdate', index, this.policy);
                    this.$toastr.s(this.$t('message.updated'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                deletePolicy: function() {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}/${this.policy.uuid}`;
                  this.axios.delete(url).then((response) => {
                    EventBus.$emit('policyManagement:policies:rowDeleted', index);
                    this.$toastr.s(this.$t('message.policy_deleted'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                syncVariables: function(policy) {
                  this.policy = policy;
                  this.name = policy.name;
                  this.operator = policy.operator;
                  this.violationState = policy.violationState;
                  this.conditions = policy.policyConditions;
                }
              },
              watch: {
                operator() {
                  this.updatePolicy();
                },
                violationState() {
                  this.updatePolicy();
                }
              }
            })
          },
          onExpandRow: this.vueFormatterInit,
          toolbar: '#policiesToolbar',
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: `${this.$api.BASE_URL}/${this.$api.URL_POLICY}`
        }
      };
    }
  };
</script>
