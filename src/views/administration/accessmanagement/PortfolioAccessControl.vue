<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <c-switch id="isAclEnabled" color="primary" v-model="isAclEnabled" label v-bind="labelIcon" />{{$t('admin.enable_acl')}}
      </div>
      <bootstrap-table
        ref="table"
        :columns="columns"
        :data="data"
        :options="options">
      </bootstrap-table>
    </b-card-body>
  </b-card>
</template>

<script>
import xssFilters from "xss-filters";
import common from "../../../shared/common";
import i18n from "../../../i18n";
import bootstrapTableMixin from "../../../mixins/bootstrapTableMixin";
import EventBus from "../../../shared/eventbus";
import ActionableListGroupItem from "../../components/ActionableListGroupItem";
import SelectProjectModal from "./SelectProjectModal";
import permissionsMixin from "../../../mixins/permissionsMixin";
import {Switch as cSwitch} from "@coreui/vue";
import BInputGroupFormInput from "../../../forms/BInputGroupFormInput";
import configPropertyMixin from "../mixins/configPropertyMixin";

export default {
  props: {
    header: String
  },
  mixins: [bootstrapTableMixin, configPropertyMixin],
  components: {
    cSwitch
  },
  data() {
    return {
      isAclEnabled: false,
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715'
      },
      columns: [
        {
          title: this.$t('admin.team_name'),
          field: "name",
          sortable: false,
          formatter(value, row, index) {
            return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
          }
        }
      ],
      data: [],
      options: {
        search: true,
        showColumns: true,
        showRefresh: true,
        pagination: true,
        silentSort: false,
        sidePagination: 'client',
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
                <b-row class="expanded-row">
                  <b-col sm="6">
                    <b-form-group :label="this.$t('admin.project_access')">
                      <div class="list-group">
                        <span v-for="project in projects">
                          <actionable-list-group-item :value="projectLabel(project.name, project.version)" :delete-icon="true" v-on:actionClicked="removeProjectMapping(project.uuid)"/>
                        </span>
                        <actionable-list-group-item :add-icon="true" v-on:actionClicked="$root.$emit('bv::show::modal', 'selectProjectModal')"/>
                      </div>
                    </b-form-group>
                  </b-col>
                  <b-col sm="6">
                  </b-col>
                  <select-project-modal v-on:selection="updateProjectSelection" />
                </b-row>
              `,
            mixins: [permissionsMixin],
            components: {
              cSwitch,
              ActionableListGroupItem,
              SelectProjectModal,
              BInputGroupFormInput
            },
            data() {
              return {
                team: row,
                name: row.name,
                projects: row.mappedLdapGroups,
                labelIcon: {
                  dataOn: '\u2713',
                  dataOff: '\u2715'
                }
              }
            },
            methods: {
              projectLabel: function(name, version) {
                if (version) {
                  return name + " " + version;
                } else {
                  return name;
                }
              },
              updateProjectSelection: function(selections) {
                this.$root.$emit('bv::hide::modal', 'selectProjectModal');
                for (let i=0; i<selections.length; i++) {
                  let selection = selections[i];
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_ACL_MAPPING}`;
                  this.axios.put(url, {
                    team: this.team.uuid,
                    project: selection.uuid
                  }).then((response) => {
                    if (this.projects === undefined || this.projects === null) {
                      this.projects = [];
                    }
                    this.projects.push({name:selection.name, version:selection.version, uuid:selection.uuid});
                    this.projects.sort();
                    this.$toastr.s(this.$t('message.updated'));
                  }).catch((error) => {
                    if (error.response.status === 304) {
                      //this.$toastr.w(this.$t('condition.unsuccessful_action'));
                    } else {
                      this.$toastr.w(this.$t('condition.unsuccessful_action'));
                    }
                  });
                }
              },
              removeProjectMapping: function(projectUuid) {
                let url = `${this.$api.BASE_URL}/${this.$api.URL_ACL_MAPPING}/team/${this.team.uuid}/project/${projectUuid}`;
                this.axios.delete(url).then((response) => {
                  let k = [];
                  for (let i=0; i<this.projects.length; i++) {
                    if (this.projects[i].uuid !== projectUuid) {
                      k.push(this.projects[i]);
                    }
                  }
                  this.projects = k;
                  this.$toastr.s(this.$t('message.updated'));
                }).catch((error) => {
                  this.$toastr.w(this.$t('condition.unsuccessful_action'));
                });
              }
            },
            mounted() {
              let url = `${this.$api.BASE_URL}/${this.$api.URL_ACL_TEAM}/${this.team.uuid}`;
              this.axios
                .get(url)
                .then(response => {
                  this.projects = response.data;
                })
                .catch(error => {
                  this.$toastr.w(this.$t("condition.unsuccessful_action"));
                });
            }
          })
        },
        onExpandRow: this.vueFormatterInit,
        toolbar: '#customToolbar',
        responseHandler: function (res, xhr) {
          res.total = xhr.getResponseHeader("X-Total-Count");
          return res;
        },
        url: `${this.$api.BASE_URL}/${this.$api.URL_TEAM}`
      }
    };
  },
  methods: {
    refreshTable: function() {
      this.$refs.table.refresh({
        silent: true
      });
    },
    updateProperties: function() {
      this.updateConfigProperties([
        {groupName: 'access-management', propertyName: 'acl.enabled', propertyValue: this.isAclEnabled}
      ]);
    },
    updateConfigProperties: function(configProperties) {
      let props = [];
      for (let i=0; i<configProperties.length; i++) {
        let prop = configProperties[i];
        prop.propertyValue = common.trimToNull(prop.propertyValue);
        props.push(prop);
      }
      let url = `${this.$api.BASE_URL}/${this.$api.URL_CONFIG_PROPERTY}/aggregate`;
      this.axios.post(url, props).then((response) => {
        this.$toastr.s(this.$t('admin.configuration_saved'));
      }).catch((error) => {
        this.$toastr.w(this.$t('condition.unsuccessful_action'));
      });
    },
  },
  watch:{
    isAclEnabled() {
      this.updateProperties();
    }
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) { return item.groupName === "access-management" });
      for (let i=0; i<configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
          case "acl.enabled":
            this.isAclEnabled = common.toBoolean(item.propertyValue); break;
        }
      }
    });
  }
}
</script>
