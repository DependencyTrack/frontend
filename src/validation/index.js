import { configure, extend } from 'vee-validate';
import {
  confirmed,
  max_value,
  min_value,
  required,
} from 'vee-validate/dist/rules';

import i18n from '@/i18n';

// Get rule localization based on the rule name
configure({
  defaultMessage: (_, values) => i18n.t(`validation.${values._rule_}`, values),
});

extend('required', required);
extend('confirmed', confirmed);
extend('min_value', min_value);
extend('max_value', max_value);
