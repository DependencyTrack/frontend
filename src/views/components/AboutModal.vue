<template>
  <b-modal id="aboutModal" size="lg" hide-header-close no-stacking :title="$t('message.about')">
    <b-row>
      <b-col>
        <img src="@/assets/img/brand/logo-greyscale.svg">
      </b-col>
    </b-row>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="outline-primary" @click="cancel()">{{ $t('message.close') }}</b-button>
    </template>
  </b-modal>
</template>

<script>

  export default {
    name: "AboutModal",
    data() {
      return {
      }
    }
  }
</script>
