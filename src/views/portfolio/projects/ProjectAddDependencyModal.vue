<template>
  <b-modal id="projectAddDependencyModal" @hide="resetValues()" size="md" hide-header-close no-stacking :title="$t('message.add_dependency')">

    <h5>// TODO</h5>

  </b-modal>
</template>

<script>
  import api from "../../../shared/api";

  export default {
    name: "ProjectAddDependencyModal",
    props: {
      uuid: String
    },
    data() {
      return {

      }
    },
    methods: {
      resetValues: function () {
        //this.something = null;
      },
    }
  }
</script>
