// Signup form checks: name and email are required, email and phone must look valid.
// Runs before the form posts to Netlify. Without JavaScript, the browser's own
// "required" checks still apply.
(function () {
  var form = document.querySelector('form.signup');
  if (!form) return;
  form.noValidate = true;

  var fields = {
    name:  { el: form.querySelector('#name'),  label: 'Full name' },
    email: { el: form.querySelector('#email'), label: 'Email' },
    phone: { el: form.querySelector('#phone'), label: 'Phone' }
  };
  var alertBox = form.querySelector('#form-alert');
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var phoneRe = /^[0-9+()\-.\s]{7,30}$/;

  function check(key) {
    var v = fields[key].el.value.trim();
    if (key === 'name' && !v) return 'Please enter your full name.';
    if (key === 'email' && !v) return 'Please enter your email address.';
    if (key === 'email' && !emailRe.test(v)) return 'Please enter a valid email address.';
    if (key === 'phone' && v && !phoneRe.test(v)) return 'Please enter a valid phone number.';
    return '';
  }

  function show(key, msg) {
    var f = fields[key];
    var err = form.querySelector('#' + key + '-error');
    err.textContent = msg;
    f.el.classList.toggle('invalid', !!msg);
    f.el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  form.addEventListener('submit', function (e) {
    var problems = [];
    var firstBad = null;
    ['name', 'email', 'phone'].forEach(function (key) {
      var msg = check(key);
      show(key, msg);
      if (msg) {
        problems.push(fields[key].label);
        if (!firstBad) firstBad = fields[key].el;
      }
    });

    if (problems.length) {
      e.preventDefault();
      var missing = [];
      if (!fields.name.el.value.trim()) missing.push('Full name');
      if (!fields.email.el.value.trim()) missing.push('Email');
      alertBox.textContent = missing.length
        ? 'Please fill in: ' + missing.join(' and ') + '.'
        : 'Please fix the highlighted ' + (problems.length > 1 ? 'fields.' : 'field.');
      alertBox.classList.add('show');
      firstBad.focus();
      return;
    }

    alertBox.textContent = '';
    alertBox.classList.remove('show');
    var button = form.querySelector('button[type=submit]');
    button.classList.add('sent');

    // Without fetch, let the browser post the form to Netlify the usual way.
    if (!window.fetch || !window.Promise) return;

    // Send the signup to both places and wait for them before showing the
    // thank-you page, so a phone can't drop the request mid-navigation.
    e.preventDefault();
    button.disabled = true;
    var done = false;
    function finish(ok) {
      if (done) return;
      done = true;
      if (ok) window.location.href = '/thanks/';
      else HTMLFormElement.prototype.submit.call(form);
    }
    var toNetlify = fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function (r) { return r.ok; }, function () { return false; });
    var toSheet = sendToSheet();
    Promise.all([toNetlify, toSheet]).then(function (results) { finish(results[0]); });
    setTimeout(function () { finish(true); }, 6000);
  });

  // Send the signup straight to the Forum's Google Sheet. Netlify also keeps
  // its own copy of every submission as a backup. Resolves once the request
  // has gone out (Google's reply can't be read here, and isn't needed).
  function sendToSheet() {
    try {
      if (form.querySelector('[name=company]') && form.querySelector('[name=company]').value) return Promise.resolve();
      var endpoint = 'https://script.google.com/macros/s/AKfycbzHE8GvxoKe8CTbUEjrxcqwuijy74eEDrT0aD4l2887J1kCUVgbQgWBxV22x-cB0qd8rg/exec?token=gqL5kYjFWJjnWjKZrb16yloa8znqIq2D';
      var payload = JSON.stringify({
        data: {
          name: fields.name.el.value.trim(),
          email: fields.email.el.value.trim(),
          phone: fields.phone.el.value.trim()
        }
      });
      return fetch(endpoint, { method: 'POST', mode: 'no-cors', body: payload, keepalive: true })
        .then(function () {}, function () {});
    } catch (err) {
      return Promise.resolve();
    }
  }

  // Clear a field's error as soon as the person fixes it.
  Object.keys(fields).forEach(function (key) {
    fields[key].el.addEventListener('input', function () {
      if (fields[key].el.classList.contains('invalid') && !check(key)) {
        show(key, '');
        if (!form.querySelector('.invalid')) {
          alertBox.textContent = '';
          alertBox.classList.remove('show');
        }
      }
    });
  });
})();
