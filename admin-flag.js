// Shows the Admin Log-In link only in browsers the admin has marked by visiting
// /admin-on once. Everyone else never sees it. This only controls visibility:
// the dashboard itself requires signing in with info@nycfcs.org.
(function () {
  try {
    if (localStorage.getItem('fcs-admin') === '1') {
      document.documentElement.classList.add('is-admin');
    }
  } catch (e) {}
})();
