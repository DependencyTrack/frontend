import { configure, defineRule } from 'vee-validate';
import {
  required,
  confirmed,
  min_value,
  max_value,
} from '@vee-validate/rules';

import i18n from '../i18n';

const { t } = i18n.global;

// Get rule localization based on the rule name
configure({
  defaultMessage: (_, values) => t(`validation.${values._rule_}`, values),
});

defineRule('required', required);
defineRule('confirmed', confirmed);
defineRule('min_value', min_value);
defineRule('max_value', max_value);
