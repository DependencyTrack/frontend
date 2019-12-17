<template>
  <b-modal id="projectCreatePropertyModal" size="md" hide-header-close no-stacking :title="$t('message.create_project_property')">
    <b-form-group
      id="fieldset-1"
      :label="this.$t('message.group_name')"
      label-for="input-1"
      label-class="required">
      <b-form-input id="input-1" v-model="groupName" class="required" trim />
    </b-form-group>
    <b-form-group
      id="fieldset-2"
      :label="this.$t('message.property_name')"
      label-for="input-2"
      label-class="required">
      <b-form-input id="input-2" v-model="propertyName" class="required" trim />
    </b-form-group>
    <b-form-group
      id="fieldset-3"
      :label="this.$t('message.property_value')"
      label-for="input-3"
      label-class="required">
      <b-form-textarea id="input-3" v-model="propertyValue" class="required" trim />
    </b-form-group>
    <b-form-group
      id="fieldset-4"
      :label="this.$t('message.property_type')"
      label-for="input-4"
      label-class="required">
      <b-form-select id="input-4" v-model="propertyType" class="required" :options="options"/>
    </b-form-group>
    <b-form-group
      id="fieldset-5"
      :label="this.$t('message.description')"
      label-for="input-5">
      <b-form-textarea id="input-5" v-model="description" trim />
    </b-form-group>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.cancel') }}</b-button>
      <b-button size="md" variant="primary" @click="createVersion()">{{ $t('message.create') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  export default {
    name: "ProjectCreatePropertyModal",
    props: {
      uuid: String
    },
    data() {
      return {
        groupName: null,
        propertyName: null,
        propertyValue: null,
        propertyType: null,
        description: null,
        options: [
          { value: 'BOOLEAN', text: 'BOOLEAN' },
          { value: 'INTEGER', text: 'INTEGER' },
          { value: 'NUMBER', text: 'NUMBER' },
          { value: 'STRING', text: 'STRING' },
          { value: 'ENCRYPTEDSTRING', text: 'ENCRYPTEDSTRING' },
          { value: 'TIMESTAMP', text: 'TIMESTAMP' },
          { value: 'URL', text: 'URL' },
          { value: 'UUID', text: 'UUID' }
        ]
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
