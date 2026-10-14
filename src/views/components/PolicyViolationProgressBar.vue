<template>
  <span v-if="metrics.policyViolationsTotal === 0" class="progress">
    <b-progress class="table-progress" :max="'0'" show-value>
      <b-progress-bar
        class="table-progress text-dark"
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
            :max="metrics.policyViolationsTotal"
            show-value
          >
            <b-progress-bar
              :value="metrics.policyViolationsInfo"
              class="severity-info-bg text-dark"
            ></b-progress-bar>
            <b-progress-bar
              :value="metrics.policyViolationsWarn"
              class="severity-warn-bg text-dark"
            ></b-progress-bar>
            <b-progress-bar
              :value="metrics.policyViolationsFail"
              class="severity-fail-bg"
            ></b-progress-bar>
          </b-progress>
        </span>
      </template>
      <div style="text-align: left">
        <h5>{{ $t('message.type') }}</h5>
        <p>
          {{ $t('policy_violation.license') }}:
          {{ metrics.policyViolationsLicenseTotal }}<br />
          {{ $t('policy_violation.operational') }}:
          {{ metrics.policyViolationsOperationalTotal }}<br />
          {{ $t('policy_violation.security') }}:
          {{ metrics.policyViolationsSecurityTotal }}<br />
        </p>
        <h5>{{ $t('message.violation_state') }}</h5>
        <p>
          {{ $t('policy_violation.infos') }}: {{ metrics.policyViolationsInfo
          }}<br />
          {{ $t('policy_violation.warns') }}: {{ metrics.policyViolationsWarn
          }}<br />
          {{ $t('policy_violation.fails') }}: {{ metrics.policyViolationsFail
          }}<br />
        </p>
        {{ $t('message.total') }}: {{ metrics.policyViolationsTotal }}
      </div>
    </b-tooltip>
  </span>
</template>

<script>
export default {
  props: {
    metrics: Object,
  },
};
</script>
