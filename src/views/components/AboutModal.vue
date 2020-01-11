<template>
  <b-modal id="aboutModal" size="lg" hide-header-close no-stacking :title="$t('message.about')">
    <b-row>
      <b-col>
        <img src="@/assets/img/brand/logo-greyscale.svg">
      </b-col>
    </b-row>
    <hr/>
    <p>
      Dependency-Track is an intelligent software supply-chain component analysis platform that allows organizations to identify and reduce risk from the use of third-party and open source components.
    </p>
    <b-row>
      <b-col>
        {{ this.$dtrack.application }} v{{ this.$dtrack.version }}<br/>
        Build ID: {{ this.$dtrack.uuid }}<br/>
        Built On: {{ timestamp }}
      </b-col>
      <b-col>
        Frontend v{{ this.$version }}<br/>
      </b-col>
    </b-row>
    <hr/>
    <b-row>
      <b-col>
        <h6>Community Resources</h6>
        <ul class="fa-ul">
          <li><i class="fa-li fa fa-link" aria-hidden="true"></i><a href="https://dependencytrack.org/">Website</a></li>
          <li><i class="fa-li fa fa-book" aria-hidden="true"></i><a href="https://docs.dependencytrack.org/">Documentation</a></li>
          <li><i class="fa-li fa fa-github" aria-hidden="true"></i><a href="https://github.com/DependencyTrack">GitHub</a></li>
          <li><i class="fa-li fa fa-slack" aria-hidden="true"></i><a href="https://dependencytrack.org/slack">Slack</a> (<a href="https://dependencytrack.org/slack/invite">invite</a>)</li>
          <li><i class="fa-li fa fa-twitter" aria-hidden="true"></i><a href="https://twitter.com/dependencytrack">Twitter</a></li>
          <li><i class="fa-li fa fa-youtube-play" aria-hidden="true"></i><a href="https://www.youtube.com/c/OWASPDependencyTrack">YouTube</a></li>
        </ul>
      </b-col>
      <b-col>
        <h6>Datasource Providers</h6>
        <ul class="fa-ul">
          <li><i class="fa-li fa fa-link" aria-hidden="true"></i><a href="https://nvd.nist.gov/">National Vulnerability Database</a></li>
          <li><i class="fa-li fa fa-link" aria-hidden="true"></i><a href="https://www.npmjs.com/advisories">NPM Public Advisories</a></li>
          <li><i class="fa-li fa fa-link" aria-hidden="true"></i><a href="https://ossindex.sonatype.org/">Sonatype OSS Index</a></li>
          <li><i class="fa-li fa fa-link" aria-hidden="true"></i><a href="https://vulndb.cyberriskanalytics.com">VulnDB</a></li>
        </ul>
      </b-col>
    </b-row>
    <template v-slot:modal-footer="{ cancel }">
      <div class="mx-auto">Copyright &copy; Steve Springett. All Rights Reserved.</div>
      <b-button size="md" variant="outline-primary" @click="cancel()">{{ $t('message.close') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
  import common from "../../shared/common";

  export default {
    name: "AboutModal",
    computed: {
      timestamp: function() {
        return common.formatTimestamp(this.$dtrack.timestamp, true);
      }
    }
  }
</script>
