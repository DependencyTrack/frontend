<template>
  <b-modal
    id="projectUploadVexModal"
    @hide="resetValues()"
    size="md"
    hide-header-close
    no-stacking
    :no-close-on-backdrop="isUploading"
    :no-close-on-esc="isUploading"
    :title="$t('message.upload_vex')"
  >
    <b-form-file
      v-model="file"
      class="mb-2"
      :disabled="isUploading"
      :placeholder="$t('message.no_file_chosen')"
      :browseText="$t('message.browse')"
    ></b-form-file>

    <template v-slot:modal-footer="{ cancel }">
      <b-button
        size="md"
        variant="secondary"
        :disabled="isUploading"
        @click="cancel()"
        >{{ $t('message.cancel') }}</b-button
      >
      <b-button
        size="md"
        variant="secondary"
        :disabled="isUploading"
        @click="file = null"
        >{{ $t('message.reset') }}</b-button
      >
      <b-button
        size="md"
        variant="primary"
        :disabled="file == null || isUploading"
        @click="upload()"
      >
        <b-spinner v-if="isUploading" small class="mr-1"></b-spinner>
        {{ $t('message.upload') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'ProjectUploadVexModal',
  props: {
    uuid: String,
  },
  data() {
    return {
      file: null,
      isUploading: false,
    };
  },
  methods: {
    resetValues: function () {
      this.file = null;
      this.isUploading = false;
    },
    upload: function () {
      let data = new FormData();
      data.set('project', this.uuid);
      data.set('vex', this.file);
      let config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      let url = `${this.$api.BASE_URL}/${this.$api.URL_VEX}`;
      this.isUploading = true;
      this.axios
        .post(url, data, config)
        .then(() => {
          this.$root.$emit('bv::hide::modal', 'projectUploadVexModal');
          this.$toastr.s(this.$t('message.vex_uploaded'));
        })
        .finally(() => {
          this.isUploading = false;
        });
    },
  },
};
</script>
