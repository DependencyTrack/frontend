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
 * Provides methods for interacting with customization settings with in-memory
 * caching so settings are fetched once and shared across components.
 */
export default {
  install(vueApp) {
    // Cache for vulnerability source of discovery options
    let cachedVulnSourceConfig = null;
    let vulnSourceLoaded = false;
    let vulnSourceLoadingPromise = null;

    const defaultVulnSourceConfig = () => ({
      enabled: false,
      values: [],
    });

    const customizationService = {
      /**
       * Get cached vulnerability source of discovery options (instant access).
       * Returns cached config or defaults if not yet loaded.
       * @returns {Object} Cached config object with enabled flag and values
       */
      getCachedVulnSourceConfig() {
        if (cachedVulnSourceConfig) {
          return cachedVulnSourceConfig;
        }
        return defaultVulnSourceConfig();
      },

      /**
       * Preload vulnerability source options (call after authentication).
       * @returns {Promise} Resolves when the config is loaded
       */
      async preloadVulnSourceConfig() {
        if (vulnSourceLoaded) {
          return cachedVulnSourceConfig;
        }
        if (vulnSourceLoadingPromise) {
          return vulnSourceLoadingPromise;
        }
        vulnSourceLoadingPromise = this.getVulnerabilitySourceOptions()
          .then((response) => {
            if (response && response.data) {
              cachedVulnSourceConfig = response.data;
              vulnSourceLoaded = true;
            }
            return cachedVulnSourceConfig;
          })
          .catch((error) => {
            console.warn(
              'Failed to preload vulnerability source options, using defaults:',
              error,
            );
            cachedVulnSourceConfig = defaultVulnSourceConfig();
            vulnSourceLoaded = true;
            return cachedVulnSourceConfig;
          })
          .finally(() => {
            vulnSourceLoadingPromise = null;
          });
        return vulnSourceLoadingPromise;
      },

      /**
       * Preload all customization settings after authentication succeeds.
       * Uses allSettled so one failing endpoint does not block the rest.
       * @returns {Promise<void>}
       */
      async preloadAll() {
        await Promise.allSettled([this.preloadVulnSourceConfig()]);
      },

      /**
       * Invalidate the vulnerability source options cache.
       */
      invalidateVulnSourceCache() {
        cachedVulnSourceConfig = null;
        vulnSourceLoaded = false;
      },

      /**
       * Get the vulnerability source of discovery options.
       * @returns {Promise} Response containing the enabled flag and source values
       */
      getVulnerabilitySourceOptions() {
        return axios.get(
          vueApp.prototype.$api.BASE_URL +
            '/' +
            vueApp.prototype.$api.URL_CUSTOMIZATION +
            '/vulnerability-source',
          {
            withCredentials: vueApp.prototype.$api.WITH_CREDENTIALS,
            headers: {
              'Content-Type': vueApp.prototype.$api.CONTENT_TYPE_JSON,
            },
          },
        );
      },

      /**
       * Update the vulnerability source of discovery options.
       * @param {Object} config - Object with enabled flag and values array
       * @returns {Promise} Response from update operation
       */
      updateVulnerabilitySourceOptions(config) {
        this.invalidateVulnSourceCache();
        return axios
          .put(
            vueApp.prototype.$api.BASE_URL +
              '/' +
              vueApp.prototype.$api.URL_CUSTOMIZATION +
              '/vulnerability-source',
            config,
            {
              withCredentials: vueApp.prototype.$api.WITH_CREDENTIALS,
              headers: {
                'Content-Type': vueApp.prototype.$api.CONTENT_TYPE_JSON,
              },
            },
          )
          .then((response) => {
            cachedVulnSourceConfig = config;
            vulnSourceLoaded = true;
            return response;
          });
      },
    };

    // Register customization service as Vue plugin property
    vueApp.prototype.$customization = customizationService;
  },
};
