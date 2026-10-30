// Alternatives for the DKcast hero card and the station map, made by projects-b4 on 30 Oct 2026 for Bo to choose from.
// Uses D, day, sid, LAND, el, icon, hr, loc, dname, pick and draw from the page script.

const PKD = {hero: "a", temp: "d", sun: "b", map: "a", good: "a"};
const OPD = {
  hero: [["cur", "Now", "the blue card as it is"], ["a", "A", "a 24-hour ribbon: the sky hour by hour under the temperature line"],
    ["b", "B", "the day in one plain sentence, numbers as chips"], ["c", "C", "the high and its 8-in-10 range first, tinted by the day's sky"]],
  temp: [["cur", "Now", "line and range"], ["a", "A", "the same, cleaner: high and low labelled, now marked, readable on phones"],
    ["b", "B", "one column per hour: the 8-in-10 range as the column, the forecast as a bar across it"], ["c", "C", "the whole day in one chart: temperature, then sun and rain below"], ["d", "D", "the chart as it is now, with option A's type sizes"]],
  sun: [["cur", "Now", "bars and a line on one axis"], ["a", "A", "two clear rows: sunshine minutes, then chance of rain"], ["b", "B", "a sky strip: each hour fills with sun, blue dots for rain"],
    ["c", "C", "no separate chart: sun and rain sit in temperature option C"]],
  good: [["cur", "Now", "four tiles"], ["a", "A", "one sentence, then one table: DKcast, best public, DMI, lead"], ["b", "B", "one sentence, then one chart against the best public forecast"],
    ["c", "C", "one sentence, then DKcast against yr.no and DMI, the forecasts people know"]],
  map: [["cur", "Now", "highest temperature dots"], ["a", "A", "choose what to map, colours stretched to the day's spread"],
    ["b", "B", "a TV weather map: sky symbol and temperature at 08, 14 or 20"]]
};
const GND = {hero: "Hero card", temp: "Temperature chart", sun: "Sun and rain chart", map: "Station map", good: "How good is it"};
const COMPASS = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
const TIPD = document.getElementById("tip");
function tipShow(e, html) { TIPD.innerHTML = html; TIPD.style.display = "block";
  TIPD.style.left = Math.min(e.clientX + 12, innerWidth - TIPD.offsetWidth - 8) + "px"; TIPD.style.top = (e.clientY - TIPD.offsetHeight - 12) + "px"; }
function tipHide() { TIPD.style.display = "none"; }
const r0 = x => Math.round(x);

// what the day looks like at one station
function dayStats(H) {
  const tmaxH = H.reduce((a, h) => h.temp > a.temp ? h : a), tminH = H.reduce((a, h) => h.temp < a.temp ? h : a);
  const sunH = H.reduce((a, h) => a + h.sun, 0) / 60, rmaxH = H.reduce((a, h) => h.rain > a.rain ? h : a);
  const w = H.filter(h => h.wind != null), wmax = w.length ? Math.max(...w.map(h => h.wind)) : null;
  let dir = null, x = 0, y = 0;
  w.forEach(h => { if (h.wdir != null) { x += h.wind * Math.sin(h.wdir * Math.PI / 180); y += h.wind * Math.cos(h.wdir * Math.PI / 180); } });
  if (x || y) dir = COMPASS[Math.round(((Math.atan2(x, y) * 180 / Math.PI + 360) % 360) / 45) % 8];
  const dayH = H.filter(h => { const k = hr(h.t); return k >= 8 && k <= 16; });
  const sunny = dayH.filter(h => h.sun >= 40).length, part = dayH.filter(h => h.sun >= 10 && h.sun < 40).length;
  const sky = rmaxH.rain >= 50 ? "rain" : sunny >= 5 ? "sun" : sunny + part >= 3 ? "part" : "cloud";
  return {tmaxH, tminH, sunH, rmaxH, wmax, dir, sky, dayH};
}
const cond = h => { const k = hr(h.t); if (h.rain >= 50) return "rain"; if (h.rain >= 25) return "showers";
  if (k < 7 || k > 17) return "night"; return h.sun >= 40 ? "sun" : h.sun >= 10 ? "part" : "cloud"; };
const CCOL = {sun: "#f8c64a", part: "#f3e3a6", cloud: "#d5dde6", showers: "#9cc4ee", rain: "#5f9fe0", night: "#24406a"};
const CNAME = {sun: "sunny", part: "some sun", cloud: "cloudy", showers: "showers possible", rain: "rain likely", night: "night"};
const heroTop = (H, m, S) => `<div class="top"><div style="display:flex;gap:14px;align-items:center">${icon(H[Math.min(13, H.length - 1)], "ic")}
  <div><div class="lab">${m.name}, ${day == 0 ? "today" : "tomorrow"}, ${dname(D.days[day].day)}</div><div class="big">${r0(S.tmaxH.temp)}°</div>
  <div class="lab">low ${r0(S.tminH.temp)}°</div></div></div>
  <div class="stats"><div><b>${S.sunH.toFixed(1)} h</b><span class="lab">sunshine</span></div><div><b>${S.rmaxH.rain}%</b><span class="lab">highest chance of rain</span></div>` +
  (S.wmax != null ? `<div><b>${r0(S.wmax)} m/s</b><span class="lab">strongest wind</span></div>` : "") + `</div></div>`;

// ---------- hero A: day ribbon ----------
function heroA(H, m, S) {
  const n = H.length, W = innerWidth < 600 ? 340 : 600, L = 6, R = W - 6, cw = (R - L) / n, x = i => L + (i + .5) * cw;
  const lo = S.tminH.temp, hi = S.tmaxH.temp, yT = t => 40 - (t - lo) / Math.max(1, hi - lo) * 22;
  let s = `<svg viewBox="0 0 ${W} 104" role="img" aria-label="the day hour by hour">`;
  s += `<path d="M${H.map((h, i) => `${x(i).toFixed(1)},${yT(h.temp).toFixed(1)}`).join("L")}" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
  for (const h of [S.tmaxH, S.tminH]) { const i = H.indexOf(h);
    s += `<circle cx="${x(i)}" cy="${yT(h.temp)}" r="4" fill="#fff"/><text x="${Math.min(Math.max(x(i), 20), W - 20)}" y="${h === S.tmaxH ? yT(h.temp) - 7 : yT(h.temp) - 7}" font-size="13" font-weight="700" fill="#fff" text-anchor="middle">${r0(h.temp)}°</text>`; }
  const nowH = new Date().toISOString().slice(0, 13);
  H.forEach((h, i) => {
    const c = cond(h);
    s += `<rect class="rb" data-i="${i}" x="${(L + i * cw + 1).toFixed(1)}" y="52" width="${(cw - 2).toFixed(1)}" height="30" rx="4" fill="${CCOL[c]}"/>`;
    if (day == 0 && h.t.slice(0, 13) == nowH) s += `<path d="M${x(i) - 5},44 L${x(i) + 5},44 L${x(i)},50 Z" fill="#fff"/>`;
    if (i % 6 == 0) s += `<text x="${L + i * cw + 1}" y="98" font-size="12" fill="#fff" opacity=".9">${loc(h.t)}</text>`;
  });
  const used = [...new Set(H.map(cond))];
  const leg = `<div class="chips" style="margin-top:6px">${used.map(c => `<span style="padding:3px 10px;font-size:12px"><i style="display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;background:${CCOL[c]}"></i>${CNAME[c]}</span>`).join("")}</div>`;
  document.getElementById("heroA").innerHTML = `<div class="hx">${heroTop(H, m, S)}<div class="ribbon">${s}</svg>${leg}</div></div>`;
  document.querySelectorAll("#heroA .rb").forEach(r => { const h = H[+r.dataset.i];
    r.addEventListener("pointermove", e => tipShow(e, `<b>${loc(h.t)}</b><br>${h.temp.toFixed(1)} °C (${h.temp_lo.toFixed(0)} to ${h.temp_hi.toFixed(0)})<br>sunshine ${h.sun} min, rain ${h.rain}%` +
      (h.wind != null ? `<br>wind ${h.wind.toFixed(0)} m/s` : "")));
    r.addEventListener("pointerleave", tipHide); });
}

// ---------- hero B: one plain sentence ----------
function heroB(H, m, S) {
  const sh = S.dayH.filter(h => h.sun >= 10).map(h => hr(h.t)), p2 = k => String(k).padStart(2, "0") + ".00";
  let sky = S.sky == "sun" ? "Sunny" : S.sky == "rain" ? "Rain" : S.sky == "part" && S.sunH >= 2 ? "Sunny spells" : sh.length ? "Mostly cloudy, with a little sun" : "Cloudy";
  if (sh.length && (S.sky == "part" || S.sky == "cloud")) { const a = Math.min(...sh), b = Math.max(...sh);
    sky += a >= 11 && b <= 14 ? " around midday" : b <= 12 ? " in the morning" : a >= 12 ? " in the afternoon" : ` between ${p2(a)} and ${p2(b + 1)}`; }
  const rp = S.rmaxH.rain < 15 ? "dry" : S.rmaxH.rain < 50 ? `a ${S.rmaxH.rain}% chance of rain around ${loc(S.rmaxH.t)}` : `rain likely around ${loc(S.rmaxH.t)}`;
  const wp = S.wmax == null ? "" : `, with ${S.wmax < 4 ? "a light wind" : S.wmax < 8 ? "a moderate wind" : S.wmax < 14 ? "a strong wind" : "a very strong wind"}${S.dir ? " from the " + S.dir : ""}`;
  const say = `${sky}, and ${rp}. Highest <b>${r0(S.tmaxH.temp)}°</b>, lowest ${r0(S.tminH.temp)}°${wp}.`;
  document.getElementById("heroB").innerHTML = `<div class="hx"><div class="top" style="align-items:flex-start;flex-wrap:nowrap"><div>
    <div class="lab">${m.name}, ${day == 0 ? "today" : "tomorrow"}, ${dname(D.days[day].day)}</div><p class="say">${say}</p></div>${icon(H[Math.min(13, H.length - 1)], "ic")}</div>
    <div class="chips"><span><b>${S.sunH.toFixed(1)} h</b>sunshine</span><span><b>${S.rmaxH.rain}%</b>highest chance of rain</span>` +
    (S.wmax != null ? `<span><b>${r0(S.wmax)} m/s</b>strongest wind</span>` : "") +
    `<span><b>${r0(S.tmaxH.temp_lo)} to ${r0(S.tmaxH.temp_hi)}°</b>likely range of the high</span></div></div>`;
}

// ---------- hero C: the high and its range first ----------
function heroC(H, m, S) {
  const a = Math.floor(Math.min(...H.map(h => h.temp_lo))) - 1, b = Math.ceil(Math.max(...H.map(h => h.temp_hi))) + 1, W = innerWidth < 600 ? 340 : 600, L = 14, R = W - 14;
  const x = t => L + (t - a) / (b - a) * (R - L);
  let s = `<svg viewBox="0 0 ${W} 74" role="img" aria-label="likely range of the high and the low">`;
  for (let t = a; t <= b; t++) s += `<line x1="${x(t)}" x2="${x(t)}" y1="8" y2="50" stroke="#e3e9f0"/>` + ((t - a) % Math.max(1, Math.round((b - a) / 8)) == 0 ? `<text x="${x(t)}" y="68" font-size="12" fill="#5b6875" text-anchor="middle">${t}°</text>` : "");
  for (const [h, c, lab, y] of [[S.tminH, "#3a6fc4", "low", 16], [S.tmaxH, "#e4572e", "high", 38]]) {
    s += `<rect x="${x(h.temp_lo)}" y="${y - 7}" width="${Math.max(4, x(h.temp_hi) - x(h.temp_lo))}" height="14" rx="7" fill="${c}" opacity=".22"/>` +
      `<circle cx="${x(h.temp)}" cy="${y}" r="6" fill="${c}"/>` + (x(h.temp_hi) + 90 < W ? `<text x="${x(h.temp_hi) + 8}" y="${y + 4}"` : `<text x="${x(h.temp_lo) - 8}" y="${y + 4}" text-anchor="end"`) +
      ` font-size="12" fill="${c}" font-weight="600">${lab} at ${loc(h.t)}</text>`;
  }
  document.getElementById("heroC").innerHTML = `<div class="hx sky-${S.sky}">${heroTop(H, m, S)}<div class="rangebox">
    <p>8 times out of 10 the high lands between <b>${r0(S.tmaxH.temp_lo)}°</b> and <b>${r0(S.tmaxH.temp_hi)}°</b>, and the low between
    ${r0(S.tminH.temp_lo)}° and ${r0(S.tminH.temp_hi)}°. DKcast gives every hour a range like this and widens it when the weather is hard to call.</p>${s}</svg></div></div>`;
}

// ---------- maps: shared ----------
const QX = lon => 22 + (lon - 7.9) / (15.3 - 7.9) * 516, QY = lat => 22 + (57.8 - lat) / (57.8 - 54.5) * 416;
function baseMap(M) {
  M.innerHTML = ""; el("rect", {x: 0, y: 0, width: 560, height: 460, fill: "#e8f1f8", rx: 12}, M);
  if (LAND) LAND.forEach(r => el("path", {d: "M" + r.map(p => QX(p[0]).toFixed(1) + "," + QY(p[1]).toFixed(1)).join("L") + "Z", fill: "#f3f1ea", stroke: "#cbd5df", "stroke-width": 1}, M));
}
function spread(keys, bw, bh) {
  // push overlapping markers (boxes bw by bh) apart along the shorter overlap; each keeps a leader line to its true spot
  const P = keys.map(k => ({k, x0: QX(D.meta[k].lon), y0: QY(D.meta[k].lat)})); P.forEach(p => { p.x = p.x0; p.y = p.y0; });
  for (let it = 0; it < 120; it++) for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
    const a = P[i], b = P[j], dx = b.x - a.x, dy = b.y - a.y, ox = bw - Math.abs(dx), oy = bh - Math.abs(dy);
    if (ox > 0 && oy > 0) { if (ox / bw < oy / bh) { const s = (dx >= 0 ? 1 : -1) * ox / 2; a.x -= s; b.x += s; } else { const s = (dy >= 0 ? 1 : -1) * oy / 2; a.y -= s; b.y += s; } }
  }
  P.forEach(p => { p.x = Math.min(538, Math.max(22, p.x)); p.y = Math.min(438, Math.max(22, p.y)); });
  return P;
}
function stationTip(k, H) { const S = dayStats(H);
  return `<b>${D.meta[k].name}</b><br>high ${S.tmaxH.temp.toFixed(1)} °C, low ${S.tminH.temp.toFixed(1)} °C<br>sunshine ${S.sunH.toFixed(1)} h, rain up to ${S.rmaxH.rain}%` +
    (S.wmax != null ? `<br>wind up to ${S.wmax.toFixed(0)} m/s` : "<br>no wind forecast for this station"); }
function hookStation(g, k, html) {
  g.addEventListener("pointermove", e => tipShow(e, html)); g.addEventListener("pointerleave", tipHide);
  g.onclick = () => pick(k); g.onkeydown = e => { if (e.key == "Enter") pick(k); };
}
const mix = (stops, t) => { t = Math.max(0, Math.min(1, t)); const s = t * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(s)), f = s - i;
  const A = stops[i].match(/\w\w/g).map(h => parseInt(h, 16)), B = stops[i + 1].match(/\w\w/g).map(h => parseInt(h, 16));
  return "rgb(" + A.map((v, j) => Math.round(v + (B[j] - v) * f)).join(",") + ")"; };

// ---------- map A: choose the variable ----------
let MV = "temp";
const MVS = {
  temp: {lab: "highest temperature", btn: "Temperature", f: H => Math.max(...H.map(h => h.temp)), t: v => r0(v) + "°", u: v => v.toFixed(1) + " °C", ramp: ["#4f8fd6", "#8fcfc0", "#f4d06a", "#ec7f3a"]},
  rain: {lab: "highest chance of rain in any hour", btn: "Rain", f: H => Math.max(...H.map(h => h.rain)), t: v => r0(v) + "%", u: v => r0(v) + "%", ramp: ["#f1f7fd", "#2f7fd8"]},
  wind: {lab: "strongest wind", btn: "Wind", f: H => { const w = H.filter(h => h.wind != null).map(h => h.wind); return w.length ? Math.max(...w) : null; }, t: v => r0(v), u: v => v.toFixed(0) + " m/s", ramp: ["#eef8f6", "#0f766e"]},
  sun: {lab: "hours of sunshine", btn: "Sunshine", f: H => H.reduce((a, h) => a + h.sun, 0) / 60, t: v => v.toFixed(1), u: v => v.toFixed(1) + " h", ramp: ["#f4f1ea", "#f5a524"]}
};
function mapA() {
  const M = document.getElementById("mapA"), Q = MVS[MV], D0 = D.days[day], keys = Object.keys(D.meta);
  document.getElementById("mapAt").textContent = `Across Denmark, ${day == 0 ? "today" : "tomorrow"}: ${Q.lab} at each station`;
  document.getElementById("mapAchips").innerHTML = Object.keys(MVS).map(k => `<button data-v="${k}" aria-pressed="${k == MV}">${MVS[k].btn}</button>`).join("");
  document.querySelectorAll("#mapAchips button").forEach(b => b.onclick = () => { MV = b.dataset.v; mapA(); });
  baseMap(M);
  const vals = Object.fromEntries(keys.map(k => [k, Q.f(D0.stations[k].hours)])), vs = Object.values(vals).filter(v => v != null);
  let lo = Math.min(...vs), hi = Math.max(...vs); if (hi - lo < 1e-6) { lo -= 1; hi += 1; }
  spread(keys, 32, 32).forEach(p => {
    const k = p.k, v = vals[k], sel = k == sid, t = v == null ? 0 : (v - lo) / (hi - lo), fill = v == null ? "#e3e9f0" : mix(Q.ramp, t), dark = MV != "temp" && t > .6;
    if (Math.hypot(p.x - p.x0, p.y - p.y0) > 3) { el("line", {x1: p.x0, y1: p.y0, x2: p.x, y2: p.y, stroke: "#8a9bb0", "stroke-width": 1}, M); el("circle", {cx: p.x0, cy: p.y0, r: 2.5, fill: "#5b6875"}, M); }
    const g = el("g", {class: "st", tabindex: 0, role: "button", "aria-label": `${D.meta[k].name}: ${v == null ? "no data" : Q.u(v)}`}, M);
    el("circle", {cx: p.x, cy: p.y, r: sel ? 17 : 15, fill, stroke: sel ? "#14202b" : "#fff", "stroke-width": sel ? 3 : 2}, g);
    el("text", {x: p.x, y: p.y + 4.5, "font-size": v == null ? 9.5 : 12.5, "font-weight": 700, fill: dark ? "#fff" : "#5b6875", "text-anchor": "middle"}, g, v == null ? "none" : Q.t(v));
    if (sel) el("text", {x: p.x, y: p.y - 23, "font-size": 14, "font-weight": 600, fill: "#14202b", "text-anchor": "middle", stroke: "#fff", "stroke-width": 4, "paint-order": "stroke"}, g, D.meta[k].name);
    hookStation(g, k, stationTip(k, D0.stations[k].hours));
  });
  document.getElementById("mapAleg").innerHTML = `<span>${Q.u(lo)}</span><span class="bar" style="background:linear-gradient(90deg,${Q.ramp.map(c => c).join(",")})"></span><span>${Q.u(hi)}</span>` +
    `<span>colours stretched from the lowest to the highest station today</span>`;
}

// ---------- map B: TV weather map ----------
let MHR = null;
function mapB() {
  const M = document.getElementById("mapB"), D0 = D.days[day], keys = Object.keys(D.meta), hrs = [8, 14, 20];
  if (MHR == null || !hrs.includes(MHR)) { const now = +new Date().toLocaleString("en-GB", {hour: "numeric", hourCycle: "h23", timeZone: "Europe/Copenhagen"});
    MHR = day == 0 ? (hrs.find(h => h >= now) || 20) : 14; }
  document.getElementById("mapBt").textContent = `Across Denmark, ${day == 0 ? "today" : "tomorrow"} at ${String(MHR).padStart(2, "0")}.00`;
  document.getElementById("mapBchips").innerHTML = hrs.map(h => `<button data-h="${h}" aria-pressed="${h == MHR}">${String(h).padStart(2, "0")}.00</button>`).join("");
  document.querySelectorAll("#mapBchips button").forEach(b => b.onclick = () => { MHR = +b.dataset.h; mapB(); });
  baseMap(M);
  spread(keys, 42, 52).forEach(p => {
    const k = p.k, H = D0.stations[k].hours, h = H.find(q => hr(q.t) == MHR) || H[0], sel = k == sid;
    if (Math.hypot(p.x - p.x0, p.y - p.y0) > 3) { el("line", {x1: p.x0, y1: p.y0, x2: p.x, y2: p.y, stroke: "#8a9bb0", "stroke-width": 1}, M); el("circle", {cx: p.x0, cy: p.y0, r: 2.5, fill: "#5b6875"}, M); }
    const g = el("g", {class: "st", tabindex: 0, role: "button", "aria-label": `${D.meta[k].name}: ${h.temp.toFixed(0)} degrees`}, M);
    el("rect", {x: p.x - 19, y: p.y - 28, width: 38, height: 48, rx: 9, fill: "#fff", opacity: .92, stroke: sel ? "#14202b" : "#cbd5df", "stroke-width": sel ? 2.5 : 1}, g);
    const ic = el("g", {}, g); ic.innerHTML = icon(h, "mi").replace("<svg ", `<svg x="${p.x - 14}" y="${p.y - 28}" width="28" height="28" `);
    el("text", {x: p.x, y: p.y + 14, "font-size": 13.5, "font-weight": 700, fill: "#14202b", "text-anchor": "middle"}, g, h.temp.toFixed(0) + "°");
    if (sel) el("text", {x: p.x, y: p.y - 36, "font-size": 14, "font-weight": 600, fill: "#14202b", "text-anchor": "middle", stroke: "#fff", "stroke-width": 4, "paint-order": "stroke"}, g, D.meta[k].name);
    hookStation(g, k, `<b>${D.meta[k].name}, ${loc(h.t)}</b><br>${h.temp.toFixed(1)} °C (${h.temp_lo.toFixed(0)} to ${h.temp_hi.toFixed(0)})<br>sunshine ${h.sun} min, rain ${h.rain}%` +
      (h.wind != null ? `<br>wind ${h.wind.toFixed(0)} m/s` : ""));
  });
}

// ---------- wiring ----------
function dkAll() {
  if (!D || !sid) return;
  const H = D.days[day].stations[sid].hours, m = D.meta[sid], S = dayStats(H);
  heroA(H, m, S); heroB(H, m, S); heroC(H, m, S); mapA(); mapB(); dk2All();
}
function dkApply() {
  document.querySelectorAll("[data-group]").forEach(e => e.hidden = !e.dataset.opt.split(" ").includes(PKD[e.dataset.group]));
  document.querySelectorAll("#picker button[data-g]").forEach(b => b.setAttribute("aria-pressed", PKD[b.dataset.g] == b.dataset.k));
  document.getElementById("tagsbtn").setAttribute("aria-pressed", !document.body.classList.contains("notags"));
  history.replaceState(null, "", "?" + new URLSearchParams(PKD));
  dkAll();
}
(function dkInit() {
  const q = new URLSearchParams(location.search);
  for (const g in PKD) if (OPD[g].some(o => o[0] == q.get(g))) PKD[g] = q.get(g);
  const _draw = draw; draw = function () { _draw(); dkAll(); };
  document.querySelectorAll("div[data-group]:not([data-notag])").forEach(e => {
    const k = e.dataset.opt.split(" ")[0], o = OPD[e.dataset.group].find(z => z[0] == k), t = document.createElement("div");
    t.className = "opt-tag"; t.textContent = `${GND[e.dataset.group]}: ${k == "cur" ? "now, as the page is" : "option " + o[1] + ", " + o[2]}`; e.prepend(t);
  });
  const P = document.createElement("div"); P.id = "picker";
  P.innerHTML = Object.keys(OPD).map(g => `<div class="grp"><span>${GND[g]}</span>` + OPD[g].map(([k, lab, t]) => `<button data-g="${g}" data-k="${k}" title="${t}">${lab}</button>`).join("") + `</div>`).join("") +
    `<button id="tagsbtn" title="show or hide the option labels on the page">Labels</button>`;
  document.body.appendChild(P);
  P.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return;
    if (b.id == "tagsbtn") document.body.classList.toggle("notags"); else PKD[b.dataset.g] = b.dataset.k; dkApply(); });
  const wait = setInterval(() => { if (D && sid) { clearInterval(wait); dkApply(); } }, 100);
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(dkAll, 200); });
  dkApply();
})();
