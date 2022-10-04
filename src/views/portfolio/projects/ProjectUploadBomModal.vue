<template>
  <b-modal id="projectUploadBomModal" @hide="resetValues()" size="md" hide-header-close no-stacking :title="$t('message.upload_bom')">

    <b-form-file v-model="file" class="mb-2" :placeholder="$t('message.no_file_chosen')" :browseText="$t('message.browse')"></b-form-file>

    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{ $t('message.cancel') }}</b-button>
      <b-button size="md" variant="secondary" @click="file = null">{{ $t('message.reset') }}</b-button>
      <b-button size="md" variant="primary" :disabled="file == null" @click="upload()">{{ $t('message.upload') }}</b-button>
    </template>
  </b-modal>
</template>

<script>

  export default {
    name: "ProjectUploadBomModal",
    props: {
      uuid: String
    },
    data() {
      return {
        file: null
      }
    },
    methods: {
      resetValues: function () {
        this.file = null;
      },
      upload: function () {
        let data = new FormData();
        data.set("project", this.uuid);
        data.set('bom', this.file);
        let config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };
        let url = `${this.$api.BASE_URL}/${this.$api.URL_BOM}`;
        this.axios.post(url, data, config)
          .then((response) => {
            this.$root.$emit('bv::hide::modal', 'projectUploadBomModal');
            this.$toastr.s(this.$t('message.bom_uploaded'));
          }).catch((error) => {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
        });
      }
    }
  }
</script>
