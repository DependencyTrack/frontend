<template>
  <span v-if="total === 0" class="progress">
    <b-progress class="table-progress" :max="'0'" show-value>
      <b-progress-bar class="table-progress" value="0"></b-progress-bar>
    </b-progress>
  </span>
  <span v-else class="progress">
    <span :id="'progressbar' + hoverId" class="table-progress">
      <b-progress class="table-progress" :max="total" show-value>
        <b-progress-bar :value="info" class="severity-info-bg"></b-progress-bar>
        <b-progress-bar :value="warn" class="severity-warn-bg"></b-progress-bar>
        <b-progress-bar :value="fail" class="severity-fail-bg"></b-progress-bar>
      </b-progress>
    </span>
  <b-tooltip :target="'progressbar' + hoverId" placement="left" noninteractive>
    <div style="text-align: left;">
    {{$t('policy_violation.infos')}}: {{ info }}<br>
    {{$t('policy_violation.warns')}}: {{ warn }}<br>
    {{$t('policy_violation.fails')}}: {{ fail }}<br>
    {{$t('message.total')}}: {{ total }}<br>
    </div>
  </b-tooltip>
  </span>
</template>

<script>
export default {
  props: {
    total: Number,
    info: Number,
    warn: Number,
    fail: Number,
    $t: Function,
  },
  data() {
    return {
      // Workaround for vue references to the progress-bars. Using the ref targets doesn't seem to work.
      hoverId: Math.random().toString(36),
    };
  },
}
</script>
