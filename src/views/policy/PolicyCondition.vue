<template>
  <actionable-list-group-item
    v-permission:or="['POLICY_MANAGEMENT', 'POLICY_MANAGEMENT_UPDATE']"
    :delete-icon="true"
    v-on:actionClicked="removeCondition()"
  >
    <b-row v-if="subject !== 'EXPRESSION' && subject !== 'IS_INTERNAL'">
      <b-col md="4" lg="3">
        <b-input-group-form-select
          id="input-subject"
          required="true"
          :label="$t('message.condition_subject')"
          v-on:change="subjectChanged"
          v-model="subject"
          :options="subjects"
        />
      </b-col>
      <b-col md="3" lg="2">
        <b-input-group-form-select
          id="input-operator"
          required="true"
          :label="$t('message.operator')"
          v-model="operator"
          :options="operators"
        />
      </b-col>
      <b-col md="4" lg="5">
        <b-input-group-form-select
          v-if="
            subject !== 'COORDINATES' &&
            subject !== 'VERSION_DISTANCE' &&
            isSubjectSelectable
          "
          id="input-value"
          required="true"
          :label="$t('message.value')"
          v-model="value"
          :options="possibleValues"
        />

        <b-input-group-form-input
          v-else-if="
            subject !== 'COORDINATES' &&
            subject !== 'VERSION_DISTANCE' &&
            !isSubjectSelectable
          "
          id="input-value"
          required="true"
          :label="$t('message.value')"
          type="text"
          v-model="value"
          lazy="true"
          :tooltip="valueInputTooltip()"
        />

        <b-form-group
          v-else-if="subject === 'COORDINATES'"
          :label="$t('message.value')"
          label-for="input-value-coordinates-group"
        >
          <b-input-group>
            <b-form-input
              id="input-value-coordinates-group"
              :placeholder="$t('message.group')"
              type="text"
              v-model="coordinatesGroup"
            ></b-form-input>
            <b-form-input
              id="input-value-coordinates-name"
              :placeholder="$t('message.name')"
              type="text"
              v-model="coordinatesName"
            ></b-form-input>
            <b-form-input
              id="input-value-coordinates-version"
              :placeholder="$t('message.version')"
              type="text"
              v-model="coordinatesVersion"
            ></b-form-input>
            <b-tooltip
              target="input-value-coordinates-version"
              triggers="hover focus"
              >{{ $t('message.coordinates_version_tooltip') }}
            </b-tooltip>
          </b-input-group>
        </b-form-group>

        <b-form-group
          v-else-if="subject === 'VERSION_DISTANCE'"
          :label="$t('message.value')"
          label-for="input-value-distance-epoch"
        >
          <b-input-group>
            <b-form-input
              id="input-value-distance-epoch"
              :placeholder="$t('message.version_distance_epoch')"
              type="number"
              min="0"
              oninput="validity.valid||(value='');"
              v-model="versionDistance.epoch"
            ></b-form-input>
            <b-form-input
              id="input-value-distance-major"
              :placeholder="$t('message.version_distance_major')"
              type="number"
              min="0"
              oninput="validity.valid||(value='');"
              v-model="versionDistance.major"
            ></b-form-input>
            <b-form-input
              id="input-value-distance-minor"
              :placeholder="$t('message.version_distance_minor')"
              type="number"
              min="0"
              oninput="validity.valid||(value='');"
              v-model="versionDistance.minor"
            ></b-form-input>
            <b-form-input
              id="input-value-distance-patch"
              :placeholder="$t('message.version_distance_patch')"
              type="number"
              min="0"
              oninput="validity.valid||(value='');"
              v-model="versionDistance.patch"
            ></b-form-input>
            <b-tooltip
              target="input-value-distance-epoch"
              triggers="hover focus"
              >{{ $t('message.version_distance_tooltip') }}
            </b-tooltip>
            <b-tooltip
              target="input-value-distance-major"
              triggers="hover focus"
              >{{ $t('message.version_distance_tooltip') }}
            </b-tooltip>
            <b-tooltip
              target="input-value-distance-minor"
              triggers="hover focus"
              >{{ $t('message.version_distance_tooltip') }}
            </b-tooltip>
            <b-tooltip
              target="input-value-distance-patch"
              triggers="hover focus"
              >{{ $t('message.version_distance_tooltip') }}
            </b-tooltip>
          </b-input-group>
        </b-form-group>
      </b-col>
      <b-col cols="auto" class="d-flex align-items-end">
        <b-button
          variant="outline-primary"
          :disabled="!isDirty"
          @click="saveCondition"
        >
          <i class="fa fa-floppy-o"></i> {{ $t('message.update') }}
        </b-button>
      </b-col>
    </b-row>

    <template v-else-if="subject === 'EXPRESSION'">
      <b-row>
        <b-col md="4" lg="3">
          <b-input-group-form-select
            id="input-subject"
            required="true"
            :label="$t('message.condition_subject')"
            v-on:change="subjectChanged"
            v-model="subject"
            :options="subjects"
          />
        </b-col>
        <b-col md="3" lg="2">
          <b-input-group-form-select
            id="input-value-violationtype"
            required="true"
            :label="$t('message.violation_type')"
            v-model="violationType"
            :options="violationTypes"
          />
        </b-col>
        <b-col cols="auto" class="d-flex align-items-end">
          <b-button
            variant="outline-primary"
            :disabled="!isDirty"
            @click="saveCondition"
          >
            <i class="fa fa-floppy-o"></i> {{ $t('message.update') }}
          </b-button>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col lg="8" class="ml-3">
          <CodeMirrorEditor
            id="input-value"
            v-model="value"
            :markers="this.editorMarkers"
            :completionSource="celCompletionSource"
            @save="saveCondition"
          ></CodeMirrorEditor>
        </b-col>
      </b-row>
    </template>

    <b-row v-else-if="subject === 'IS_INTERNAL'">
      <b-col md="4" lg="3">
        <b-input-group-form-select
          id="input-subject"
          required="true"
          :label="$t('message.condition_subject')"
          v-on:change="subjectChanged"
          v-model="subject"
          :options="subjects"
        />
      </b-col>

      <b-col md="6" lg="7" class="d-flex align-items-center">
        <c-switch
          v-model="value"
          color="primary"
          class="m-0"
          label
          v-bind="labelIcon"
        />
      </b-col>
      <b-col cols="auto" class="d-flex align-items-end">
        <b-button
          variant="outline-primary"
          :disabled="!isDirty"
          @click="saveCondition"
        >
          <i class="fa fa-floppy-o"></i> {{ $t('message.update') }}
        </b-button>
      </b-col>
    </b-row>
  </actionable-list-group-item>
</template>

<script>
import { Switch as cSwitch } from '@coreui/vue';
import BInputGroupFormInput from '../../forms/BInputGroupFormInput';
import BInputGroupFormSelect from '../../forms/BInputGroupFormSelect';
import common from '../../shared/common';
import ActionableListGroupItem from '../components/ActionableListGroupItem';
import CodeMirrorEditor from '@/views/components/CodeMirrorEditor.vue';
import { celCompletionSource } from './celCompletions';

export default {
  props: {
    policy: Object,
    condition: Object,
  },
  components: {
    ActionableListGroupItem,
    BInputGroupFormSelect,
    BInputGroupFormInput,
    CodeMirrorEditor,
    cSwitch,
  },
  created() {
    if (this.condition) {
      this.uuid = this.condition.uuid;
      this.subject = this.condition.subject;
      this.subjectChanged();
      this.operator = this.condition.operator;
      this.violationType = this.condition.violationType;

      if (this.subject === 'IS_INTERNAL') {
        this.value = this.condition.value === 'true';
      } else {
        this.value = this.condition.value;
      }
    }
    this.resetSavedState();
  },
  data() {
    return {
      celCompletionSource,
      uuid: null,
      subject: null,
      operator: null,
      value: null,
      violationType: null,
      coordinatesGroup: null,
      coordinatesName: null,
      coordinatesVersion: null,
      versionDistance: {
        epoch: null,
        major: null,
        minor: null,
        patch: null,
      },
      labelIcon: {
        dataOn: '\u2713',
        dataOff: '\u2715',
      },
      savedState: null,
      subjects: [
        { value: 'AGE', text: this.$t('message.age') },
        //{value: 'ANALYZER', text: this.$t('message.analyzer')},
        //{value: 'BOM', text: this.$t('message.bom')},
        { value: 'SEVERITY', text: this.$t('message.severity') },
        { value: 'COORDINATES', text: this.$t('message.coordinates') },
        { value: 'LICENSE', text: this.$t('message.license') },
        { value: 'LICENSE_GROUP', text: this.$t('message.license_group') },
        { value: 'PACKAGE_URL', text: this.$t('message.package_url') },
        { value: 'CPE', text: this.$t('message.cpe_full') },
        { value: 'SWID_TAGID', text: this.$t('message.swid_tagid') },
        { value: 'VERSION', text: this.$t('message.version') },
        { value: 'IS_INTERNAL', text: this.$t('message.internal_status') },
        { value: 'COMPONENT_HASH', text: this.$t('message.component_hash') },
        { value: 'CWE', text: this.$t('message.cwe_full') },
        { value: 'EPSS', text: this.$t('message.epss_score') },
        {
          value: 'VULNERABILITY_ID',
          text: this.$t('message.vulnerability_vuln_id'),
        },
        {
          value: 'VERSION_DISTANCE',
          text: this.$t('message.version_distance'),
        },
        { value: 'EXPRESSION', text: 'Expression' },
      ],
      objectOperators: [
        { value: 'IS', text: this.$t('operator.is') },
        { value: 'IS_NOT', text: this.$t('operator.is_not') },
      ],
      regexOperators: [
        { value: 'MATCHES', text: this.$t('operator.matches') },
        { value: 'NO_MATCH', text: this.$t('operator.no_match') },
      ],
      numericOperators: [
        { value: 'NUMERIC_GREATER_THAN', text: '>' },
        { value: 'NUMERIC_LESS_THAN', text: '<' },
        { value: 'NUMERIC_EQUAL', text: '=' },
        { value: 'NUMERIC_NOT_EQUAL', text: '≠' },
        { value: 'NUMERIC_GREATER_THAN_OR_EQUAL', text: '≥' },
        { value: 'NUMERIC_LESSER_THAN_OR_EQUAL', text: '≤' },
      ],
      hashAlgorithms: [
        { value: 'MD5', text: this.$t('hashes.md5') },
        { value: 'SHA-1', text: this.$t('hashes.sha_1') },
        { value: 'SHA-256', text: this.$t('hashes.sha_256') },
        { value: 'SHA-384', text: this.$t('hashes.sha_384') },
        { value: 'SHA-512', text: this.$t('hashes.sha_512') },
        { value: 'SHA3-256', text: this.$t('hashes.sha3_256') },
        { value: 'SHA3-384', text: this.$t('hashes.sha3_384') },
        { value: 'SHA3-512', text: this.$t('hashes.sha3_512') },
        { value: 'BLAKE2b-256', text: this.$t('hashes.blake_256') },
        { value: 'BLAKE2b-384', text: this.$t('hashes.blake_384') },
        { value: 'BLAKE2b-512', text: this.$t('hashes.blake_512') },
        { value: 'BLAKE3', text: this.$t('hashes.blake3') },
      ],
      listOperators: [
        { value: 'CONTAINS_ANY', text: this.$t('operator.contains_any') },
        { value: 'CONTAINS_ALL', text: this.$t('operator.contains_all') },
      ],
      violationTypes: [
        { value: 'LICENSE', text: 'License' },
        { value: 'OPERATIONAL', text: 'Operational' },
        { value: 'SECURITY', text: 'Security' },
      ],
      operators: [],
      possibleValues: [],
      editorMarkers: [],
    };
  },
  computed: {
    isSubjectSelectable: function () {
      switch (this.subject) {
        case 'AGE':
          return false;
        case 'ANALYZER':
          return true;
        case 'BOM':
          return true;
        case 'SEVERITY':
          return true;
        case 'COORDINATES':
          return false;
        case 'LICENSE':
          return true;
        case 'LICENSE_GROUP':
          return true;
        case 'PACKAGE_URL':
          return false;
        case 'CPE':
          return false;
        case 'SWID_TAGID':
          return false;
        case 'VERSION':
          return false;
        case 'IS_INTERNAL':
          return false;
        case 'COMPONENT_HASH':
          return false;
        case 'CWE':
          return false;
        case 'VULNERABILITY_ID':
          return false;
        case 'VERSION_DISTANCE':
          return false;
        case 'EPSS':
          return false;
        case 'EXPRESSION':
          return false;
        default:
          return false;
      }
    },
    isDirty: function () {
      if (!this.savedState) return true;
      return (
        this.savedState.subject !== this.subject ||
        this.savedState.operator !== this.operator ||
        this.savedState.value !== this.value ||
        this.savedState.violationType !== this.violationType ||
        this.savedState.coordinatesGroup !== this.coordinatesGroup ||
        this.savedState.coordinatesName !== this.coordinatesName ||
        this.savedState.coordinatesVersion !== this.coordinatesVersion ||
        JSON.stringify(this.savedState.versionDistance) !==
          JSON.stringify(this.versionDistance)
      );
    },
  },
  beforeMount() {
    if (this.subject === 'COORDINATES') {
      let v = JSON.parse(this.value);
      if (v) {
        this.coordinatesGroup = v.group;
        this.coordinatesName = v.name;
        this.coordinatesVersion = v.version;
      }
    } else if (this.subject === 'VERSION_DISTANCE') {
      let v = JSON.parse(this.value);
      if (v) {
        this.versionDistance = v;
      }
    }
    this.resetSavedState();
  },
  methods: {
    resetSavedState: function () {
      this.savedState = {
        subject: this.subject,
        operator: this.operator,
        value: this.value,
        violationType: this.violationType,
        coordinatesGroup: this.coordinatesGroup,
        coordinatesName: this.coordinatesName,
        coordinatesVersion: this.coordinatesVersion,
        versionDistance: { ...this.versionDistance },
      };
    },
    subjectChanged: function () {
      switch (this.subject) {
        case 'AGE':
          this.operators = this.numericOperators;
          break;
        case 'ANALYZER':
          this.operators = this.objectOperators;
          break;
        case 'BOM':
          this.operators = this.objectOperators;
          break;
        case 'SEVERITY':
          this.operators = this.objectOperators;
          this.populateSeverity();
          break;
        case 'COORDINATES':
          this.operators = this.regexOperators;
          break;
        case 'LICENSE':
          this.operators = this.objectOperators;
          this.retrieveLicenses();
          break;
        case 'LICENSE_GROUP':
          this.operators = this.objectOperators;
          this.retrieveLicenseGroups();
          break;
        case 'PACKAGE_URL':
          this.operators = this.regexOperators;
          break;
        case 'CPE':
          this.operators = this.regexOperators;
          break;
        case 'SWID_TAGID':
          this.operators = this.regexOperators;
          break;
        case 'VERSION':
          this.operators = this.numericOperators;
          break;
        case 'IS_INTERNAL':
          this.operators = [];
          this.operator = 'IS';
          if (typeof this.value !== 'boolean') {
            this.value = this.value === 'true';
          }
          return;
        case 'COMPONENT_HASH':
          this.operators = this.hashAlgorithms;
          break;
        case 'CWE':
          this.operators = this.listOperators;
          break;
        case 'VULNERABILITY_ID':
          this.operators = this.objectOperators;
          break;
        case 'VERSION_DISTANCE':
          this.operators = this.numericOperators;
          break;
        case 'EPSS':
          this.operators = this.numericOperators;
          break;
        case 'EXPRESSION':
          this.operators = this.regexOperators;
          break;
        default:
          this.operators = [];
      }
    },
    createDynamicValue: function () {
      if (this.subject === 'COORDINATES') {
        return JSON.stringify({
          group: common.trimToNull(this.coordinatesGroup),
          name: common.trimToNull(this.coordinatesName),
          version: common.trimToNull(this.coordinatesVersion),
        });
      } else if (this.subject === 'COMPONENT_HASH') {
        return JSON.stringify({
          algorithm: common.trimToNull(this.operator),
          value: common.trimToNull(this.value),
        });
      } else if (this.subject === 'VERSION_DISTANCE') {
        let result = {
          epoch: this.parseIntNull(
            common.trimToNull(this.versionDistance.epoch),
          ),
          major: this.parseIntNull(
            common.trimToNull(this.versionDistance.major),
          ),
          minor: this.parseIntNull(
            common.trimToNull(this.versionDistance.minor),
          ),
          patch: this.parseIntNull(
            common.trimToNull(this.versionDistance.patch),
          ),
        };

        if (result.epoch < 0) {
          result.epoch = 0; // no smaller values
        }
        if (result.major < 0) {
          result.major = null; // no smaller values
          result.minor = null;
          result.patch = null;
        }
        if (result.minor < 0) {
          result.minor = null; // no smaller values
          result.patch = null;
        }
        if (result.patch < 0) {
          result.patch = null;
        }
        this.versionDistance = result;
        return JSON.stringify(result);
      } else {
        if (this.subject === 'IS_INTERNAL') {
          return this.value ? 'true' : 'false';
        }
        return this.value;
      }
    },
    saveCondition: function () {
      if (!this.isDirty) {
        this.$toastr.i(this.$t('message.no_changes'));
        return;
      }
      let dynamicValue = this.createDynamicValue();
      if (!this.subject) {
        return;
      }
      if (
        this.subject === 'EXPRESSION' &&
        (!this.violationType || !dynamicValue)
      ) {
        return;
      }
      if (this.subject !== 'EXPRESSION' && (!this.operator || !dynamicValue)) {
        return;
      }
      if (this.uuid) {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}/condition`;
        this.axios
          .post(url, {
            uuid: this.uuid,
            subject: this.subject,
            operator: this.subject === 'COMPONENT_HASH' ? 'IS' : this.operator,
            violationType:
              this.subject === 'EXPRESSION' ? this.violationType : null,
            value: dynamicValue,
          })
          .then((response) => {
            this.uuid = response.data.uuid;
            this.subject = response.data.subject;
            this.operator = response.data.operator;
            if (this.subject === 'IS_INTERNAL') {
              this.value = response.data.value === 'true';
            } else {
              this.value = response.data.value;
            }
            this.violationType = response.data.violationType;
            this.editorMarkers = [];
            this.resetSavedState();
            this.$toastr.s(this.$t('message.updated'));
          })
          .catch((error) => {
            if (
              this.subject === 'EXPRESSION' &&
              error.response &&
              error.response.data &&
              error.response.data.celErrors
            ) {
              this.editorMarkers = error.response.data.celErrors.map(
                (celErr) => {
                  return {
                    startLineNumber: celErr.line,
                    startColumn: celErr.column,
                    endLineNumber: celErr.line,
                    endColumn: celErr.column + 3, // Add a few columns to make it more visible
                    message: celErr.message,
                    severity: 8,
                  };
                },
              );
            } else {
              this.$toastr.w(this.$t('condition.unsuccessful_action'));
            }
          });
      } else {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}/${this.policy.uuid}/condition`;
        this.axios
          .put(url, {
            subject: this.subject,
            operator: this.subject === 'COMPONENT_HASH' ? 'IS' : this.operator,
            value: dynamicValue,
            violationType:
              this.subject === 'EXPRESSION' ? this.violationType : null,
          })
          .then((response) => {
            this.uuid = response.data.uuid;
            this.subject = response.data.subject;
            this.operator = response.data.operator;
            if (this.subject === 'IS_INTERNAL') {
              this.value = response.data.value === 'true';
            } else {
              this.value = response.data.value;
            }
            this.violationType = response.data.violationType;
            this.resetSavedState();
            this.$toastr.s(this.$t('message.updated'));
          })
          .catch((error) => {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          });
      }
    },
    removeCondition: function () {
      if (this.uuid) {
        let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}/condition/${this.uuid}`;
        this.axios
          .delete(url)
          .then((response) => {
            this.uuid = response.data.uuid;
            this.subject = response.data.subject;
            this.operator = response.data.operator;
            if (this.subject === 'IS_INTERNAL') {
              this.value = response.data.value === 'true';
            } else {
              this.value = response.data.value;
            }
            this.violationType = response.data.violationType;
            this.$toastr.s(this.$t('message.condition_deleted'));
            this.$emit('conditionRemoved');
          })
          .catch((error) => {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          });
      } else {
        this.$emit('conditionRemoved');
      }
    },
    retrieveLicenseGroups: function () {
      this.axios
        .get(`${this.$api.BASE_URL}/${this.$api.URL_LICENSE_GROUP}?limit=9999`)
        .then((response) => {
          let vals = [];
          for (let i = 0; i < response.data.length; i++) {
            let object = response.data[i];
            vals.push({ value: object.uuid, text: object.name });
          }
          this.possibleValues = vals;
        })
        .catch((error) => {
          if (error.response.status === 304) {
            //this.$toastr.w(this.$t('condition.unsuccessful_action'));
          } else {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          }
        });
    },
    retrieveLicenses: function () {
      this.axios
        .get(
          `${this.$api.BASE_URL}/${this.$api.URL_LICENSE_CONCISE}?limit=9999`,
        )
        .then((response) => {
          let vals = [];
          vals.push({ value: 'unresolved', text: 'unresolved' });
          for (let i = 0; i < response.data.length; i++) {
            let object = response.data[i];
            vals.push({ value: object.uuid, text: object.name });
          }
          this.possibleValues = vals;
        })
        .catch((error) => {
          if (error.response.status === 304) {
            //this.$toastr.w(this.$t('condition.unsuccessful_action'));
          } else {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          }
        });
    },
    populateSeverity: function () {
      this.possibleValues = [
        { value: 'CRITICAL', text: this.$t('severity.critical') },
        { value: 'HIGH', text: this.$t('severity.high') },
        { value: 'MEDIUM', text: this.$t('severity.medium') },
        { value: 'LOW', text: this.$t('severity.low') },
        { value: 'INFO', text: this.$t('severity.info') },
        { value: 'UNASSIGNED', text: this.$t('severity.unassigned') },
      ];
    },
    valueInputTooltip: function () {
      switch (this.subject) {
        case 'AGE':
          return this.$t('message.age_tooltip');
        default:
          return '';
      }
    },
    parseIntNull: function (value) {
      return value == null ? null : parseInt(value);
    },
  },
};
</script>
