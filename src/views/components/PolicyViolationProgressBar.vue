<template>
  <span v-if="metrics.policy_violations_total === 0" class="progress">
    <b-progress
      class="table-progress"
      :max="'0'"
      show-value
      :aria-label="$t('message.policy_violations')"
      :aria-valuetext="valueText"
    >
      <b-progress-bar
        class="table-progress progress-bar-zero"
        value="0"
      ></b-progress-bar>
    </b-progress>
  </span>
  <span v-else class="progress">
    <b-tooltip placement="left" noninteractive>
      <template #target>
        <span class="table-progress">
          <b-progress
            class="table-progress"
            :max="metrics.policy_violations_total"
            show-value
            :aria-label="$t('message.policy_violations')"
            :aria-valuetext="valueText"
          >
            <b-progress-bar
              :value="metrics.policy_violations_info"
              class="severity-info-bg"
            ></b-progress-bar>
            <b-progress-bar
              :value="metrics.policy_violations_warn"
              class="severity-warn-bg"
            ></b-progress-bar>
            <b-progress-bar
              :value="metrics.policy_violations_fail"
              class="severity-fail-bg"
            ></b-progress-bar>
          </b-progress>
        </span>
      </template>
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
  },
  computed: {
    valueText() {
      const {
        policy_violations_info,
        policy_violations_warn,
        policy_violations_fail,
      } = this.metrics;
      return [
        `${this.$t('policy_violation.infos')}: ${policy_violations_info}`,
        `${this.$t('policy_violation.warns')}: ${policy_violations_warn}`,
        `${this.$t('policy_violation.fails')}: ${policy_violations_fail}`,
      ].join(', ');
    },
  },
};
</script>
