<template>
  <b-modal
    :id="`editApiKeyCommentModal-${keyId}`"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('admin.edit_api_key_comment')"
  >
    <b-input-group-form-input
      id="name-input"
      input-group-size="mb-3"
      type="text"
      v-model="comment"
      lazy="true"
      feedback="true"
      autofocus="false"
      :label="$t('admin.api_key_comment')"
    />

    <template #modal-footer="{ cancel }">
      <b-button size="md" variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button size="md" variant="primary" @click="updateComment()">{{
        $t('message.update')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import permissionsMixin from '@/mixins/permissionsMixin';
import BInputGroupFormInput from '@/forms/BInputGroupFormInput';
import { BButton, BModal } from 'bootstrap-vue';

export default {
  components: {
    BInputGroupFormInput,
    BButton,
    BModal,
  },
  mixins: [permissionsMixin],
  props: {
    keyId: String,
    apiKey: Object,
  },
  data() {
    return {
      comment: null,
    };
  },
  mounted() {
    this.comment = this.apiKey.comment;
  },
  methods: {
    updateComment: function () {
      this.axios
        .post(
          `${this.$api.BASE_URL}/${this.$api.URL_TEAM}/key/${this.apiKey.publicId}/comment`,
          this.comment,
          {
            headers: {
              'Content-Type': 'text/plain',
            },
          },
        )
        .then((response) => {
          this.apiKey.comment = response.data.comment;
          this.$toastr.s(this.$t('admin.api_key_comment_updated'));
          this.$root.$emit(
            'bv::hide::modal',
            `editApiKeyCommentModal-${this.keyId}`,
          );
        });
    },
    resetValues: function () {
      this.comment = null;
    },
  },
};
</script>
