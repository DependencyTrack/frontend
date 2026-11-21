import { describe, expect, it } from 'vitest';
import { scrollBehavior } from './scrollBehavior';

describe('scrollBehavior', () => {
  it('keeps the scroll position when navigating between admin items', () => {
    const to = { path: '/admin/accessManagement/permissions' };
    const from = { path: '/admin/accessManagement/teams' };
    expect(scrollBehavior(to, from, null)).toBe(false);
  });

  it('scrolls to the top when navigating from outside admin into admin', () => {
    const to = { path: '/admin/accessManagement/teams' };
    const from = { path: '/dashboard' };
    expect(scrollBehavior(to, from, null)).toEqual({ top: 0 });
  });
});
