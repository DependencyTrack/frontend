<template>
  <b-modal
    v-model="visible"
    @show="resetValues()"
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

    <template v-slot:footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
      <b-button variant="primary" @click="updateComment()">{{
        $t('message.update')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import permissionsMixin from '../../../mixins/permissionsMixin';
import BInputGroupFormInput from '../../../forms/BInputGroupFormInput.vue';
import modalMixin from '@/mixins/modalMixin';

export default {
  mixins: [permissionsMixin, modalMixin],
  components: {
    BInputGroupFormInput,
  },
  props: {
    keyId: String,
    apiKey: Object,
  },
  data() {
    return {
      comment: null,
    };
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
          this.$emit('commentUpdated', response.data.comment);
          this.$toastr.s(this.$t('admin.api_key_comment_updated'));
          this.visible = false;
        });
    },
    resetValues: function () {
      this.comment = this.apiKey.comment;
    },
  },
};
</script>
