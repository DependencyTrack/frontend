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
    // Cache for text placeholder settings
    let cachedTextPlaceholders = null;
    let textPlaceholdersLoaded = false;
    let textPlaceholdersLoadingPromise = null;

    const defaultTextPlaceholders = () => ({
      enabled: false,
      descriptionPlaceholder: '',
      detailPlaceholder: '',
      recommendationPlaceholder: '',
      referencesPlaceholder: '',
      commentPlaceholder: '',
      analysisDetailsInstruction: '',
    });

    const customizationService = {
      /**
       * Get cached text placeholder settings (instant access).
       * Returns cached settings or defaults if not yet loaded.
       * @returns {Object} Cached settings object
       */
      getCachedTextPlaceholderSettings() {
        if (cachedTextPlaceholders) {
          return cachedTextPlaceholders;
        }
        return defaultTextPlaceholders();
      },

      /**
       * Preload text placeholder settings (call after authentication).
       * @returns {Promise} Resolves when settings are loaded
       */
      async preloadTextPlaceholderSettings() {
        if (textPlaceholdersLoaded) {
          return cachedTextPlaceholders;
        }
        if (textPlaceholdersLoadingPromise) {
          return textPlaceholdersLoadingPromise;
        }
        textPlaceholdersLoadingPromise = this.getTextPlaceholderSettings()
          .then((response) => {
            if (response && response.data) {
              cachedTextPlaceholders = response.data;
              textPlaceholdersLoaded = true;
            }
            return cachedTextPlaceholders;
          })
          .catch((error) => {
            console.warn(
              'Failed to preload text placeholder settings, using defaults:',
              error,
            );
            cachedTextPlaceholders = defaultTextPlaceholders();
            textPlaceholdersLoaded = true;
            return cachedTextPlaceholders;
          })
          .finally(() => {
            textPlaceholdersLoadingPromise = null;
          });
        return textPlaceholdersLoadingPromise;
      },

      /**
       * Preload all customization settings after authentication succeeds.
       * Uses allSettled so one failing endpoint does not block the rest.
       * @returns {Promise<void>}
       */
      async preloadAll() {
        await Promise.allSettled([this.preloadTextPlaceholderSettings()]);
      },

      /**
       * Invalidate the text placeholder settings cache.
       */
      invalidateTextPlaceholderCache() {
        cachedTextPlaceholders = null;
        textPlaceholdersLoaded = false;
      },

      /**
       * Get the text placeholder settings.
       * @returns {Promise} Response containing the placeholder texts
       */
      getTextPlaceholderSettings() {
        return axios.get(
          vueApp.prototype.$api.BASE_URL +
            '/' +
            vueApp.prototype.$api.URL_CUSTOMIZATION +
            '/text-placeholders',
          {
            withCredentials: vueApp.prototype.$api.WITH_CREDENTIALS,
            headers: {
              'Content-Type': vueApp.prototype.$api.CONTENT_TYPE_JSON,
            },
          },
        );
      },

      /**
       * Update the text placeholder settings.
       * @param {Object} settings - Object with the placeholder texts to update
       * @returns {Promise} Response from update operation
       */
      updateTextPlaceholderSettings(settings) {
        this.invalidateTextPlaceholderCache();
        return axios
          .put(
            vueApp.prototype.$api.BASE_URL +
              '/' +
              vueApp.prototype.$api.URL_CUSTOMIZATION +
              '/text-placeholders',
            settings,
            {
              withCredentials: vueApp.prototype.$api.WITH_CREDENTIALS,
              headers: {
                'Content-Type': vueApp.prototype.$api.CONTENT_TYPE_JSON,
              },
            },
          )
          .then((response) => {
            cachedTextPlaceholders = settings;
            textPlaceholdersLoaded = true;
            return response;
          });
      },
    };

    // Register customization service as Vue plugin property
    vueApp.prototype.$customization = customizationService;
  },
};
