<template>
  <actionable-list-group-item delete-icon="true" v-on:actionClicked="removeCondition()">
    <b-row>
      <b-col md="4" lg="3">
        <b-input-group-form-select id="input-subject" required="true"
                                   v-on:change="subjectChanged" v-model="subject" :options="subjects" />
      </b-col>
      <b-col md="3" lg="2">
        <b-input-group-form-select id="input-operator" required="true"
                                   v-model="operator" :options="operators" />
      </b-col>
      <b-col md="4" lg="3">
        <b-input-group-form-select v-if="isSubjectSelectable" id="input-value" required="true"
                                   v-on:change="saveCondition" v-model="value" :options="possibleValues" />

        <b-input-group-form-input v-else id="input-value" required="true" type="text" v-model="value" lazy="true"
                                  v-debounce:750ms="saveCondition" :debounce-events="'keyup'" />
      </b-col>
      <b-col md="1" lg="4">
      </b-col>
    </b-row>
  </actionable-list-group-item>
</template>

<script>
  import ActionableListGroupItem from "../components/ActionableListGroupItem";
  import BInputGroupFormSelect from "../../forms/BInputGroupFormSelect";
  import BInputGroupFormInput from "../../forms/BInputGroupFormInput";

  export default {
    props: {
      policy: Object,
      condition: Object
    },
    components: {
      ActionableListGroupItem,
      BInputGroupFormSelect,
      BInputGroupFormInput
    },
    created() {
      if (this.condition) {
        console.log(this.condition);
        this.subject = this.condition.subject;
        this.subjectChanged();
        this.operator = this.condition.operator;
        this.value = this.condition.value;
      }
    },
    data() {
      return {
        subject: null,
        operator: null,
        value: null,
        subjects: [
          {value: 'AGE', text: this.$t('message.age')},
          {value: 'ANALYZER', text: this.$t('message.analyzer')},
          {value: 'BOM', text: this.$t('message.bom')},
          {value: 'COMPONENT_GROUP', text: this.$t('message.component_group')},
          {value: 'COMPONENT_NAME', text: this.$t('message.component_name')},
          {value: 'COMPONENT_VERSION', text: this.$t('message.component_version')},
          {value: 'LICENSE', text: this.$t('message.license')},
          {value: 'LICENSE_GROUP', text: this.$t('message.license_group')},
          {value: 'PACKAGE_URL', text: this.$t('message.package_url')}
        ],
        objectOperators: [
          {value: 'IS', text: this.$t('operator.is')},
          {value: 'IS_NOT', text: this.$t('operator.is_not')}
        ],
        regexOperators: [
          {value: 'MATCHES', text: this.$t('operator.matches')},
          {value: 'NO_MATCH', text: this.$t('operator.no_match')}
        ],
        numericOperators: [
          {value: 'NUMERIC_GREATER_THAN', text: '>'},
          {value: 'NUMERIC_LESS_THAN', text: '<'},
          {value: 'NUMERIC_EQUAL', text: '='},
          {value: 'NUMERIC_NOT_EQUAL', text: '≠'},
          {value: 'NUMERIC_GREATER_THAN_OR_EQUAL', text: '≥'},
          {value: 'NUMERIC_LESSER_THAN_OR_EQUAL', text: '≤'}
        ],
        operators: [],
        possibleValues: []
      }
    },
    computed: {
      isSubjectSelectable: function() {
        switch(this.subject) {
          case 'AGE':
            return false;
          case 'ANALYZER':
            return true;
          case 'BOM':
            return true;
          case 'COMPONENT_GROUP':
            return false;
          case 'COMPONENT_NAME':
            return false;
          case 'COMPONENT_VERSION':
            return false;
          case 'LICENSE':
            return true;
          case 'LICENSE_GROUP':
            return true;
          case 'PACKAGE_URL':
            return false;
          default:
            return false;
        }
      }
    },
    methods: {
      subjectChanged: function() {
        switch(this.subject) {
          case 'AGE':
            this.operators = this.numericOperators;
            break;
          case 'ANALYZER':
            this.operators = this.objectOperators;
            break;
          case 'BOM':
            this.operators = this.objectOperators;
            break;
          case 'COMPONENT_GROUP':
            this.operators = this.regexOperators;
            break;
          case 'COMPONENT_NAME':
            this.operators = this.regexOperators;
            break;
          case 'COMPONENT_VERSION':
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
          default:
            this.operators = [];
        }
        this.saveCondition();
      },
      saveCondition: function() {
        if (!this.subject || !this.operator || !this.value) {
          return;
        }
        if (this.condition.uuid) {
          let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}/condition`;
          this.axios.post(url, {
            uuid: this.condition.uuid,
            subject: this.subject,
            operator: this.operator,
            value: this.value
          }).then((response) => {
            this.condition = response.data;
            this.$toastr.s(this.$t('message.updated'));
          }).catch((error) => {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          });
        } else {
          let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}/${this.policy.uuid}/condition`;
          this.axios.put(url, {
            subject: this.subject,
            operator: this.operator,
            value: this.value
          }).then((response) => {
            this.condition = response.data;
            this.$toastr.s(this.$t('message.updated'));
          }).catch((error) => {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          });
        }
      },
      removeCondition: function() {
        if (this.condition && this.condition.uuid) {
          let url = `${this.$api.BASE_URL}/${this.$api.URL_POLICY}/condition/${this.condition.uuid}`;
          this.axios.delete(url).then((response) => {
            this.condition = response.data;
            this.$toastr.s(this.$t('message.condition_deleted'));
            this.$emit('conditionRemoved');
          }).catch((error) => {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          });
        } else {
          this.$emit('conditionRemoved');
        }
      },
      retrieveLicenseGroups: function() {
        this.axios.get(`${this.$api.BASE_URL}/${this.$api.URL_LICENSE_GROUP}?limit=9999`
        ).then((response) => {
          let vals = [];
          for (let i=0; i<response.data.length; i++) {
            let object = response.data[i];
            vals.push( {value: object.uuid, text: object.name} )
          }
          this.possibleValues = vals;
        }).catch((error) => {
          if (error.response.status === 304) {
            //this.$toastr.w(this.$t('condition.unsuccessful_action'));
          } else {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          }
        });
      },
      retrieveLicenses: function() {
        this.axios.get(`${this.$api.BASE_URL}/${this.$api.URL_LICENSE_CONCISE}?limit=9999`
        ).then((response) => {
          let vals = [];
          for (let i=0; i<response.data.length; i++) {
            let object = response.data[i];
            vals.push( {value: object.uuid, text: object.name} )
          }
          this.possibleValues = vals;
        }).catch((error) => {
          if (error.response.status === 304) {
            //this.$toastr.w(this.$t('condition.unsuccessful_action'));
          } else {
            this.$toastr.w(this.$t('condition.unsuccessful_action'));
          }
        });
      }
    }
  }
</script>
