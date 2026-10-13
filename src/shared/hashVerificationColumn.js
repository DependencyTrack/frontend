import xssFilters from 'xss-filters';
import HashVerificationCell from '@/views/components/HashVerificationCell.vue';
import {
  computeHashVerificationStatus,
  getHashVerificationStatusInfo,
  hashStatusLabel,
} from '@/shared/hashVerificationStatus';

export function buildHashVerificationColumn({ $t, cell, visible }) {
  return {
    title: $t('message.integrity'),
    field: 'hash_verification.status',
    sortable: false,
    visible,
    formatter: (_, row) => {
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

      return cell(HashVerificationCell, {
        status,
        tooltipTitle,
        iconClass: info.icon,
        colorClass: info.color,
        componentHashes: row.hashes || {},
        repositoryHashes: repoHashes || {},
        repositoryIdentifier: repoIdentifier,
      });
    },
  };
}
