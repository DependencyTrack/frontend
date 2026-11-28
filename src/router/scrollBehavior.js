// NB: Focusing a component in the dependency graph is a navigation, but stays on the same page.
const inGraph = ({ path }) => path.includes('/dependencyGraph');
// NB: Switching between administration items keeps the admin menu in place.
const inAdmin = ({ path }) => path === '/admin' || path.startsWith('/admin/');

export function scrollBehavior(to, from, savedPosition) {
  if (inGraph(to) && inGraph(from)) return false;
  if (inAdmin(to) && inAdmin(from)) return false;
  if (!savedPosition) return { top: 0 };
  // NB: Tables render their rows after loading, so the page may still be too short to scroll back.
  const deadline = Date.now() + 2000;
  return new Promise((resolve) => {
    const restore = () => {
      const fits =
        document.documentElement.scrollHeight >=
        savedPosition.top + window.innerHeight;
      if (fits || Date.now() > deadline) resolve(savedPosition);
      else requestAnimationFrame(restore);
    };
    restore();
  });
}
