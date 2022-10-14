<template>
  <b-card no-body :header="header">
    <b-card-body>
      <div id="customToolbar">
        <b-button size="md" variant="outline-primary" v-b-modal.createAlertModal>
          <span class="fa fa-plus"></span> {{ $t('admin.create_alert') }}
        </b-button>
      </div>
      <bootstrap-table
        ref="table"
        :columns="columns"
        :data="data"
        :options="options">
      </bootstrap-table>
    </b-card-body>
    <create-alert-modal v-on:refreshTable="refreshTable" />
  </b-card>
</template>

<script>
  import xssFilters from "xss-filters";
  import common from "../../../shared/common";
  import i18n from "../../../i18n";
  import CreateAlertModal from "./CreateAlertModal";
  import bootstrapTableMixin from "../../../mixins/bootstrapTableMixin";
  import EventBus from "../../../shared/eventbus";
  import ActionableListGroupItem from "../../components/ActionableListGroupItem";
  import SelectProjectModal from "../../portfolio/projects/SelectProjectModal";
  import SelectTeamModal from "../../administration/accessmanagement/SelectTeamModal";
  import permissionsMixin from "../../../mixins/permissionsMixin";
  import BToggleableDisplayButton from "../../components/BToggleableDisplayButton";
  import BInputGroupFormInput from "../../../forms/BInputGroupFormInput";
  import { Switch as cSwitch } from '@coreui/vue';

  export default {
    props: {
      header: String
    },
    mixins: [bootstrapTableMixin],
    components: {
      CreateAlertModal
    },
    mounted() {
      EventBus.$on('admin:alerts:rowUpdate', (index, row) => {
        this.$refs.table.updateRow( {index: index, row: row});
        this.$refs.table.expandRow(index);
      });
      EventBus.$on('admin:alerts:rowDeleted', (index, row) => {
        this.refreshTable();
      });
    },
    beforeDestroy() {
      EventBus.$off('admin:alerts:rowUpdate');
      EventBus.$off('admin:alerts:rowDeleted');
    },
    data() {
      return {
        columns: [
          {
            title: this.$t('message.name'),
            field: "name",
            sortable: false,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('admin.publisher'),
            field: "publisher.name",
            sortable: false,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('admin.scope'),
            field: "scope",
            sortable: false,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('admin.notification_level'),
            field: "notificationLevel",
            sortable: false,
            formatter(value, row, index) {
              return xssFilters.inHTMLData(common.valueWithDefault(value, ""));
            }
          },
          {
            title: this.$t('admin.enabled'),
            field: 'enabled',
            sortable: false,
            align: 'center',
            formatter: function (value, row, index) {
              return value === true ? '<i class="fa fa-check-square-o" />' : "";
            },
          },
        ],
        data: [],
        options: {
          search: true,
          showColumns: true,
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
                <b-row class="expanded-row">
                  <b-col sm="6">
                    <b-input-group-form-input id="input-name" :label="$t('message.name')" input-group-size="mb-3"
                                              required="true" type="text" v-model="name" lazy="true"
                                              v-debounce:750ms="updateNotificationRule" :debounce-events="'keyup'" />
                    <b-form-group>
                      <c-switch id="notificationEnabled" color="primary" v-model="enabled" label v-bind="labelIcon"/>
                      {{ $t('admin.enabled') }}
                    </b-form-group>
                    <b-form-group id="fieldset-2" :label="this.$t('admin.publisher_class')" label-for="input-2">
                      <b-form-input id="input-2" v-model="publisherClass" disabled class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group id="fieldset-3" :label="this.$t('admin.notification_level')" label-for="input-3">
                      <b-form-input id="input-3" v-model="notificationLevel" disabled class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-input-group-form-input id="input-destination" :label="$t('admin.destination')" input-group-size="mb-3"
                                              :required="(!(this.alert.hasOwnProperty('teams') && this.alert.teams != null && this.alert.teams.length > 0)).toString()"
                                              type="text" v-model="destination" lazy="true"
                                              v-debounce:750ms="updateNotificationRule" :debounce-events="'keyup'" />
                    <b-input-group-form-input v-if="this.publisherClass === 'org.dependencytrack.notification.publisher.JiraPublisher'" id="input-jiratickettype" 
                                              :label="$t('admin.jiratickettype')" :required="true" type="text" v-model="jiratickettype" lazy="true"
                                              v-debounce:750ms="updateNotificationRule" :debounce-events="'keyup'" />
                     <b-form-group v-if="this.publisherClass === 'org.dependencytrack.notification.publisher.SendMailPublisher'"
                                   id="teamDestinationList" :label="this.$t('admin.select_team_as_recipient')">
                       <div class="list group">
                          <span v-for="team in teams">
                            <actionable-list-group-item :value="team.name" :delete-icon="true" v-on:actionClicked="removeSelectedTeam(team.uuid)"></actionable-list-group-item>
                          </span>
                          <actionable-list-group-item :add-icon="true" v-on:actionClicked="$root.$emit('bv::show::modal', 'selectTeamModal')"></actionable-list-group-item>
                        </div>
                      </b-form-group>
                    <b-form-group v-if="limitToVisible === true" id="projectLimitsList" :label="this.$t('admin.limit_to_projects')">
                      <div class="list-group">
                        <span v-for="project in projects">
                          <actionable-list-group-item :value="formatProjectLabel(project.name, project.version)" :delete-icon="true" v-on:actionClicked="deleteLimiter(project.uuid)"/>
                        </span>
                        <actionable-list-group-item :add-icon="true" v-on:actionClicked="$root.$emit('bv::show::modal', 'selectProjectModal')"/>
                      </div>
                    </b-form-group>
                  </b-col>
                  <b-col sm="6">
                    <b-form-group id="fieldset-5" :label="this.$t('admin.scope')" label-for="input-5">
                      <b-form-input id="input-5" v-model="scope" disabled class="form-control disabled" readonly trim />
                    </b-form-group>
                    <b-form-group id="fieldset-6" :label="this.$t('admin.group')" label-for="input-6">
                      <div class="list-group" v-if="this.scope === 'PORTFOLIO'">
                        <b-form-checkbox-group id="checkbox-group-notify-on" v-model="notifyOn">
                          <div class="list-group-item"><b-form-checkbox value="NEW_VULNERABILITY">NEW_VULNERABILITY</b-form-checkbox></div>
                          <div class="list-group-item"><b-form-checkbox value="NEW_VULNERABLE_DEPENDENCY">NEW_VULNERABLE_DEPENDENCY</b-form-checkbox></div>
                          <div class="list-group-item"><b-form-checkbox value="PROJECT_AUDIT_CHANGE">PROJECT_AUDIT_CHANGE</b-form-checkbox></div>
                          <div class="list-group-item"><b-form-checkbox value="BOM_CONSUMED">BOM_CONSUMED</b-form-checkbox></div>
                          <div class="list-group-item"><b-form-checkbox value="BOM_PROCESSED">BOM_PROCESSED</b-form-checkbox></div>
                          <div class="list-group-item"><b-form-checkbox value="VEX_CONSUMED">VEX_CONSUMED</b-form-checkbox></div>
                          <div class="list-group-item"><b-form-checkbox value="VEX_PROCESSED">VEX_PROCESSED</b-form-checkbox></div>
                          <div class="list-group-item"><b-form-checkbox value="POLICY_VIOLATION">POLICY_VIOLATION</b-form-checkbox></div>
                        </b-form-checkbox-group>
                      </div>
                      <div class="list-group" v-if="this.scope === 'SYSTEM'">
                        <b-form-checkbox-group id="checkbox-group-notify-on" v-model="notifyOn">
                          <div class="list-group-item"><b-form-checkbox value="ANALYZER">ANALYZER</b-form-checkbox></div>
                          <div class="list-group-item"><b-form-checkbox value="DATASOURCE_MIRRORING">DATASOURCE_MIRRORING</b-form-checkbox></div>
                          <div class="list-group-item"><b-form-checkbox value="FILE_SYSTEM">FILE_SYSTEM</b-form-checkbox></div>
                          <div class="list-group-item"><b-form-checkbox value="INDEXING_SERVICE">INDEXING_SERVICE</b-form-checkbox></div>
                          <div class="list-group-item"><b-form-checkbox value="REPOSITORY">REPOSITORY</b-form-checkbox></div>
                        </b-form-checkbox-group>
                      </div>
                    </b-form-group>
                    <div style="text-align:right">
                      <b-toggleable-display-button variant="outline-primary" :label="$t('admin.limit_to')"
                                v-permission="PERMISSIONS.VIEW_PORTFOLIO" v-on:toggle="limitToVisible = !limitToVisible"
                                v-if="this.scope === 'PORTFOLIO'" />
                       <b-button variant="outline-danger" @click="deleteNotificationRule">{{ $t('admin.delete_alert') }}</b-button>
                    </div>
                  </b-col>
                  <select-project-modal v-on:selection="updateProjectSelection"/>
                  <select-team-modal v-on:selection="updateTeamSelection"></select-team-modal>
                </b-row>
              `,
              mixins: [permissionsMixin],
              components: {
                ActionableListGroupItem,
                SelectProjectModal,
                SelectTeamModal,
                BToggleableDisplayButton,
                BInputGroupFormInput,
                cSwitch
              },
              data() {
                return {
                  alert: row,
                  uuid: row.uuid,
                  name: row.name,
                  enabled: row.enabled,
                  publisherClass: row.publisher.publisherClass,
                  notificationLevel: row.notificationLevel,
                  destination: this.parseDestination(row),
                  jiratickettype: this.parseJiraTicketType(row),
                  scope: row.scope,
                  notifyOn: row.notifyOn,
                  projects: row.projects,
                  teams: row.teams,
                  limitToVisible: false,
                  labelIcon: {
                    dataOn: '\u2713',
                    dataOff: '\u2715'
                  },
                }
              },
              created() {
                this.parseDestination(this.alert);
                this.parseJiraTicketType(this.alert);
              },
              watch: {
                enabled() {
                  this.updateNotificationRule();
                },
                notifyOn() {
                  this.updateNotificationRule();
                },
                teams() {
                  this.updateNotificationRule();
                }
              },
              methods: {
                formatProjectLabel: function(projectName, projectVersion) {
                  if (projectName && projectVersion) {
                    return projectName + " " + projectVersion;
                  } else {
                    return projectName;
                  }
                },
                parseDestination: function(alert) {
                  if (alert.publisherConfig) {
                    let value = JSON.parse(alert.publisherConfig);
                    if (value) {
                      return value.destination;
                    }
                    return null;
                  }
                },
                parseJiraTicketType: function(alert) {
                  if (alert.publisherConfig) {
                    let value = JSON.parse(alert.publisherConfig);
                    if (value) {
                      return value.jiratickettype;
                    }
                    return null;
                  }
                },
                updateNotificationRule: function () {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_RULE}`;
                  this.axios.post(url, {
                    uuid: this.uuid,
                    name: this.name,
                    enabled: this.enabled,
                    notificationLevel: this.notificationLevel,
                    publisherConfig: JSON.stringify({ destination: this.destination, jiratickettype: this.jiratickettype }),
                    notifyOn: this.notifyOn
                  }).then((response) => {
                    this.alert = response.data;
                    this.destination = this.parseDestination(this.alert);
                    this.jiratickettype = this.parseJiraTicketType(this.alert);
                    EventBus.$emit('admin:alerts:rowUpdate', index, this.alert);
                    this.$toastr.s(this.$t('message.updated'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                deleteNotificationRule: function() {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_RULE}`;
                  this.axios.delete(url, { data: {
                      uuid: this.alert.uuid
                    }
                  }).then((response) => {
                    EventBus.$emit('admin:alerts:rowDeleted', index);
                    this.$toastr.s(this.$t('admin.alert_deleted'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                deleteLimiter: function(projectUuid) {
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_RULE}/${this.uuid}/project/${projectUuid}`;
                  this.axios.delete(url).then((response) => {
                    let p = [];
                    for (let i=0; i<this.projects.length; i++) {
                      if (this.projects[i].uuid !== projectUuid) {
                        p.push(this.projects[i]);
                      }
                    }
                    this.projects = p;
                    this.$toastr.s(this.$t('message.updated'));
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                },
                updateProjectSelection: function(selections) {
                  this.$root.$emit('bv::hide::modal', 'selectProjectModal');
                  for (let i=0; i<selections.length; i++) {
                    let selection = selections[i];
                    let url = `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_RULE}/${this.uuid}/project/${selection.uuid}`;
                    this.axios.post(url).then((response) => {
                      this.projects.push(selection);
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
                updateTeamSelection: function(selections){
                  this.$root.$emit('bv::hide::modal', 'selectTeamModal');
                  for (let i = 0; i<selections.length; i++){
                    let selection = selections[i];
                    let url = `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_RULE}/${this.uuid}/team/${selection.uuid}`;
                    this.axios.post(url).then((response) => {
                      if (this.teams){
                        this.teams.push(selection);
                      }  else {
                        this.teams = [];
                        let team = {
                          'uuid': selection.uuid,
                          'name': selection.name
                        }
                        this.teams.push(team);
                      }
                    }).catch((error) => {
                      if (error.response.status === 304) {
                        //this.$toastr.w(this.$t('condition.unsuccessful_action'));
                      } else {
                        this.$toastr.w(this.$t('condition.unsuccessful_action'));
                      }
                    });
                  }
                },
                removeSelectedTeam: function (teamUuid){
                  let url = `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_RULE}/${this.uuid}/team/${teamUuid}`;
                  this.axios.delete(url).then((response) => {
                    let newTeams = [];
                    for (let i=0; i<this.teams.length; i++) {
                      if (this.teams[i].uuid !== teamUuid) {
                        newTeams.push(this.teams[i]);
                      }
                    }
                    this.teams = newTeams;
                  }).catch((error) => {
                    this.$toastr.w(this.$t('condition.unsuccessful_action'));
                  });
                }
              }
            })
          },
          onExpandRow: this.vueFormatterInit,
          toolbar: '#customToolbar',
          responseHandler: function (res, xhr) {
            res.total = xhr.getResponseHeader("X-Total-Count");
            return res;
          },
          url: `${this.$api.BASE_URL}/${this.$api.URL_NOTIFICATION_RULE}`
        }
      };
    },
    methods: {
      refreshTable: function() {
        this.$refs.table.refresh({
          silent: true
        });
      }
    }
  }
</script>
