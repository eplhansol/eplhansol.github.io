(function () {
  'use strict';
  var q = document.getElementById('q'), box = document.getElementById('qres');
  if (!q || !box) return;
  var regions = null, shards = {}, cur = -1, seq = 0;
  function get(url) {
    return fetch(url).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
  }
  function norm(s) { return s.replace(/[^0-9A-Za-z가-힣]/g, '').toLowerCase(); }
  function loadRegions() {
    if (regions) return Promise.resolve(regions);
    return get('/static/search/regions.json').then(function (j) {
      j.forEach(function (x) { x.kn = x.k.split(' ').map(norm); });
      regions = j; return j;
    });
  }
  function loadShard(ch) {
    if (!ch) return Promise.resolve([]);
    if (!shards[ch]) shards[ch] = get('/static/search/' + ch.charCodeAt(0).toString(16) + '.json');
    return shards[ch];
  }
  function hit(x, tok) {
    return x.kn.some(function (w) { return w.indexOf(tok) === 0 || (w.length >= 2 && tok.indexOf(w) === 0); });
  }
  function render(list) {
    cur = -1;
    if (!list.length) {
      box.innerHTML = q.value.trim() ? '<li class="none">검색 결과가 없습니다. 지역과 진료 분야를 띄어 넣어 보세요(예: 서울 강남 치과).</li>' : '';
      box.hidden = !q.value.trim();
      return;
    }
    box.innerHTML = list.map(function (x, i) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = x.u; a.id = 'qr' + i;
      var b = document.createElement('b'); b.textContent = x.t;
      var s = document.createElement('span'); s.textContent = x.s;
      a.appendChild(b); a.appendChild(s); li.appendChild(a);
      return li.outerHTML;
    }).join('');
    box.hidden = false;
  }
  q.addEventListener('input', function () {
    var toks = q.value.split(/\s+/).map(norm).filter(Boolean), my = ++seq;
    if (!toks.length) { render([]); return; }
    loadRegions().then(function (reg) {
      if (my !== seq) return;
      var found = reg.filter(function (x) { return toks.every(function (t) { return hit(x, t); }); });
      var dept = toks.some(function (t) { return reg.some(function (x) { return x.n === 4 && hit(x, t); }); });
      var order = dept ? [4, 3, 2, 0, 1] : [0, 1, 2, 3, 4];
      found.sort(function (a, b) { return order.indexOf(a.n) - order.indexOf(b.n) || a.t.length - b.t.length; });
      if (found.length) { render(found.slice(0, 8)); return; }
      var v = toks.join('');
      loadShard(v.charAt(0)).then(function (cl) {
        if (my !== seq) return;
        render(cl.filter(function (x) { return norm(x.t).indexOf(v) >= 0; }).slice(0, 8));
      });
    });
  });
  q.addEventListener('keydown', function (e) {
    var links = box.querySelectorAll('a');
    if (!links.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      cur = (cur + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      [].forEach.call(links, function (a, i) { a.classList.toggle('on', i === cur); });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      location.href = links[Math.max(cur, 0)].href;
    } else if (e.key === 'Escape') {
      box.hidden = true;
    }
  });
})();
