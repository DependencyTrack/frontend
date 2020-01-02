<template>
  <b-modal id="projectAddVersionModal" @hide="resetValues()" size="md" hide-header-close no-stacking :title="$t('message.add_version')">
    <b-form-group
      id="fieldset-1"
      :label="this.$t('message.version')"
      label-for="input-1"
      label-class="required">
      <b-form-input id="input-1" v-model="version" class="required" trim />
    </b-form-group>

    <b-form-checkbox id="checkbox-1" v-model="includeTags" name="checkbox-1" switch
                     value="true" unchecked-value="false"> {{ $t('message.include_tags') }}</b-form-checkbox>

    <b-form-checkbox id="checkbox-2" v-model="includeProperties" name="checkbox-2" switch
                     value="true" unchecked-value="false"> {{ $t('message.include_properties') }}</b-form-checkbox>

    <b-form-checkbox id="checkbox-3" v-model="includeDependencies" name="checkbox-3" switch
                     value="true" unchecked-value="false"> {{ $t('message.include_dependencies') }}</b-form-checkbox>

    <b-form-checkbox id="checkbox-4" v-model="includeAuditHistory" name="checkbox-4" switch
                     value="true" unchecked-value="false"> {{ $t('message.include_audit_history') }}</b-form-checkbox>

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
      uuid: String
    },
    data() {
      return {
        version: null,
        includeTags: true,
        includeProperties: true,
        includeDependencies: true,
        includeAuditHistory: true
      }
    },
    methods: {
      createVersion: function() {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_PROJECT}/clone`;
        this.axios.put(url, {
          project: this.uuid,
          version: this.version,
          includeTags: this.includeTags,
          includeProperties: this.includeProperties,
          includeDependencies: this.includeDependencies,
          includeAuditHistory: this.includeAuditHistory
        }).then((response) => {
          this.$root.$emit('bv::hide::modal', 'projectAddVersionModal');
          this.$toastr.s(this.$t('message.project_cloning_in_progress'));
        }).catch((error) => {
          this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
      },
      resetValues: function () {
        this.version = null;
        this.includeTags = true;
        this.includeProperties = true;
        this.includeDependencies = true;
        this.includeAuditHistory = true;
      }
    }
  }
</script>

<style lang="scss">
  @import "../../../assets/scss/vendors/vue-tags-input/vue-tags-input";
</style>
