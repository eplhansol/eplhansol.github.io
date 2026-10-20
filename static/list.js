(function () {
  'use strict';
  if (!window.JD) return;
  var items = [].slice.call(document.querySelectorAll('.clinic'));
  if (!items.length) return;
  var hol = document.getElementById('hol');
  var asof = document.getElementById('asof');
  var empty = document.getElementById('empty');
  var filter = 'all';
  var DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

  function data(el) {
    return { hours: JSON.parse(el.dataset.hours), breaks: JSON.parse(el.dataset.breaks || '{}'),
             hol: el.dataset.hol ? JSON.parse(el.dataset.hol) : null };
  }
  function lateNight(c) {
    return Object.keys(c.hours).some(function (k) { var h = c.hours[k]; return h && h[1] > '19:00'; });
  }
  function label(s, c, day, d) {
    if (s.state === 'open') return ['진료중', 'open'];
    if (s.state === 'break') return ['휴게시간', 'break'];
    if (s.state === 'holiday') return ['공휴일 정보 없음 · 전화 문의', 'off'];
    var h = isHoliday() ? c.hol : c.hours[day];
    if (!h) return ['휴진', 'off'];
    var now = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    return now < h[0] ? [h[0] + '부터 진료', 'off'] : ['진료종료', 'off'];
  }
  function isHoliday() { return !!hol && hol.getAttribute('aria-pressed') === 'true'; }

  function paint() {
    var d = new Date();
    var day = JD.DAYS[d.getDay()];
    if (asof) asof.textContent = DAY_KO[d.getDay()] + '요일 ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ' 기준';
    var shown = 0;
    items.forEach(function (el) {
      var c = data(el);
      var s = JD.openState(c, d, isHoliday());
      var lb = label(s, c, day, d);
      var st = el.querySelector('.state');
      st.textContent = lb[0];
      st.className = 'state ' + lb[1];
      var h = c.hours[day];
      var br = (c.breaks[day] || []).map(function (b) { return b[0] + '–' + b[1]; });
      el.querySelector('.today').textContent = isHoliday() ? (c.hol ? '오늘(공휴일) ' + c.hol[0] + '–' + c.hol[1] : '오늘 공휴일 · 정보 없음 · 전화 문의') :
        h ? '오늘 ' + h[0] + '–' + h[1] + (br.length ? ' · 휴게시간 ' + br.join(', ') : '') : '오늘 휴진';
      [].forEach.call(document.querySelectorAll('.hrs tr[data-day]'), function (tr) {
        tr.classList.toggle('today', tr.dataset.day === day);
      });
      var ok = filter === 'all' ||
        (filter === 'now' && s.state === 'open') ||
        (filter === 'sat' && !!c.hours.sat) ||
        (filter === 'sun' && !!c.hours.sun) ||
        (filter === 'night' && lateNight(c)) ||
        (filter.indexOf('dept:') === 0 && el.dataset.dept === filter.slice(5));
      el.hidden = !ok;
      if (ok) shown++;
    });
    if (empty) empty.hidden = shown > 0;
  }
  [].forEach.call(document.querySelectorAll('.chip[data-f]'), function (b) {
    b.addEventListener('click', function () {
      [].forEach.call(document.querySelectorAll('.chip[data-f]'), function (x) {
        x.classList.remove('on'); x.setAttribute('aria-pressed', 'false');
      });
      b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
      filter = b.dataset.f;
      paint();
    });
  });
  if (hol) hol.addEventListener('click', function () {
    var on = !isHoliday();
    hol.setAttribute('aria-pressed', on ? 'true' : 'false');
    hol.classList.toggle('on', on);
    paint();
  });
  paint();
  setInterval(paint, 60000);
})();
