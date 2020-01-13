<template>
  <div class="animated fadeIn" v-permission="'SYSTEM_CONFIGURATION'">

    <b-row>
      <b-col xs="6" sm="4" md="2">
        <admin-menu />
      </b-col>
      <b-col xs="6" sm="8" md="10">
        <div class="tab-content">
          <!-- CONFIGURATION -->
          <b-card :header="$t('admin.general')" class="tab-pane active" id="generalConfigTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.bom_formats')" class="tab-pane" id="artifactsTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.email')" class="tab-pane" id="emailTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.internal_components')" class="tab-pane" id="internalComponentsTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <!-- ANALYZERS -->
          <b-card :header="$t('admin.internal_analyzer') " class="tab-pane" id="scannerInternalTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.npm_audit')" class="tab-pane" id="scannerNpmAuditTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.oss_index')" class="tab-pane" id="scannerOssIndexTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.vulndb')" class="tab-pane" id="scannerVulnDbTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <!-- REPOSITORIES -->
          <b-card :header="$t('admin.gem') " class="tab-pane" id="repositoryGemTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.hex')" class="tab-pane" id="repositoryHexTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.maven')" class="tab-pane" id="repositoryMavenTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.npm')" class="tab-pane" id="repositoryNpmTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.nuget')" class="tab-pane" id="repositoryNugetTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.python')" class="tab-pane" id="repositoryPythonTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <!-- NOTIFICATIONS -->
          <b-card :header="$t('admin.alerts') " class="tab-pane" id="notificationAlertTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.templates')" class="tab-pane" id="notificationTemplateTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <!-- INTEGRATIONS -->
          <b-card :header="$t('admin.fortify_ssc')" class="tab-pane" id="integrationsFortifySscTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.kenna_security')" class="tab-pane" id="integrationsKennaSecurityTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.threadfix')" class="tab-pane" id="integrationsThreadFixTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <!-- ACCESS MANAGEMENT -->
          <b-card :header="$t('admin.ldap_users')" class="tab-pane" id="ldapUsersTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.managed_users')" class="tab-pane" id="managedUsersTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.teams')" class="tab-pane" id="teamsTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

          <b-card :header="$t('admin.permissions')" class="tab-pane" id="permissionsTab" role="tabpanel">
            <b-card-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</b-card-text>
          </b-card>

        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import AdminMenu from './AdminMenu'
  export default {
    components: {
      AdminMenu
    }
  }
</script>

<style>
  .tab-content {
    border: 0;
  }
  .tab-content .tab-pane {
    padding: 0;
  }
  .card-header {
    font-weight: 700;
  }
</style>

