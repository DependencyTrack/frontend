<template>
  <b-modal
    id="snapshotModal"
    size="md"
    hide-header-close
    no-stacking
    :title="$t('message.snapshot_notification')"
  >
    <b-row>
      <b-col>
        <img src="@/assets/img/brand/dt-logo-white-text.svg" width="200" />
      </b-col>
    </b-row>
    <hr />
    <p>
      This version of Dependency-Track is a snapshot release that is dynamically
      generated from continuous integration or from manually compiling from a
      branch. It is likely beta-quality software and has not undergone extensive
      testing. It may contain defects and incomplete features and functionality.
    </p>
    <p>
      Links to production-quality releases can be found at
      <a href="https://dependencytrack.org/">https://dependencytrack.org/</a>
    </p>
    <p>
      Please consider contributing feedback and pull requests to help improve
      the project. All contributions are appreciated. Visit Dependency-Track on
      <a href="https://github.com/DependencyTrack">GitHub</a>&nbsp;<i
        class="fa fa-github"
        aria-hidden="true"
      ></i>
    </p>
    <p><strong>Do not use snapshot releases on production data.</strong></p>
    <template #modal-footer="{ cancel }">
      <b-button size="md" variant="outline-primary" @click="cancel()"
        >{{ $t('message.close') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { BButton, BCol, BModal, BRow } from 'bootstrap-vue';

export default {
  components: {
    BModal,
    BButton,
    BRow,
    BCol,
  },
};
</script>
