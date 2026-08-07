<template>
  <span v-if="metrics.policy_violations_total === 0" class="progress">
    <b-progress class="table-progress" :max="'0'" show-value>
      <b-progress-bar
        class="table-progress text-dark"
        value="0"
      ></b-progress-bar>
    </b-progress>
  </span>
  <span v-else class="progress">
    <span :id="'progressbar' + hoverId" class="table-progress">
      <b-progress
        class="table-progress"
        :max="metrics.policy_violations_total"
        show-value
      >
        <b-progress-bar
          :value="metrics.policy_violations_info"
          class="severity-info-bg text-dark"
        ></b-progress-bar>
        <b-progress-bar
          :value="metrics.policy_violations_warn"
          class="severity-warn-bg text-dark"
        ></b-progress-bar>
        <b-progress-bar
          :value="metrics.policy_violations_fail"
          class="severity-fail-bg"
        ></b-progress-bar>
      </b-progress>
    </span>
    <b-tooltip
      :target="'progressbar' + hoverId"
      placement="left"
      noninteractive
    >
      <div style="text-align: left">
        <h5>{{ $t('message.type') }}</h5>
        <p>
          {{ $t('policy_violation.license') }}:
          {{ metrics.policy_violations_license_total }}<br />
          {{ $t('policy_violation.operational') }}:
          {{ metrics.policy_violations_operational_total }}<br />
          {{ $t('policy_violation.security') }}:
          {{ metrics.policy_violations_security_total }}<br />
        </p>
        <h5>{{ $t('message.violation_state') }}</h5>
        <p>
          {{ $t('policy_violation.infos') }}: {{ metrics.policy_violations_info
          }}<br />
          {{ $t('policy_violation.warns') }}: {{ metrics.policy_violations_warn
          }}<br />
          {{ $t('policy_violation.fails') }}: {{ metrics.policy_violations_fail
          }}<br />
        </p>
        {{ $t('message.total') }}: {{ metrics.policy_violations_total }}
      </div>
    </b-tooltip>
  </span>
</template>

<script>
export default {
  props: {
    metrics: Object,
    $t: Function,
  },
  data() {
    return {
      // Workaround for vue references to the progress-bars. Using the ref targets doesn't seem to work.
      hoverId: Math.random().toString(36),
    };
  },
};
</script>
