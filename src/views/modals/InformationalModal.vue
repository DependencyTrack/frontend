<template>
  <b-modal v-model="visible" hide-header-close>
    <template v-slot:modal-title>Information</template>
    <div class="row">
      <div class="col-sm-12 col-md-12">
        <div
          class="pull-left"
          style="width: 70px; min-width: 70px; max-width: 70px"
        >
          <i class="fa fa-info-circle fa-4x" aria-hidden="true"></i>
        </div>
        <div>
          <p>{{ message }}</p>
        </div>
      </div>
    </div>
    <template v-slot:modal-footer>
      <b-button class="btn btn-primary" @click="visible = false"
        >Close</b-button
      >
    </template>
  </b-modal>
</template>

<script>
import modalMixin from '@/mixins/modalMixin';

export default {
  name: 'InformationalModal',
  mixins: [modalMixin],
  compatConfig: { COMPONENT_V_MODEL: false },
  props: {
    message: String,
  },
};
</script>
