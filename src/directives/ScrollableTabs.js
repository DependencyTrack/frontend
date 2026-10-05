/*
 * Scrollable Tabs Vue Directive
 *
 * Adds left/right scroll buttons to the nav of a b-tabs component,
 * each shown only while there are tabs hidden on that side.
 * Requires the nav wrapper to carry the "nav-tabs-scroller" class, e.g.:
 *
 *   <b-tabs v-scrollable-tabs nav-wrapper-class="nav-tabs-scroller">
 */
import Vue from 'vue';

const SCROLL_STEP_PX = 200;

function createButton(nav, direction) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `nav-tabs-scroll-btn nav-tabs-scroll-btn-${direction}`;
  button.innerHTML = `<i class="fa fa-chevron-${direction}"></i>`;
  button.tabIndex = -1;
  button.setAttribute('aria-hidden', 'true');
  button.addEventListener('click', () => {
    nav.scrollBy({
      left: direction === 'left' ? -SCROLL_STEP_PX : SCROLL_STEP_PX,
      behavior: 'smooth',
    });
  });
  return button;
}

Vue.directive('scrollable-tabs', {
  inserted(el) {
    const nav = el.querySelector('.nav-tabs');
    if (!nav) {
      return;
    }

    const left = createButton(nav, 'left');
    const right = createButton(nav, 'right');
    nav.parentNode.append(left, right);

    const update = () => {
      const maxScrollLeft = nav.scrollWidth - nav.clientWidth;
      left.classList.toggle('is-visible', nav.scrollLeft > 1);
      right.classList.toggle('is-visible', nav.scrollLeft < maxScrollLeft - 1);
    };

    nav.addEventListener('scroll', update, { passive: true });
    // Width changes, e.g. when the sidebar is collapsed.
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(nav);
    // Content changes, e.g. tabs appearing or badge counts loading.
    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(nav, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    update();

    el.$scrollableTabsCleanup = () => {
      nav.removeEventListener('scroll', update);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  },
  unbind(el) {
    if (el.$scrollableTabsCleanup) {
      el.$scrollableTabsCleanup();
    }
  },
});
