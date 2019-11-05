/**
 * This module contains reusable code fragments that are utilitarian or provide minor user interface
 * snippet building that is generally too simplistic for Vue components, thus a pure Javascript
 * approach was implemented.
 */

"use strict";

const $common = function() {
};

/**
 * Formats and returns a specialized label for a vulnerability source (NVD, NSP, VulnDB, OSSIndex etc).
 */
$common.formatSourceLabel = function formatSourceLabel(source) {
  let sourceClass = "label-source-" + source.toLowerCase();
  return `<span class="label label-source ${sourceClass}">${source}</span>`;
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
      return Math.round(percentage * 10) / 10;
    }
  } else if (completed > total) {
    // In something has already been completed (e.g. suppressed) and the completed value
    // is greater than the total, return 100%
    return 100;
  }
  return 0; // the absence of work does not imply progress.
};

module.exports = {
  formatSourceLabel: $common.formatSourceLabel,
  capitalize: $common.capitalize,
  formatSeverityLabel: $common.formatSeverityLabel,
  formatTimestamp: $common.formatTimestamp,
  valueWithDefault: $common.valueWithDefault,
  calcProgressPercent: $common.calcProgressPercent
};
