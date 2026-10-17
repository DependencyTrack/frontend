import Chart from 'chart.js/auto';
import { watch } from 'vue';
import { getStyle } from './utils';
import { resolvedTheme } from './theme';

let textColor;
let lineColor;

// Charts copy the scale defaults into their own options on first render, so only a function stays current.
Chart.defaults.scale.ticks.color = () => textColor;
Chart.defaults.scale.title.color = () => textColor;
Chart.defaults.scale.grid.color = () => lineColor;
Chart.defaults.scale.border.color = () => lineColor;

function applyChartTheme() {
  textColor = getStyle('--dt-text-muted');
  lineColor = getStyle('--dt-line');
  Chart.defaults.color = textColor;
  Chart.defaults.borderColor = lineColor;
  Object.assign(Chart.defaults.plugins.tooltip, {
    backgroundColor: getStyle('--dt-inverse-bg'),
    titleColor: getStyle('--dt-inverse-fg'),
    bodyColor: getStyle('--dt-inverse-fg'),
    footerColor: getStyle('--dt-inverse-fg'),
  });
}

// Runs synchronously, so the defaults change before the charts update.
watch(resolvedTheme, applyChartTheme, { immediate: true, flush: 'sync' });
