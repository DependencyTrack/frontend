<template>
  <b-modal v-model="visible" size="lg" no-stacking :title="$t('message.about')">
    <b-row>
      <b-col>
        <img
          class="logo-dark-theme"
          src="@/assets/img/brand/dt-logo-white-text.svg"
          alt="Dependency-Track Logo"
          width="200"
        />
        <img
          class="logo-light-theme"
          src="@/assets/img/brand/dt-logo-dark-text.svg"
          alt="Dependency-Track Logo"
          width="200"
        />
      </b-col>
      <b-col align="right">
        <img
          class="logo-dark-theme"
          src="@/assets/img/brand/owasp-logo-white.svg"
          alt="OWASP Logo"
          width="120"
        />
        <img
          class="logo-light-theme"
          src="@/assets/img/brand/owasp-logo-dark.svg"
          alt="OWASP Logo"
          width="120"
        />
      </b-col>
    </b-row>
    <hr />
    <p>
      OWASP Dependency-Track is an intelligent Component Analysis platform that
      allows organizations to identify and reduce risk in the software supply
      chain.
    </p>
    <b-row>
      <b-col>
        {{ this.dtrack.application }} v{{ this.dtrack.version }}<br />
        Build ID: {{ this.dtrack.uuid }}<br />
        Built On: {{ serverTimestamp }}
      </b-col>
      <b-col>
        Frontend v{{ this.$version.version }}<br />
        Build ID: {{ this.$version.uuid }}<br />
        Built On: {{ frontendTimestamp }}
      </b-col>
    </b-row>
    <hr />
    <b-row>
      <b-col>
        <h6>Community Resources</h6>
        <ul class="fa-ul">
          <li>
            <i class="fa-li fa fa-link" aria-hidden="true"></i
            ><a href="https://dependencytrack.org/">Website</a>
          </li>
          <li>
            <i class="fa-li fa fa-book" aria-hidden="true"></i
            ><a href="https://dependencytrack.github.io/docs/">Documentation</a>
          </li>
          <li>
            <i class="fa-li fa fa-github" aria-hidden="true"></i
            ><a href="https://github.com/DependencyTrack">GitHub</a>
          </li>
          <li>
            <i class="fa-li fa fa-slack" aria-hidden="true"></i
            ><a href="https://dependencytrack.org/slack">Slack</a> (<a
              href="https://dependencytrack.org/slack/invite"
              >invite</a
            >)
          </li>
          <li>
            <i class="fa-li fa fa-link" aria-hidden="true"></i
            ><a href="https://bsky.app/profile/dependencytrack.bsky.social"
              >Bluesky</a
            >
          </li>
          <li>
            <i class="fa-li fa fa-link" aria-hidden="true"></i
            ><a href="https://infosec.exchange/@DependencyTrack">Mastodon</a>
          </li>
          <li>
            <i class="fa-li fa fa-youtube-play" aria-hidden="true"></i
            ><a href="https://www.youtube.com/c/OWASPDependencyTrack"
              >YouTube</a
            >
          </li>
        </ul>
      </b-col>
      <b-col>
        <h6>Datasource Providers</h6>
        <ul class="fa-ul">
          <li>
            <i class="fa-li fa fa-link" aria-hidden="true"></i
            ><a href="https://nvd.nist.gov/">National Vulnerability Database</a>
          </li>
          <li>
            <i class="fa-li fa fa-link" aria-hidden="true"></i
            ><a href="https://ossindex.sonatype.org/">Sonatype OSS Index</a>
          </li>
          <li>
            <i class="fa-li fa fa-link" aria-hidden="true"></i
            ><a href="https://github.com/advisories">GitHub Advisories</a>
          </li>
          <li>
            <i class="fa-li fa fa-link" aria-hidden="true"></i
            ><a href="https://snyk.io/">Snyk</a>
          </li>
          <li>
            <i class="fa-li fa fa-link" aria-hidden="true"></i
            ><a href="https://osv.dev/">OSV</a>
          </li>
          <li>
            <i class="fa-li fa fa-link" aria-hidden="true"></i
            ><a href="https://vulndb.cyberriskanalytics.com">VulnDB</a>
          </li>
          <li>
            <i class="fa-li fa fa-link" aria-hidden="true"></i
            ><a href="https://advisory.checkmarx.net/advisory/">Checkmarx</a>
          </li>
        </ul>
      </b-col>
    </b-row>
    <template v-slot:footer="{ cancel }">
      <div class="mx-auto">
        Copyright &copy; OWASP Foundation. All Rights Reserved.
      </div>
      <b-button variant="outline-primary" @click="cancel()">{{
        $t('message.close')
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import common from '../../shared/common';
import state from '../../shared/state';
import modalMixin from '@/mixins/modalMixin';

export default {
  name: 'AboutModal',
  mixins: [modalMixin],
  computed: {
    dtrack: () => state.dtrack,
    serverTimestamp: function () {
      return common.formatTimestamp(this.dtrack.timestamp, true);
    },
    frontendTimestamp: function () {
      return common.formatTimestamp(this.$version.timestamp, true);
    },
  },
};
</script>
