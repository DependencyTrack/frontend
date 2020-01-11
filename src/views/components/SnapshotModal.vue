<template>
  <b-modal id="snapshotModal" size="md" hide-header-close no-stacking :title="$t('message.snapshot_notification')">
    <p>
      This version of Dependency-Track is a snapshot release that is dynamically
      generated from continuous integration or from manually compiling from a branch.
      It is likely beta-quality software and has not undergone extensive testing.
      It may contain defects and incomplete features and functionality.
    </p>
    <p>
      Links to production-quality releases can be found at
      <a href="https://dependencytrack.org/">https://dependencytrack.org/</a>
    </p>
    <p>
      Please consider contributing feedback and pull requests to help improve
      Dependency-Track. All contributions are appreciated.
      <a href="https://github.com/DependencyTrack/dependency-track">https://github.com/DependencyTrack/dependency-track</a>
    </p>
    <p><strong>Do not use snapshot releases on production data.</strong></p>
    <template v-slot:modal-footer="{ cancel }">
      <b-button size="md" variant="outline-primary" @click="cancel()">{{ $t('message.close') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  export default {
    name: "SnapshotModal",
  }
</script>
