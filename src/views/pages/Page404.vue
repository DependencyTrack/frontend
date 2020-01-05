<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="6">
          <div class="clearfix">
            <h1 class="float-left display-3 mr-4">404</h1>
            <h4 class="pt-3">{{ $t('404.heading') }}</h4>
            <p class="text-muted">{{ $t('404.message') }}</p>
          </div>
          <b-button block variant="outline-primary" href="/">{{ $t('404.action') }}</b-button>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Page404'
  }
</script>
