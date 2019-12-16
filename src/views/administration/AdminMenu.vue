<template>
  <div>
    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.configurationMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.configuration') }}</strong>
      </div>
      <b-collapse id="configurationMenu" visible accordion="admin-accordion" role="tabpanel">
        <b-list-group flush>
          <b-list-group-item href="#">{{ $t('admin.general') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.bom_formats') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.email') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.internal_components') }}</b-list-group-item>
        </b-list-group>
      </b-collapse>
    </b-card>
    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.analyzersMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.analyzers') }}</strong>
      </div>
      <b-collapse id="analyzersMenu" accordion="admin-accordion" role="tabpanel">
        <b-list-group flush>
          <b-list-group-item href="#">{{ $t('admin.internal_analyzer') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.npm_audit') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.oss_index') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.vulndb') }}</b-list-group-item>
        </b-list-group>
      </b-collapse>
    </b-card>
    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.repositoriesMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.repositories') }}</strong>
      </div>
      <b-collapse id="repositoriesMenu" accordion="admin-accordion" role="tabpanel">
        <b-list-group flush>
          <b-list-group-item href="#">{{ $t('admin.gem') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.hex') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.maven') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.npm') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.nuget') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.python') }}</b-list-group-item>
        </b-list-group>
      </b-collapse>
    </b-card>
    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.notificationsMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.notifications') }}</strong>
      </div>
      <b-collapse id="notificationsMenu" accordion="admin-accordion" role="tabpanel">
        <b-list-group flush>
          <b-list-group-item href="#">{{ $t('admin.alerts') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.templates') }}</b-list-group-item>
        </b-list-group>
      </b-collapse>
    </b-card>
    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.integrationsMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.integrations') }}</strong>
      </div>
      <b-collapse id="integrationsMenu" accordion="admin-accordion" role="tabpanel">
        <b-list-group flush>
          <b-list-group-item href="#">{{ $t('admin.fortify_ssc') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.kenna_security') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.threadfix') }}</b-list-group-item>
        </b-list-group>
      </b-collapse>
    </b-card>
    <b-card no-body class="admin-menu">
      <div slot="header" v-b-toggle.accessManagementMenu>
        <i class="fa fa-align-justify"></i><strong>&nbsp;&nbsp;{{ $t('admin.access_management') }}</strong>
      </div>
      <b-collapse id="accessManagementMenu" accordion="admin-accordion" role="tabpanel">
        <b-list-group flush>
          <b-list-group-item href="#">{{ $t('admin.ldap_users') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.managed_users') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.teams') }}</b-list-group-item>
          <b-list-group-item href="#">{{ $t('admin.permissions') }}</b-list-group-item>
        </b-list-group>
      </b-collapse>
    </b-card>
  </div>
</template>

<style scoped>
  .admin-menu {
    margin-bottom: .3rem;
  }
</style>
