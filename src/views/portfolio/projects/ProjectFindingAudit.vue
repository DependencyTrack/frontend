<template>
  <b-row>
    <b-col sm="6">
      <b-form-group
        id="fieldset-1"
        :label="this.$t('message.title')"
        label-for="input-1">
        <b-form-input id="input-1" v-model="title" class="form-control disabled" readonly trim />
      </b-form-group>
    </b-col>
    <b-col sm="6">

    </b-col>
  </b-row>
</template>

<script>
  export default {
    props: {
      finding: Object,
    },
    computed: {
      title () {
        return 'this is a test';
      }
    }
  }
</script>
