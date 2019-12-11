<template>
  <b-modal id="projectAddVersionModal" size="md" hide-header-close no-stacking :title="$t('message.add_version')">

    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.cancel') }}</b-button>
      <b-button size="md" variant="primary" @click="createVersion()">{{ $t('message.create') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  export default {
    name: "ProjectAddVersionModal",
    props: {
      project: Object
    },
    data() {
      return {

      }
    },
    methods: {
      createVersion: function() {
        console.log("Create version");
        //return getStyle(style);
      }
    }
  }
</script>

<style lang="scss">
  @import "../../../assets/scss/vendors/vue-tags-input/vue-tags-input";
</style>
