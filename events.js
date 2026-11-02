// "Full event details" toggles the Luma event page embed under the card.
(function () {
  var more = document.querySelector('.event-more');
  var embed = document.getElementById('event-embed');
  if (!more || !embed) return;
  more.addEventListener('toggle', function () {
    embed.hidden = !more.open;
  });
})();
