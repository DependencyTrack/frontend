import { extend, configure } from 'vee-validate'
import { required, confirmed } from 'vee-validate/dist/rules'

import i18n from '../i18n'

// Get rule localization based on the rule name
configure({
  defaultMessage: (_, values) => i18n.t(`validation.${values._rule_}`, values)
});

extend('required', required);
extend('confirmed', confirmed);
