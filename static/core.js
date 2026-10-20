(function (root) {
  'use strict';

  var DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  function toMin(hhmm) {
    var p = hhmm.split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function openState(c, date, holiday) {
    if (holiday && !c.hol) return { state: 'holiday', until: null };
    var day = DAYS[date.getDay()];
    var h = holiday ? c.hol : (c.hours && c.hours[day]);
    if (!h) return { state: 'closed', until: null };
    var now = date.getHours() * 60 + date.getMinutes();
    var o = toMin(h[0]), cl = toMin(h[1]);
    if (now < o || now >= cl) return { state: 'closed', until: null };
    var br = holiday ? [] : ((c.breaks && c.breaks[day]) || []);
    for (var i = 0; i < br.length; i++) {
      if (now >= toMin(br[i][0]) && now < toMin(br[i][1])) return { state: 'break', until: br[i][1] };
    }
    return { state: 'open', until: h[1] };
  }

  var RATE = 0.3, MAX_LIFETIME = 2, MIN_AGE = 65;

  function implantEstimate(x) {
    var age = +x.age || 0, used = Math.max(0, Math.min(MAX_LIFETIME, +x.used || 0));
    var count = Math.max(0, Math.floor(+x.count || 0));
    var fee = Math.max(0, +x.coveredFee || 0), unfee = Math.max(0, +x.uncoveredFee || 0);
    var extra = Math.max(0, +x.extra || 0);
    var eligible = age >= MIN_AGE;
    var covered = eligible ? Math.min(count, MAX_LIFETIME - used) : 0;
    var notCovered = count - covered;
    var coveredPay = Math.round(covered * fee * RATE);
    var coveredInsurer = covered * fee - coveredPay;
    var uncoveredPay = notCovered * unfee;
    var why;
    if (!eligible) why = '만 65세 미만은 임플란트에 건강보험이 적용되지 않습니다.';
    else if (used >= MAX_LIFETIME) why = '건강보험 임플란트는 평생 2개까지인데 이미 2개를 받아, 이번 임플란트는 모두 비급여입니다.';
    else if (notCovered > 0) why = '건강보험 적용은 평생 2개까지라 이번에는 ' + covered + '개에만 적용됩니다. 나머지 ' + notCovered + '개는 비급여입니다.';
    else why = covered === 1 ? '1개에 건강보험이 적용됩니다.' : covered + '개 모두에 건강보험이 적용됩니다.';
    return {
      eligible: eligible, covered: covered, notCovered: notCovered,
      coveredPay: coveredPay, coveredInsurer: coveredInsurer,
      uncoveredPay: uncoveredPay, extra: extra,
      total: coveredPay + uncoveredPay + extra,
      why: why
    };
  }

  var api = { openState: openState, implantEstimate: implantEstimate, DAYS: DAYS, RATE: RATE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JD = api;
})(this);
