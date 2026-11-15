import axios from 'axios';
import { reactive } from 'vue';
import globals from './globals';
import { createStatusPoller } from './bomStatusPoller';
import {
  listTrackedUploads,
  trackUpload,
  untrackUpload,
} from './bomUploadTracker';

// Reactive view of the uploads this browser session is following,
// by project uuid. Each entry is a tracked upload plus its latest `status`,
// which stays at a terminal value until somebody acknowledges it.
export const bomUploads = reactive({});

const unsubscribers = new Map();

const poller = createStatusPoller(async (token) => {
  const url = `${globals.$api.BASE_URL}/${globals.$api.URL_BOM_TOKEN}/${token}`;
  return (await axios.get(url)).data;
});

function follow(upload) {
  unsubscribers.get(upload.projectUuid)?.();
  bomUploads[upload.projectUuid] = { ...upload, status: 'PENDING' };
  const unsubscribe = poller.subscribe(upload.token, (result) => {
    const current = bomUploads[upload.projectUuid];
    // A newer upload for the project took over.
    if (current?.token !== upload.token) return;
    if (result.error) {
      // Keep the upload stored, a later page load tries again.
      unsubscribers.delete(upload.projectUuid);
      delete bomUploads[upload.projectUuid];
    } else if (result.status === undefined) {
      // The server no longer knows the token, so there is nothing to report.
      acknowledgeBomUpload(upload.projectUuid);
    } else {
      current.status = result.status;
    }
  });
  unsubscribers.set(upload.projectUuid, unsubscribe);
}

/**
 * Starts following the processing of an upload. It replaces the one
 * the project had before.
 */
export function startFollowingBomUpload(upload) {
  trackUpload(upload);
  follow(upload);
}

/**
 * Follows the uploads remembered for this session, e.g. after a page load.
 * Uploads that are already followed are left alone.
 */
export function resumeFollowingBomUploads() {
  for (const upload of listTrackedUploads()) {
    if (bomUploads[upload.projectUuid]?.token !== upload.token) follow(upload);
  }
}

/**
 * Stops following the upload and forgets it, once the user has seen its outcome.
 */
export function acknowledgeBomUpload(projectUuid) {
  unsubscribers.get(projectUuid)?.();
  unsubscribers.delete(projectUuid);
  delete bomUploads[projectUuid];
  untrackUpload(projectUuid);
}
