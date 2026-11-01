// Counts page visits for the admin dashboard. Sends the page path, the referring
// site and a phone/desktop flag to the Forum's Google Sheet. No cookies, no IP
// addresses, no personal data.
(function () {
  try {
    // Skip the admin's own browsers so testing doesn't inflate the numbers.
    if (localStorage.getItem('fcs-admin') === '1') return;
    var ENDPOINT = 'https://script.google.com/macros/s/AKfycbzHE8GvxoKe8CTbUEjrxcqwuijy74eEDrT0aD4l2887J1kCUVgbQgWBxV22x-cB0qd8rg/exec?t=visit';
    var ref = '';
    try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
    if (ref === location.hostname) ref = '';
    var src = new URLSearchParams(location.search).get('s') || '';
    var payload = JSON.stringify({
      path: location.pathname,
      ref: ref,
      src: src,
      device: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'Phone' : 'Desktop'
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'text/plain' }));
    } else {
      fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body: payload, keepalive: true });
    }
  } catch (e) {}
})();
