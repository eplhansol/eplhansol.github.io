(function () {
  'use strict';
  var f = document.getElementById('calc'), out = document.getElementById('res');
  if (!f || !out || !window.JD) return;
  function won(n) { return Math.round(n).toLocaleString('ko-KR') + '원'; }
  function val(name) { return f.elements[name].value; }
  function paint() {
    var r = JD.implantEstimate({
      age: val('age'), used: val('used'), count: val('count'),
      coveredFee: val('coveredFee'), uncoveredFee: val('uncoveredFee'), extra: val('extra')
    });
    var rows = [];
    if (r.covered) rows.push(['건강보험 임플란트 ' + r.covered + '개 본인부담금(30%)', won(r.coveredPay), '']);
    if (r.covered) rows.push(['건강보험 임플란트 ' + r.covered + '개 공단부담금(70%)', won(r.coveredInsurer), 'muted']);
    if (r.notCovered) rows.push(['비급여 임플란트 ' + r.notCovered + '개', won(r.uncoveredPay), '']);
    if (r.extra) rows.push(['그 밖의 비급여', won(r.extra), '']);
    out.innerHTML =
      '<table>' + rows.map(function (x) {
        return '<tr' + (x[2] ? ' class="' + x[2] + '"' : '') + '><th>' + x[0] + '</th><td>' + x[1] + '</td></tr>';
      }).join('') +
      '<tr class="sum"><th>내가 낼 금액 합계(예상)</th><td>' + won(r.total) + '</td></tr></table>' +
      '<p class="why">' + r.why + '</p>';
  }
  f.addEventListener('input', paint);
  f.addEventListener('change', paint);
  paint();
})();
