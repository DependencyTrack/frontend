import $ from 'jquery';
import '@/plugins/table';

/**
 * The plugin wraps bootstrap-table's own formatShowingRows default. `this` is
 * the table's options object, which is where applyTotalCountHeaders parks the
 * bounded total.
 */
describe('plugins/table', () => {
  const formatShowingRows = () =>
    $.fn.bootstrapTable.defaults.formatShowingRows;

  describe('formatShowingRows', () => {
    it('leaves the count alone for a table without a bounded total', () => {
      const rendered = formatShowingRows().call({}, 1, 25, 40, 40);

      expect(rendered).toContain('40');
      expect(rendered).not.toContain('+');
      expect(rendered).not.toContain('<span');
    });

    it('renders a bounded total as a lower bound', () => {
      const rendered = formatShowingRows().call(
        { boundedTotal: '250' },
        1,
        25,
        275,
        275,
      );

      expect(rendered).toContain('250+');
      // The headroom applyTotalCountHeaders adds is a pager device; showing it
      // would claim a total the server never reported.
      expect(rendered).not.toContain('275');
      expect(rendered).not.toContain('<span');
    });

    it('renders the tooltip when the view supplies one', () => {
      const rendered = formatShowingRows().call(
        { boundedTotal: '250', boundedTotalTitle: 'Counting skipped' },
        1,
        25,
        275,
        275,
      );

      expect(rendered).toContain('<span title="Counting skipped">250+</span>');
    });

    it('escapes the tooltip before putting it in the title attribute', () => {
      const rendered = formatShowingRows().call(
        { boundedTotal: '250', boundedTotalTitle: '" onmouseover="alert(1)' },
        1,
        25,
        275,
        275,
      );

      expect(rendered).not.toContain('onmouseover="');
      expect(rendered).toContain('&quot;');
    });
  });
});
