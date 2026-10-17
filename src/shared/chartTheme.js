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

// Color alone can't tell the series apart for color-blind users, so each line also gets its own dash.
const lineDashes = [[], [10, 4], [4, 4], [2, 4], [10, 4, 2, 4]];
Chart.defaults.elements.line.borderDash = ({ datasetIndex }) =>
  lineDashes[datasetIndex % lineDashes.length];
const { generateLabels } = Chart.defaults.plugins.legend.labels;
Object.assign(Chart.defaults.plugins.legend.labels, {
  usePointStyle: true,
  pointStyle: 'line',
  pointStyleWidth: 32,
  // Point-style labels take the point's style, which has no dash.
  generateLabels: (chart) =>
    generateLabels(chart).map((label) => {
      const { borderDash, borderWidth } = chart
        .getDatasetMeta(label.datasetIndex)
        .controller.getStyle();
      return { ...label, lineDash: borderDash, lineWidth: borderWidth };
    }),
});

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
