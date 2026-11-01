// /admin-on marks this browser as the admin's; /admin-off unmarks it.
(function () {
  try {
    if (location.pathname.indexOf('/admin-off') === 0) localStorage.removeItem('fcs-admin');
    else localStorage.setItem('fcs-admin', '1');
  } catch (e) {}
  location.replace('/');
})();
