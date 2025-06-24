<template>
  <b-card no-body>
    <b-card-body>
      <img alt="Composer logo" src="@/assets/img/composer-logo.png" />
      <hr />
      {{ $t('admin.vulnsource_composer_advisories_desc') }}
      <hr />
      {{ $t('admin.vulnsource_composer_to_enable') }}
      <a href="/admin/repositories/composer">
        {{ $t('admin.composer_repositories') }} </a
      >.
      <hr />
      {{ $t('admin.documentation') }}:
      <a href="https://docs.dependencytrack.org/datasources/composer/"
        >https://docs.dependencytrack.org/datasources/composer/</a
      >.
    </b-card-body>
  </b-card>
</template>
