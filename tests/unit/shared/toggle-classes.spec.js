import { sidebarCssClasses } from '@/shared/classes';
import toggleClasses from '@/shared/toggle-classes';

// document.body.className is reset by the global afterEach in tests/setup.js.
describe('shared/toggle-classes', () => {
  it('adds the class when it is absent', () => {
    toggleClasses('sidebar-md-show', sidebarCssClasses);

    expect(document.body.classList.contains('sidebar-md-show')).toBe(true);
  });

  it('removes every class that precedes the toggled one in the list', () => {
    document.body.classList.add('sidebar-show', 'sidebar-sm-show');

    toggleClasses('sidebar-md-show', sidebarCssClasses);

    expect(document.body.classList.contains('sidebar-show')).toBe(false);
    expect(document.body.classList.contains('sidebar-sm-show')).toBe(false);
    expect(document.body.classList.contains('sidebar-md-show')).toBe(true);
  });

  it('leaves classes that follow the toggled one in the list alone', () => {
    document.body.classList.add('sidebar-xl-show');

    toggleClasses('sidebar-md-show', sidebarCssClasses);

    expect(document.body.classList.contains('sidebar-xl-show')).toBe(true);
    expect(document.body.classList.contains('sidebar-md-show')).toBe(true);
  });

  it('removes the class when force is false', () => {
    document.body.classList.add('sidebar-md-show');

    toggleClasses('sidebar-md-show', sidebarCssClasses, false);

    expect(document.body.classList.contains('sidebar-md-show')).toBe(false);
  });

  it('keeps an already present class when force is true', () => {
    document.body.classList.add('sidebar-md-show');

    toggleClasses('sidebar-md-show', sidebarCssClasses, true);

    expect(document.body.classList.contains('sidebar-md-show')).toBe(true);
  });

  it('toggles the class off when called twice without force', () => {
    toggleClasses('sidebar-md-show', sidebarCssClasses);
    toggleClasses('sidebar-md-show', sidebarCssClasses);

    expect(document.body.classList.contains('sidebar-md-show')).toBe(false);
  });

  it('removes all but the last list entry for a class outside the list', () => {
    // indexOf() returns -1 for an unknown class, so slice(0, -1) clears
    // everything except the final entry. Pinned rather than endorsed.
    document.body.classList.add('sidebar-show', 'sidebar-xl-show');

    toggleClasses('unknown-class', sidebarCssClasses);

    expect(document.body.classList.contains('sidebar-show')).toBe(false);
    expect(document.body.classList.contains('sidebar-xl-show')).toBe(true);
    expect(document.body.classList.contains('unknown-class')).toBe(true);
  });
});
