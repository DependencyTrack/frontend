<template>
  <b-modal
    id="addAffectedComponentModal"
    @hide="resetValues()"
    size="lg"
    hide-header-close
    :title="title"
  >
    <b-row>
      <b-col md="3">
        <b-input-group-form-select
          required="true"
          :label="$t('message.identifier_type')"
          v-model="affectedComponent.identityType"
          :options="identityTypes"
        />
      </b-col>
      <b-col md="6">
        <b-input-group-form-input
          input-group-size="mb-3"
          type="text"
          v-model="affectedComponent.identity"
          lazy="true"
          required="true"
          feedback="true"
          autofocus="false"
          :label="$t('message.identifier')"
          :tooltip="this.$t('message.component_identifier_desc')"
          :feedback-text="$t('message.required_component_identifier')"
        />
      </b-col>
      <b-col md="3">
        <b-input-group-form-select
          required="true"
          :label="$t('message.version_type')"
          v-model="affectedComponent.versionType"
          :options="versionTypes"
        />
      </b-col>
    </b-row>
    <b-row v-if="affectedComponent.versionType === 'RANGE'">
      <b-col md="2">
        <b-input-group-form-select
          required="false"
          v-model="rangeBeginSyntax"
          :options="startRangeTypes"
        />
      </b-col>
      <b-col md="4">
        <b-input-group-form-input
          input-group-size="mb-3"
          type="text"
          v-model="tempVersionStartRange"
          lazy="true"
          required="false"
          feedback="false"
          autofocus="false"
        />
      </b-col>
      <b-col md="2">
        <b-input-group-form-select
          required="false"
          v-model="rangeEndSyntax"
          :options="endRangeTypes"
        />
      </b-col>
      <b-col md="4">
        <b-input-group-form-input
          input-group-size="mb-3"
          type="text"
          v-model="tempVersionEndRange"
          lazy="true"
          required="false"
          feedback="false"
          autofocus="false"
        />
      </b-col>
    </b-row>

    <template #modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.cancel')
      }}</b-button>
      <b-button size="md" variant="primary" @click="composeObject()">{{
        okButton
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import permissionsMixin from '@/mixins/permissionsMixin';
import BInputGroupFormInput from '@/forms/BInputGroupFormInput';
import BInputGroupFormSelect from '@/forms/BInputGroupFormSelect';
import { BButton, BCol, BModal, BRow } from 'bootstrap-vue';

export default {
  components: {
    BInputGroupFormInput,
    BInputGroupFormSelect,
    BModal,
    BRow,
    BCol,
    BButton,
  },
  mixins: [permissionsMixin],
  data() {
    return {
      okButton: this.$t('message.add'),
      title: this.$t('message.add_affected_component'),
      affectedComponent: {
        identityType: 'PURL',
        identity: null,
        versionType: 'EXACT',
        version: null,
        versionEndExcluding: null,
        versionEndIncluding: null,
        versionStartExcluding: null,
        versionStartIncluding: null,
      },
      tempVersionStartRange: null,
      tempVersionEndRange: null,
      rangeBeginSyntax: null, // Temporary
      rangeEndSyntax: null, // Temporary
      identityTypes: [
        { value: 'PURL', text: this.$t('message.package_url') },
        { value: 'CPE', text: this.$t('message.cpe') },
      ],
      versionTypes: [
        { value: 'EXACT', text: this.$t('message.exact') },
        { value: 'RANGE', text: this.$t('message.range') },
      ],
      startRangeTypes: [
        { value: '>', text: '>' },
        { value: '>=', text: '>=' },
      ],
      endRangeTypes: [
        { value: '<', text: '<' },
        { value: '<=', text: '<=' },
      ],
    };
  },
  created() {
    this.$root.$on('object-event', (data) => {
      this.affectedComponent = data;
      this.okButton = this.$t('message.edit');
      this.title = this.$t('message.edit_affected_component');
    });
  },
  methods: {
    composeObject: function () {
      if (this.affectedComponent.versionType === 'RANGE') {
        if (
          this.tempVersionStartRange &&
          this.rangeBeginSyntax &&
          this.rangeBeginSyntax === '>'
        ) {
          this.affectedComponent.versionStartExcluding =
            this.tempVersionStartRange;
          this.affectedComponent.versionStartIncluding = null;
        } else if (
          this.tempVersionStartRange &&
          this.rangeBeginSyntax &&
          this.rangeBeginSyntax === '>='
        ) {
          this.affectedComponent.versionStartIncluding =
            this.tempVersionStartRange;
          this.affectedComponent.versionStartExcluding = null;
        }
        if (
          this.tempVersionEndRange &&
          this.rangeEndSyntax &&
          this.rangeEndSyntax === '<'
        ) {
          this.affectedComponent.versionEndExcluding = this.tempVersionEndRange;
          this.affectedComponent.versionEndIncluding = null;
        } else if (
          this.tempVersionEndRange &&
          this.rangeEndSyntax &&
          this.rangeEndSyntax === '<='
        ) {
          this.affectedComponent.versionEndIncluding = this.tempVersionEndRange;
          this.affectedComponent.versionEndExcluding = null;
        }
      } else {
        this.affectedComponent.versionStartIncluding = null;
        this.affectedComponent.versionStartExcluding = null;
        this.affectedComponent.versionEndIncluding = null;
        this.affectedComponent.versionEndExcluding = null;
      }
      this.$emit('affectedComponentAdded', this.affectedComponent);
      this.$root.$emit('bv::hide::modal', 'addAffectedComponentModal');
    },
    resetValues: function () {
      this.affectedComponent = {
        identityType: 'PURL',
        identity: null,
        versionType: 'EXACT',
        version: null,
        versionEndExcluding: null,
        versionEndIncluding: null,
        versionStartExcluding: null,
        versionStartIncluding: null,
      };
      this.tempVersionStartRange = null;
      this.tempVersionEndRange = null;
      this.rangeBeginSyntax = null;
      this.rangeEndSyntax = null;
      this.okButton = this.$t('message.add');
      this.title = this.$t('message.add_affected_component');
    },
    cancelEdit(cancel) {
      this.resetValues();
      cancel();
    },
    beforeDestroy() {
      this.$root.$off('object-event');
    },
  },
};
</script>
