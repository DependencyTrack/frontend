/**
 * This file is part of Dependency-Track.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 * Copyright (c) OWASP Foundation. All Rights Reserved.
 */

import axios from 'axios';

/**
 * Plugin for the Customization API endpoints.
 * Provides methods for interacting with customization settings (vulnerability IDs)
 * with in-memory caching so settings are fetched once and shared across components.
 */
export default {
  install(vueApp) {
    // Cache for vulnerability ID settings - loaded once, used everywhere
    let cachedVulnIdSettings = null;
    let settingsLoaded = false;
    let loadingPromise = null;

    const defaultVulnIdSettings = () => ({
      useCustomId: false,
      orgCode: 'DT',
      projectCode: 'project',
      template: '{ORG_CODE}-{YYYY}-{SEQUENCE}',
      resetPolicy: 'YEARLY',
      sequencePadding: 5,
    });

    const customizationService = {
      /**
       * Get cached vulnerability ID settings (instant access).
       * Returns cached settings or defaults if not yet loaded.
       * @returns {Object} Cached settings object
       */
      getCachedVulnIdSettings() {
        if (cachedVulnIdSettings) {
          return cachedVulnIdSettings;
        }
        return defaultVulnIdSettings();
      },

      /**
       * Check if settings have been loaded.
       * @returns {boolean} True if settings are loaded
       */
      isSettingsLoaded() {
        return settingsLoaded;
      },

      /**
       * Preload vulnerability ID settings (call after authentication).
       * Fetches settings from the API and caches them for instant access.
       * @returns {Promise} Resolves when settings are loaded
       */
      async preloadVulnIdSettings() {
        if (settingsLoaded) {
          return cachedVulnIdSettings;
        }
        if (loadingPromise) {
          return loadingPromise;
        }
        loadingPromise = this.getVulnerabilityIdSettings()
          .then((response) => {
            if (response && response.data) {
              cachedVulnIdSettings = response.data;
              settingsLoaded = true;
            }
            return cachedVulnIdSettings;
          })
          .catch((error) => {
            console.warn(
              'Failed to preload vulnerability ID settings, using defaults:',
              error,
            );
            cachedVulnIdSettings = defaultVulnIdSettings();
            settingsLoaded = true;
            return cachedVulnIdSettings;
          })
          .finally(() => {
            loadingPromise = null;
          });
        return loadingPromise;
      },

      /**
       * Preload all customization settings after authentication succeeds.
       * Uses allSettled so one failing endpoint does not block the rest.
       * @returns {Promise<void>}
       */
      async preloadAll() {
        await Promise.allSettled([this.preloadVulnIdSettings()]);
      },

      /**
       * Invalidate cache (call when admin updates settings).
       */
      invalidateCache() {
        cachedVulnIdSettings = null;
        settingsLoaded = false;
      },

      /**
       * Get vulnerability ID configuration settings.
       * @returns {Promise} Response containing orgCode, template, resetPolicy, sequencePadding
       */
      getVulnerabilityIdSettings() {
        return axios.get(
          vueApp.prototype.$api.BASE_URL +
            '/' +
            vueApp.prototype.$api.URL_CUSTOMIZATION +
            '/vulnerability-id',
          {
            withCredentials: vueApp.prototype.$api.WITH_CREDENTIALS,
            headers: {
              'Content-Type': vueApp.prototype.$api.CONTENT_TYPE_JSON,
            },
          },
        );
      },

      /**
       * Update vulnerability ID configuration settings.
       * @param {Object} settings - Configuration object with orgCode, template, resetPolicy, sequencePadding
       * @returns {Promise} Response from update operation
       */
      updateVulnerabilityIdSettings(settings) {
        // Invalidate cache when settings are updated
        this.invalidateCache();
        return axios
          .put(
            vueApp.prototype.$api.BASE_URL +
              '/' +
              vueApp.prototype.$api.URL_CUSTOMIZATION +
              '/vulnerability-id',
            settings,
            {
              withCredentials: vueApp.prototype.$api.WITH_CREDENTIALS,
              headers: {
                'Content-Type': vueApp.prototype.$api.CONTENT_TYPE_JSON,
              },
            },
          )
          .then((response) => {
            // Update cache with new settings
            cachedVulnIdSettings = settings;
            settingsLoaded = true;
            return response;
          });
      },
    };

    // Register customization service as Vue plugin property
    vueApp.prototype.$customization = customizationService;
  },
};
