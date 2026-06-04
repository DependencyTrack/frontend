import xssFilters from 'xss-filters';
import i18n from '@/i18n';
import HashVerificationModal from '@/views/components/HashVerificationModal.vue';
import {
  computeHashVerificationStatus,
  getHashVerificationStatusInfo,
  hashStatusLabel,
} from '@/shared/hashVerificationStatus';
// Styles for `.hash-verification-trigger` must be global (bootstrap-table
// formatters render outside any Vue SFC's scoped style scope).
import './hashVerificationColumn.css';

export function buildHashVerificationColumn({ $t, vueFormatter, visible }) {
  return {
    title: $t('message.integrity'),
    field: 'hash_verification.status',
    sortable: false,
    visible,
    formatter: (_, row, index) => {
      const artifact = row.package_artifact_metadata;
      // When package_artifact_metadata wasn't expanded/returned by the API,
      // render a blank cell. The NO_REPOSITORY_HASH icon is only shown when
      // the artifact was returned but had no hashes (i.e., we know there
      // is nothing to verify against).
      if (artifact == null) {
        return '';
      }

      const repoHashes = artifact.hashes;
      const repoIdentifier = artifact.resolved_from || null;
      const status = computeHashVerificationStatus(row.hashes, repoHashes);
      const info = getHashVerificationStatusInfo(status);
      const tooltipTitle = hashStatusLabel($t, status);
      const isClickable = status === 'PASSED' || status === 'FAILED';

      if (!isClickable) {
        const titleAttr = xssFilters.inDoubleQuotedAttr(tooltipTitle);
        return (
          `<span data-toggle="tooltip" data-placement="bottom" role="img" ` +
          `aria-label="${titleAttr}" title="${titleAttr}">` +
          `<i class="fa ${info.icon} ${info.color}" aria-hidden="true"></i>` +
          `</span>`
        );
      }

      return vueFormatter({
        i18n, // Required so $t works inside the dynamically-mounted Vue component.
        components: { HashVerificationModal },
        template: `
          <div>
            <b-link
              v-b-modal="\`hashVerificationModal-${index}\`"
              class="hash-verification-trigger"
              data-toggle="tooltip"
              data-placement="bottom"
              :title="tooltipTitle"
              :aria-label="tooltipTitle"
            >
              <i :class="['fa', iconClass, colorClass]" aria-hidden="true"></i>
            </b-link>
            <hash-verification-modal
              :modal-id="\`hashVerificationModal-${index}\`"
              :status="status"
              :component-hashes="componentHashes"
              :repository-hashes="repositoryHashes"
              :repository-identifier="repositoryIdentifier"
            />
          </div>`,
        data() {
          return {
            status,
            tooltipTitle,
            iconClass: info.icon,
            colorClass: info.color,
            componentHashes: row.hashes || {},
            repositoryHashes: repoHashes || {},
            repositoryIdentifier: repoIdentifier,
          };
        },
      });
    },
  };
}
