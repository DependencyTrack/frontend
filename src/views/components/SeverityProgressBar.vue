<template>
  <span v-if="vulnerabilities === 0" class="progress">
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
          <b-progress class="table-progress" :max="vulnerabilities" show-value>
            <b-progress-bar
              :value="critical"
              class="severity-critical-bg"
            ></b-progress-bar>
            <b-progress-bar
              :value="high"
              class="severity-high-bg text-dark"
            ></b-progress-bar>
            <b-progress-bar
              :value="medium"
              class="severity-medium-bg text-dark"
            ></b-progress-bar>
            <b-progress-bar
              :value="low"
              class="severity-low-bg"
            ></b-progress-bar>
            <b-progress-bar
              :value="unassigned"
              class="severity-unassigned-bg"
            ></b-progress-bar>
          </b-progress>
        </span>
      </template>
      <div style="text-align: left">
        <h5>{{ $t('message.severity') }}</h5>
        <p>
          {{ $t('severity.critical') }}: {{ critical }}<br />
          {{ $t('severity.high') }}: {{ high }}<br />
          {{ $t('severity.medium') }}: {{ medium }}<br />
          {{ $t('severity.low') }}: {{ low }}<br />
          {{ $t('severity.unassigned') }}: {{ unassigned }}<br />
        </p>
        {{ $t('message.total') }}: {{ vulnerabilities }}
      </div>
    </b-tooltip>
  </span>
</template>

<script>
export default {
  props: {
    vulnerabilities: Number,
    critical: Number,
    high: Number,
    medium: Number,
    low: Number,
    unassigned: Number,
  },
};
</script>
