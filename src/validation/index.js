import { configure } from 'vee-validate';
import {
} from 'vee-validate';

import i18n from '../i18n';


const { t } = i18n.global;

// Get rule localization based on the rule name
configure({
  defaultMessage: (_, values) => t(`validation.${values._rule_}`, values),
});
