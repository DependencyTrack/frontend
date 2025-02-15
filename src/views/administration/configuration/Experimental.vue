<template>
  <div>
    <b-card no-body :header="header">
      <b-card-body>
        <p>{{ $t('admin.experimental_info') }}</p>
      </b-card-body>
      <b-card-footer>
        <b-button
          variant="outline-primary"
          class="px-4"
          @click="saveChanges"
          disabled
        >
          {{ $t('message.update') }}
        </b-button>
      </b-card-footer>
    </b-card>
  </div>
</template>

<script>
import configPropertyMixin from '@/views/administration/mixins/configPropertyMixin';
import { BButton, BCard, BCardBody, BCardFooter } from 'bootstrap-vue';

export default {
  components: {
    BCard,
    BCardBody,
    BCardFooter,
    BButton,
  },
  mixins: [configPropertyMixin],
  props: {
    header: String,
  },
  data() {
    return {};
  },
  created() {
    this.axios.get(this.configUrl).then((response) => {
      let configItems = response.data.filter(function (item) {
        return item.groupName === 'experimental';
      });
      for (let i = 0; i < configItems.length; i++) {
        let item = configItems[i];
        switch (item.propertyName) {
        }
      }
    });
  },
  methods: {
    saveChanges: function () {
      this.updateConfigProperties([]);
    },
  },
};
</script>
