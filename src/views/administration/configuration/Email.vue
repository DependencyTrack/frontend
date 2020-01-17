<template>
  <b-card no-body :header="header">
    <b-card-body>
      {{ header }}
    </b-card-body>
    <b-card-footer>
      <b-button variant="outline-primary" class="px-4" @click="saveChanges">{{ $t('message.update') }}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
  export default {
    props: {
      header: String
    }
  }
</script>
