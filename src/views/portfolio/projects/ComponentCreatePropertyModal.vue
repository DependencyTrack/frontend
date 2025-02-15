<template>
  <b-modal
    id="componentCreatePropertyModal"
    @hide="resetValues()"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('message.create_component_property')"
  >
    <b-form-group
      id="fieldset-1"
      :label="this.$t('message.group_name')"
      label-for="input-1"
    >
      <b-form-input id="input-1" v-model="groupName" trim />
    </b-form-group>
    <b-form-group
      id="fieldset-2"
      :label="this.$t('message.property_name')"
      label-for="input-2"
      label-class="required"
    >
      <b-form-input id="input-2" v-model="propertyName" class="required" trim />
    </b-form-group>
    <b-form-group
      id="fieldset-3"
      :label="this.$t('message.property_value')"
      label-for="input-3"
      label-class="required"
    >
      <b-form-textarea
        id="input-3"
        v-model="propertyValue"
        class="required"
        trim
      />
    </b-form-group>
    <b-form-group
      id="fieldset-4"
      :label="this.$t('message.property_type')"
      label-for="input-4"
      label-class="required"
    >
      <b-form-select
        id="input-4"
        v-model="propertyType"
        class="required"
        :options="options"
      />
    </b-form-group>
    <b-form-group
      id="fieldset-5"
      :label="this.$t('message.description')"
      label-for="input-5"
    >
      <b-form-textarea id="input-5" v-model="description" trim />
    </b-form-group>
    <template #modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button size="md" variant="primary" @click="createProperty()">{{
        $t('message.create')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import {
  BButton,
  BFormGroup,
  BFormInput,
  BFormSelect,
  BFormTextarea,
  BModal,
} from 'bootstrap-vue';

export default {
  components: {
    BModal,
    BFormGroup,
    BFormInput,
    BFormTextarea,
    BFormSelect,
    BButton,
  },
  props: {
    uuid: String,
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
        { value: 'TIMESTAMP', text: 'TIMESTAMP' },
        { value: 'URL', text: 'URL' },
        { value: 'UUID', text: 'UUID' },
      ],
    };
  },
  methods: {
    createProperty: function () {
      let url = `${this.$api.BASE_URL}/${this.$api.URL_COMPONENT}/${this.uuid}/property`;
      this.axios
        .put(url, {
          groupName: this.groupName,
          propertyName: this.propertyName,
          propertyValue: this.propertyValue,
          propertyType: this.propertyType,
          description: this.description,
        })
        .then(() => {
          this.$root.$emit('bv::hide::modal', 'componentCreatePropertyModal');
          this.$root.$emit('bv::show::modal', 'componentPropertiesModal');
          this.$toastr.s(this.$t('message.property_created'));
        });
    },
    resetValues: function () {
      this.groupName = null;
      this.propertyName = null;
      this.propertyValue = null;
      this.propertyType = null;
      this.description = null;
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/scss/vendors/vue-tags-input/vue-tags-input';
</style>
