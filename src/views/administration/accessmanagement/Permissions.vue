<template>
  <b-card no-body :header="header">
    <b-card-body>
      {{ header }}
    </b-card-body>
  </b-card>
</template>

<script>
  export default {
    props: {
      header: String
    }
  }
</script>
