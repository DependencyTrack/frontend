/**
 * This module contains reusable code fragments that are utilitarian or provide minor user interface
 * snippet building that is generally too simplistic for Vue components, thus a pure Javascript
 * approach was implemented.
 */

"use strict";

import xssFilters from "xss-filters";
const $common = function() {
};

/**
 * Formats and returns a specialized label for a vulnerability source (NVD, NSP, VulnDB, OSSIndex etc).
 */
$common.formatSourceLabel = function formatSourceLabel(source) {
  if (! source) {
    return null;
  }
  let sourceClass = "label-source-" + source.toLowerCase();
  return `<span class="label label-source ${sourceClass}">${source}</span>`;
};

/**
 * Formats and returns a specialized label for notifications (fail, warn, info)
 */
$common.formatNotificationLabel = function formatNotificationLabel(violationState) {
  if (! violationState) {
    return null;
  }
  let violationStateClass = "label-notification-" + violationState.toLowerCase();
  return `<span class="label label-notification ${violationStateClass}">${violationState}</span>`;
};

/**
 * Formats and returns a specialized label for a project tag.
 */
$common.formatProjectTagLabel = function formatProjectTagLabel(tag) {
  if (! tag) {
    return "";
  }
  return `<a href="../projects/?tag=${xssFilters.uriComponentInUnQuotedAttr(tag.name)}" class="badge badge-tag text-uppercase mr-1">${xssFilters.inHTMLData(tag.name)}</a>`
};

/**
 * Changes the first letter to uppercase and the remaining letters to lowercase.
 *
 * @param {string} string the String to capitalize
 */
$common.capitalize = function capitalize(string) {
  if (string && string.length > 2) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
  return string;
};

/**
 * Formats and returns a specialized label for the severity of a vulnerability.
 */
$common.formatSeverityLabel = function formatSeverityLabel(severity) {
  if (!severity) {
    return "";
  }
  let severityLabel = $common.capitalize(severity);
  let severityClass = "severity-" + severity.toLowerCase() + "-bg";

  return `
     <div style="height:24px;margin:-4px;">
        <div class="${severityClass} text-center pull-left" style="width:24px; height:24px; color:#ffffff">
            <i class="fa fa-bug" style="font-size:12px; padding:6px" aria-hidden="true"></i>
         </div>
         <div class="text-center pull-left" style="height:24px;">
             <div style="font-size:12px; padding:4px"><span class="severity-value">${severityLabel}</span></div>
         </div>
     </div>`;
};

/**
 * Formats and returns a specialized label for the state of policy violations.
 */
$common.formatViolationStateLabel = function formatViolationStateLabel(violationState) {
  if (! violationState) {
    return null;
  }
  let sourceClass = "label-notification-" + violationState.toLowerCase();
  return `<span class="label label-notification ${sourceClass}">${violationState}</span>`;
};

$common.formatCweLabel = function formatCweLabel(cweId, cweName) {
  if (cweId && cweName) {
    return "<div class='truncate-ellipsis'><span>CWE-" + cweId + " " + cweName + "</span></div>"
  } else {
    return "";
  }
};

$common.formatCweShortLabel = function formatCweShortLabel(cweId, cweName) {
  if (cweId && cweName) {
    return "<span data-toggle='tooltip' data-placement='bottom' title='" + cweName + "'>CWE-" + cweId + "</span>";
  } else {
    return "";
  }
};

/**
 * Formats and returns a specialized label for a vulnerability analyzer (OSSINDEX_ANALYZER, INTERNAL_ANALYZER, etc).
 */
$common.formatAnalyzerLabel = function formatAnalyzerLabel(analyzer, vulnSource, vulnId, alternateIdentifier, referenceUrl) {
  if (! analyzer) {
    return null;
  }
  let analyzerLabel = "";
  let analyzerUrl = null;
  switch (analyzer) {
    case 'INTERNAL_ANALYZER':
      analyzerLabel = vulnSource;
      if(vulnSource === "GITHUB") {
        analyzerUrl = "https://github.com/advisories/" + vulnId;
      } else if(vulnSource === "OSV") {
        analyzerUrl = "https://osv.dev/vulnerability/" + vulnId;
      } else if(vulnSource === "SNYK") {
        analyzerUrl = "https://security.snyk.io/vuln/" + vulnId;
      }
      break;
    case 'OSSINDEX_ANALYZER':
      analyzerLabel = "OSS Index";
      analyzerUrl = (referenceUrl) ? referenceUrl : "https://ossindex.sonatype.org/vuln/" + vulnId;
      break;
    case 'VULNDB_ANALYZER':
      analyzerLabel = "VulnDB";
      analyzerUrl = "https://vulndb.cyberriskanalytics.com/vulnerabilities/" + vulnId;
      break;
    case 'SNYK_ANALYZER':
      analyzerLabel = "Snyk";
      analyzerUrl = "https://security.snyk.io/vuln/" + vulnId;
      break;
  }
  if (analyzerUrl) {
    analyzerLabel = `<a href="${analyzerUrl}" target="_blank">${analyzerLabel} <i class="fa fa-external-link"></i></a>`;
  } else {
    analyzerLabel = `<span class="label-analyzer-internal"> ${analyzerLabel} </span>`;
  }
  return `<span class="label label-source label-analyzer" style="white-space:nowrap;">${analyzerLabel}</span>`;
};

/**
 * Given the source of a vulnerability (vulnSource) and the vulnerabilities identifier, create
 * a value object which also contains the proper name of the source and the URL to the vulnerability
 * hosted by the source.
 * @param vulnSource the source of a vulnerability
 * @param vulnId the unique identifier
 * @returns a SourceInfo object
 */
$common.resolveSourceVulnInfo = function resolveSourceVulnInfo(vulnSource, vulnId) {
  let sourceInfo = {};
  sourceInfo.source = vulnSource;
  sourceInfo.vulnId = vulnId;
  switch (vulnSource) {
    case "INTERNAL":
      // TODO
      break;
    case "NVD":
      sourceInfo.name = "National Vulnerability Database";
      sourceInfo.url = "https://nvd.nist.gov/vuln/detail/" + vulnId;
      break;
    case "GITHUB":
      sourceInfo.name = "GitHub Advisories";
      sourceInfo.url = "https://github.com/advisories/" + vulnId;
      break;
    case "OSSINDEX":
      sourceInfo.name = "OSS Index";
      sourceInfo.url = "https://ossindex.sonatype.org/vuln/" + vulnId;
      break;
    case "SNYK":
      sourceInfo.name = "Snyk";
      sourceInfo.url = "https://security.snyk.io/vuln/" + vulnId;
      break;
    case "OSV":
      sourceInfo.name = "Open Source Vulnerability Database";
      sourceInfo.url = "https://osv.dev/vulnerability/" + vulnId;
      break;
    case "GSD":
      sourceInfo.name = "Global Security Database";
      sourceInfo.url = "https://github.com/cloudsecurityalliance/gsd-database";
      break;
    case "VULNDB":
      sourceInfo.name = "VulnDB";
      sourceInfo.url = "https://vulndb.cyberriskanalytics.com/vulnerabilities/" + vulnId;
      break;
  }
  return sourceInfo;
}

/**
 * Given the source of a vulnerability (vulnSource) and an alias of the vulnerability, normalizes
 * the return object.
 * @param vulnSource the source of a Vulnerability object
 * @param alias a VulnerabilityAlias response object for the given Vulnerability
 * @returns A resolved and normalized object with metadata
 */
$common.resolveVulnAliasInfo = function resolveVulnAliasInfo(vulnSource, alias) {
  if (!vulnSource || !alias) return;
  if (vulnSource !== "INTERNAL" && alias.internalId) {
    return $common.resolveSourceVulnInfo("INTERNAL", alias.internalId);
  } else if (vulnSource !== "NVD" && alias.cveId) {
    return $common.resolveSourceVulnInfo("NVD", alias.cveId);
  } else if (vulnSource !== "GITHUB" && alias.ghsaId) {
    return $common.resolveSourceVulnInfo("GITHUB", alias.ghsaId);
  } else if (vulnSource !== "OSSINDEX" && alias.sonatypeId) {
    return $common.resolveSourceVulnInfo("OSSINDEX", alias.sonatypeId);
  } else if (vulnSource !== "SNYK" && alias.snykId) {
    return $common.resolveSourceVulnInfo("SNYK", alias.snykId);
  } else if (vulnSource !== "OSV" && alias.osvId) {
    return $common.resolveSourceVulnInfo("OSV", alias.osvId);
  } else if (vulnSource !== "GSD" && alias.gsdId) {
    return $common.resolveSourceVulnInfo("GSD", alias.gsdId);
  } else if (vulnSource !== "VULNDB" && alias.vulnDbId) {
    return $common.resolveSourceVulnInfo("VULNDB", alias.vulnDbId);
  }
}

/**
 *
 * @param {*} i18n - VueI18n instance with $t translate function available
 * @returns a specialized label for an analysis state (NOT_SET, APPROVED, REJECTED, etc).
 * It must have a corresponding entry in the locales files (e.g. src/locales/en.json)
 * (not_set, approved, rejected, etc.)
 */
$common.makeAnalysisStateLabelFormatter = (i18n) => {
  return function (value) {
    switch (value) {
      case 'APPROVED':
      case 'REJECTED':
      case 'NOT_SET':
      case 'EXPLOITABLE':
      case 'IN_TRIAGE':
      case 'FALSE_POSITIVE':
      case 'NOT_AFFECTED':
      case 'RESOLVED':
        return i18n.$t(`message.${value.toLowerCase()}`)
      default:
        return null;
    }
  }
};

/**
 *
 * @param {*} i18n - VueI18n instance with $t translate function available
 * @returns a specialized label for an analysis justification (CODE_NOT_REACHABLE, etc).
 * It must have a corresponding entry in the locales files (e.g. src/locales/en.json)
 * (code_not_reachable, etc.)
 */
$common.makeAnalysisJustificationLabelFormatter = (i18n) => {
  return function (value) {
    switch (value) {
      case 'NOT_SET':
      case 'CODE_NOT_PRESENT':
      case 'CODE_NOT_REACHABLE':
      case 'REQUIRES_CONFIGURATION':
      case 'REQUIRES_DEPENDENCY':
      case 'REQUIRES_ENVIRONMENT':
      case 'PROTECTED_BY_COMPILER':
      case 'PROTECTED_AT_RUNTIME':
      case 'PROTECTED_AT_PERIMETER':
      case 'PROTECTED_BY_MITIGATING_CONTROL':
        return i18n.$t(`message.${value.toLowerCase()}`)
      default:
        return null;
    }
  }
};

/**
 *
 * @param {*} i18n - VueI18n instance with $t translate function available
 * @returns a specialized label for an analysis response (WILL_NOT_FIX, etc).
 * It must have a corresponding entry in the locales files (e.g. src/locales/en.json)
 * (will_not_fix, etc.)
 */
$common.makeAnalysisResponseLabelFormatter = (i18n) => {
  return function (value) {
    switch (value) {
      case 'NOT_SET':
      case 'CAN_NOT_FIX':
      case 'WILL_NOT_FIX':
      case 'UPDATE':
      case 'ROLLBACK':
      case 'WORKAROUND_AVAILABLE':
        return i18n.$t(`message.${value.toLowerCase()}`)
      default:
        return null;
    }
  }
};

/**
 *
 * @param {*} i18n - VueI18n instance with $t translate function available
 * @returns a specialized label for component and project classifiers (APPLICATION, LIBRARY, etc).
 * It must have a corresponding entry in the locales files (e.g. src/locales/en.json)
 * (application, library, etc.)
 */
$common.componentClassifierLabelFormatter = (i18n) => {
  return function (value) {
    switch (value) {
      case 'APPLICATION':
      case 'FRAMEWORK':
      case 'LIBRARY':
      case 'CONTAINER':
      case 'OPERATING_SYSTEM':
      case 'DEVICE':
      case 'FIRMWARE':
      case 'FILE':
        return i18n.$t(`message.component_${value.toLowerCase()}`)
      default:
        return null;
    }
  }
};

/**
 *
 * @param {*} i18n - VueI18n instance with $t translate function available
 * @returns a specialized label for component and project classifiers (APPLICATION, LIBRARY, etc).
 * It must have a corresponding entry in the locales files (e.g. src/locales/en.json)
 * (application, library, etc.)
 */
$common.componentClassifierLabelProjectUrlFormatter = (i18n) => {
  return function (value) {
    let url = "../projects/?classifier=" + value;
    switch (value) {
      case 'APPLICATION':
      case 'FRAMEWORK':
      case 'LIBRARY':
      case 'CONTAINER':
      case 'OPERATING_SYSTEM':
      case 'DEVICE':
      case 'FIRMWARE':
      case 'FILE':
        return `<a href="${url}">${i18n.$t(`message.component_${value.toLowerCase()}`)}</a>`
      default:
        return null;
    }
  }
};

/**
 * Given a UNIX timestamp, this function will return a formatted date.
 * i.e. 15 Jan 2017
 */
$common.formatTimestamp = function formatTimestamp(timestamp, includeTime) {
  let date = new Date(timestamp);
  let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function pad(num) { return num < 10 ? "0" + num : num; }
  if (includeTime) {
    return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear() + " at " + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
  } else {
    return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
  }
};

/*
 * Concatenates the group, name, and version of a component.
 */
$common.concatenateComponentName = function concatenateComponentName(group, name, version) {
  let g = $common.trimToNull(group);
  let n = $common.trimToNull(name);
  let v = $common.trimToNull(version);
  return (g != null? g + " " : "") + (n != null? n : "") + (v != null? " " + v: "");
}

/**
 * Helper function that returns the variable if it is not null, undefined, NaN,
 * an empty string (""), 0, or false. Otherwise, returns the default value.
 */
$common.valueWithDefault = function valueWithDefault(variable, defaultValue) {
  if (variable) {
    return variable;
  } else {
    return defaultValue;
  }
};

/**
 * Given a total number of something and a lower number that is completed,
 * function will return a percentage rounded to the tenth decimal place.
 */
$common.calcProgressPercent = function calcProgressPercent(total, completed) {
  if (total > 0) {
    if (completed === 0) {
      return 0;
    } else {
      let percentage = (completed / total) * 100;
      return Math.round(percentage);
    }
  } else if (completed > total) {
    // In something has already been completed (e.g. suppressed) and the completed value
    // is greater than the total, return 100%
    return 100;
  }
  return 0; // the absence of work does not imply progress.
};

/**
 * Simulates a native thread sleep function for the specific number of milliseconds.
 */
$common.sleep = function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
};

/**
 * Converts a string representation of common boolean values and returns a boolean value.
 */
$common.toBoolean = function(string) {
  if (!string) {
    return false;
  }
  if (typeof string == "boolean") {
    return string;
  }
  switch(string.toLowerCase().trim()) {
    case "true": case "yes": case "1": return true;
    case "false": case "no": case "0": case null: return false;
    default: return Boolean(string);
  }
};

$common.trimToNull = function(value) {
  if (typeof value === 'undefined') {
    return null;
  } else if (typeof value === 'string' && value.trim() === "") {
    return null;
  }
  return value;
};

$common.OWASP_RR_LIKELIHOOD_TO_IMPACT_SEVERITY_MATRIX = {
  "LOW" : {
    "LOW": "INFO",
    "MEDIUM": "LOW",
    "HIGH": "MEDIUM"
  },
  "MEDIUM" : {
    "LOW": "LOW",
    "MEDIUM": "MEDIUM",
    "HIGH": "HIGH"
  },
  "HIGH" : {
    "LOW": "MEDIUM",
    "MEDIUM": "HIGH",
    "HIGH": "CRITICAL"
  },
  "UNASSIGNED": {
    "LOW": "UNASSIGNED",
    "MEDIUM": "UNASSIGNED",
    "HIGH": "UNASSIGNED"
  }
}

export default {
  formatSourceLabel: $common.formatSourceLabel,
  formatNotificationLabel: $common.formatNotificationLabel,
  formatProjectTagLabel: $common.formatProjectTagLabel,
  capitalize: $common.capitalize,
  formatSeverityLabel: $common.formatSeverityLabel,
  formatViolationStateLabel: $common.formatViolationStateLabel,
  formatCweLabel: $common.formatCweLabel,
  formatCweShortLabel: $common.formatCweShortLabel,
  formatAnalyzerLabel: $common.formatAnalyzerLabel,
  resolveSourceVulnInfo: $common.resolveSourceVulnInfo,
  resolveVulnAliasInfo: $common.resolveVulnAliasInfo,
  makeAnalysisStateLabelFormatter: $common.makeAnalysisStateLabelFormatter,
  makeAnalysisJustificationLabelFormatter: $common.makeAnalysisJustificationLabelFormatter,
  componentClassifierLabelFormatter: $common.componentClassifierLabelFormatter,
  componentClassifierLabelProjectUrlFormatter: $common.componentClassifierLabelProjectUrlFormatter,
  formatTimestamp: $common.formatTimestamp,
  concatenateComponentName: $common.concatenateComponentName,
  valueWithDefault: $common.valueWithDefault,
  calcProgressPercent: $common.calcProgressPercent,
  sleep: $common.sleep,
  toBoolean: $common.toBoolean,
  trimToNull: $common.trimToNull,
  OWASP_RR_LIKELIHOOD_TO_IMPACT_SEVERITY_MATRIX: $common.OWASP_RR_LIKELIHOOD_TO_IMPACT_SEVERITY_MATRIX
};
