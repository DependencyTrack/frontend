<template>
  <b-modal
    id="projectUploadVexModal"
    @hide="resetValues()"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('message.upload_vex')"
  >
    <b-form-file
      v-model="file"
      class="mb-2"
      :placeholder="$t('message.no_file_chosen')"
      :browse-text="$t('message.browse')"
    ></b-form-file>

    <template #modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.cancel')
      }}</b-button>
      <b-button size="md" variant="secondary" @click="file = null">{{
        $t('message.reset')
      }}</b-button>
      <b-button
        size="md"
        variant="primary"
        :disabled="file == null"
        @click="upload()"
        >{{ $t('message.upload') }}</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import { BButton, BFormFile, BModal } from 'bootstrap-vue';

export default {
  components: {
    BModal,
    BFormFile,
    BButton,
  },
  props: {
    uuid: String,
  },
  data() {
    return {
      file: null,
    };
  },
  methods: {
    resetValues: function () {
      this.file = null;
    },
    upload: function () {
      const data = new FormData();
      data.set('project', this.uuid);
      data.set('vex', this.file);
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      const url = `${this.$api.BASE_URL}/${this.$api.URL_VEX}`;
      this.axios.post(url, data, config).then(() => {
        this.$root.$emit('bv::hide::modal', 'projectUploadVexModal');
        this.$toastr.s(this.$t('message.vex_uploaded'));
      });
    },
  },
};
</script>
