<template>
  <b-modal
    v-model="visible"
    @hide="resetValues()"
    no-stacking
    :no-close-on-backdrop="isUploading"
    :no-close-on-esc="isUploading"
    :title="$t('message.upload_bom')"
  >
    <div v-if="isReceived" class="d-flex gap-3 align-items-start" role="status">
      <i class="fa fa-check-circle fa-2x text-success" aria-hidden="true"></i>
      <div>
        <div class="fw-bold">{{ $t('message.bom_upload_received_title') }}</div>
        <div class="text-muted mt-1">
          {{ $t('message.bom_upload_received_detail') }}
        </div>
      </div>
    </div>
    <div v-else-if="isUploading">
      <div class="d-flex justify-content-between fw-bold">
        <span>{{ $t('message.bom_uploading', { file: file.name }) }}</span>
        <span>{{
          $t('message.bom_upload_progress', {
            loaded: formatBytes(uploadedBytes),
            total: formatBytes(totalBytes),
          })
        }}</span>
      </div>
      <b-progress
        class="mt-2"
        height="0.5rem"
        :value="uploadedBytes"
        :max="totalBytes || 1"
        :aria-label="$t('message.bom_upload_progress_label')"
      ></b-progress>
    </div>
    <b-form-file
      v-else
      v-model="file"
      class="mb-2"
      :placeholder="$t('message.no_file_chosen')"
      :browseText="$t('message.browse')"
    ></b-form-file>

    <template v-slot:footer="{ cancel }">
      <template v-if="isReceived">
        <b-button variant="primary" @click="cancel()">{{
          $t('message.close')
        }}</b-button>
      </template>
      <template v-else>
        <b-button
          variant="secondary"
          :disabled="isUploading"
          @click="cancel()"
          >{{ $t('message.cancel') }}</b-button
        >
        <b-button
          variant="secondary"
          :disabled="isUploading"
          @click="file = null"
          >{{ $t('message.reset') }}</b-button
        >
        <b-button
          variant="primary"
          :disabled="file == null || isUploading"
          @click="upload()"
        >
          <b-spinner v-if="isUploading" small class="me-1"></b-spinner>
          {{ $t('message.upload') }}
        </b-button>
      </template>
    </template>
  </b-modal>
</template>

<script>
import modalMixin from '@/mixins/modalMixin';
import { formatBytes } from '@/shared/bomProcessing';
import { startFollowingBomUpload } from '@/shared/bomUploads';

export default {
  name: 'ProjectUploadBomModal',
  mixins: [modalMixin],
  props: {
    uuid: String,
    projectName: String,
    projectVersion: String,
  },
  data() {
    return {
      file: null,
      isUploading: false,
      isReceived: false,
      uploadedBytes: 0,
      totalBytes: 0,
    };
  },
  methods: {
    formatBytes,
    resetValues: function () {
      this.file = null;
      this.isUploading = false;
      this.isReceived = false;
      this.uploadedBytes = 0;
      this.totalBytes = 0;
    },
    upload: function () {
      let data = new FormData();
      data.set('project', this.uuid);
      data.set('bom', this.file);
      let config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (event) => {
          this.uploadedBytes = event.loaded;
          this.totalBytes = event.total ?? this.file.size;
        },
      };
      let url = `${this.$api.BASE_URL}/${this.$api.URL_BOM}`;
      this.totalBytes = this.file.size;
      this.isUploading = true;
      this.axios
        .post(url, data, config)
        .then((response) => {
          // The server only accepted the BOM so far. Processing continues
          // there, and the project page reports how it goes.
          startFollowingBomUpload({
            token: response.data.token,
            projectUuid: this.uuid,
            projectName: this.projectName,
            projectVersion: this.projectVersion,
            startedAt: Date.now(),
          });
          this.isReceived = true;
          this.$toastr.i(this.$t('message.bom_received_toast'));
        })
        .finally(() => {
          this.isUploading = false;
        });
    },
  },
};
</script>
