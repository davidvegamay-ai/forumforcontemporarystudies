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
    if (key === 'email' && !emailRe.test(v)) return 'Please enter a valid email address, like name@example.com.';
    if (key === 'phone' && v && !phoneRe.test(v)) return 'Please enter a valid phone number, or leave it blank.';
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
    form.querySelector('button[type=submit]').classList.add('sent');
  });

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
