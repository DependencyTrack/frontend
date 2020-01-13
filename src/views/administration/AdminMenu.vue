<template>
  <div>

    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.configurationMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.configuration') }}</strong>
      </div>
      <b-collapse id="configurationMenu" visible accordion="admin-accordion" role="tabpanel">
        <div class="list-group" id="list-tab" role="tablist">
          <a v-for="item in configurationMenu" class="list-group-item list-group-item-action" data-toggle="list" role="tab"
             :href="item.href">{{ item.name }}</a>
        </div>
      </b-collapse>
    </b-card>

    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.analyzersMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.analyzers') }}</strong>
      </div>
      <b-collapse id="analyzersMenu" accordion="admin-accordion" role="tabpanel">
        <div class="list-group" id="list-tab" role="tablist">
          <a v-for="item in analyzersMenu" class="list-group-item list-group-item-action" data-toggle="list" role="tab"
             :href="item.href">{{ item.name }}</a>
        </div>
      </b-collapse>
    </b-card>

    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.repositoriesMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.repositories') }}</strong>
      </div>
      <b-collapse id="repositoriesMenu" accordion="admin-accordion" role="tabpanel">
        <div class="list-group" id="list-tab" role="tablist">
          <a v-for="item in repositoriesMenu" class="list-group-item list-group-item-action" data-toggle="list" role="tab"
             :href="item.href">{{ item.name }}</a>
        </div>
      </b-collapse>
    </b-card>

    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.notificationsMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.notifications') }}</strong>
      </div>
      <b-collapse id="notificationsMenu" accordion="admin-accordion" role="tabpanel">
        <div class="list-group" id="list-tab" role="tablist">
          <a v-for="item in notificationsMenu" class="list-group-item list-group-item-action" data-toggle="list" role="tab"
             :href="item.href">{{ item.name }}</a>
        </div>
      </b-collapse>
    </b-card>

    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.integrationsMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.integrations') }}</strong>
      </div>
      <b-collapse id="integrationsMenu" accordion="admin-accordion" role="tabpanel">
        <div class="list-group" id="list-tab" role="tablist">
          <a v-for="item in integrationsMenu" class="list-group-item list-group-item-action" data-toggle="list" role="tab"
             :href="item.href">{{ item.name }}</a>
        </div>
      </b-collapse>
    </b-card>

    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.accessManagementMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.access_management') }}</strong>
      </div>
      <b-collapse id="accessManagementMenu" accordion="admin-accordion" role="tabpanel">
        <div class="list-group" id="list-tab" role="tablist">
          <a v-for="item in accessManagementMenu" class="list-group-item list-group-item-action" data-toggle="list" role="tab"
             :href="item.href">{{ item.name }}</a>
        </div>
      </b-collapse>
    </b-card>

  </div>
</template>

<script>

  export default {
    data() {
      return {
        configurationMenu: [
          {
            name: this.$t('admin.general'),
            href: "#generalConfigTab"
          },
          {
            name: this.$t('admin.bom_formats'),
            href: "#artifactsTab"
          },
          {
            name: this.$t('admin.email'),
            href: "#emailTab"
          },
          {
            name: this.$t('admin.internal_components'),
            href: "#internalComponentsTab"
          }
        ],
        analyzersMenu: [
          {
            name: this.$t('admin.internal_analyzer'),
            href: "#scannerInternalTab"
          },
          {
            name: this.$t('admin.npm_audit'),
            href: "#scannerNpmAuditTab"
          },
          {
            name: this.$t('admin.oss_index'),
            href: "#scannerOssIndexTab"
          },
          {
            name: this.$t('admin.vulndb'),
            href: "#scannerVulnDbTab"
          }
        ],
        repositoriesMenu: [
          {
            name: this.$t('admin.gem'),
            href: "#repositoryGemTab"
          },
          {
            name: this.$t('admin.hex'),
            href: "#repositoryHexTab"
          },
          {
            name: this.$t('admin.maven'),
            href: "#repositoryMavenTab"
          },
          {
            name: this.$t('admin.npm'),
            href: "#repositoryNpmTab"
          },
          {
            name: this.$t('admin.nuget'),
            href: "#repositoryNugetTab"
          },
          {
            name: this.$t('admin.python'),
            href: "#repositoryPythonTab"
          }
        ],
        notificationsMenu: [
          {
            name: this.$t('admin.alerts'),
            href: "#notificationAlertTab"
          },
          {
            name: this.$t('admin.templates'),
            href: "#notificationTemplateTab"
          }
        ],
        integrationsMenu: [
          {
            name: this.$t('admin.fortify_ssc'),
            href: "#integrationsFortifySscTab"
          },
          {
            name: this.$t('admin.kenna_security'),
            href: "#integrationsKennaSecurityTab"
          },
          {
            name: this.$t('admin.threadfix'),
            href: "#integrationsThreadFixTab"
          }
        ],
        accessManagementMenu: [
          {
            name: this.$t('admin.ldap_users'),
            href: "#ldapUsersTab"
          },
          {
            name: this.$t('admin.managed_users'),
            href: "#managedUsersTab"
          },
          {
            name: this.$t('admin.teams'),
            href: "#teamsTab"
          },
          {
            name: this.$t('admin.permissions'),
            href: "#permissionsTab"
          }
        ]
      }
    }
  }
</script>

<style scoped>
  .admin-menu {
    margin-bottom: .3rem;
  }
  .list-group-item:first-child, .list-group-item:last-child {
    border-radius: 0;
  }
  .list-group-item {
    border-left: 0;
    border-right: 0;
  }
</style>
