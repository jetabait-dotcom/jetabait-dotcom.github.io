/* Search providers and type-ahead UI. No library records leave the browser. */
const searchCache = new Map();
const plain = text => String(text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
function retryImage(img) {
  let fallback = [];
  try { fallback = JSON.parse(img.dataset.fallbacks || '[]'); } catch {}
  const next = fallback.find(url => url && url !== img.src && /^https:\/\//i.test(url));
  if (next) { img.dataset.fallbacks = JSON.stringify(fallback.filter(url => url !== next)); img.src = next; }
  else img.remove();
}
async function searchJSON(url, options, signal) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(cancel, 8000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw Error(`HTTP ${response.status}`);
    return await response.json();
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', cancel); }
}
async function animeSearch(q, signal) {
  const query = 'query($search:String){Page(perPage:12){media(search:$search,type:ANIME,isAdult:false,sort:SEARCH_MATCH){id idMal title{romaji english native} episodes startDate{year} coverImage{large medium extraLarge} siteUrl description(asHtml:false) genres synonyms}}}';
  const data = await searchJSON('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ query, variables: { search: q } }) }, signal);
  if (!Array.isArray(data.data?.Page?.media)) throw Error('AniList unavailable');
  return data.data.Page.media.map(x => ({ id: x.idMal ? 'mal-' + x.idMal : 'anilist-' + x.id, title: x.title.english || x.title.romaji || x.title.native, aliases: [x.title.romaji, x.title.native, ...(x.synonyms || [])].filter(Boolean), kind: 'anime', year: x.startDate?.year, episodes: x.episodes, poster: x.coverImage?.large, posterOptions: [x.coverImage?.extraLarge, x.coverImage?.medium].filter(Boolean), synopsis: plain(x.description), source: x.siteUrl, provider: 'AniList', genre: (x.genres || []).join(', ') }));
}
async function jikanSearch(q, signal) {
  const data = await searchJSON('https://api.jikan.moe/v4/anime?' + new URLSearchParams({ q, limit: '12', sfw: 'true' }), {}, signal);
  if (!Array.isArray(data.data)) throw Error('Jikan unavailable');
  return data.data.map(x => ({ id: 'mal-' + x.mal_id, title: x.title_english || x.title, aliases: [x.title, x.title_japanese], kind: 'anime', year: x.year || x.aired?.prop?.from?.year, episodes: x.episodes, poster: x.images?.jpg?.large_image_url, posterOptions: [x.images?.jpg?.image_url, x.images?.jpg?.small_image_url].filter(Boolean), synopsis: x.synopsis, source: x.url, provider: 'MyAnimeList / Jikan', genre: (x.genres || []).map(g => g.name).join(', ') }));
}
async function wikiSearch(q, kind, signal) {
  const thai = /[\u0E00-\u0E7F]/.test(q), lang = thai ? 'th' : 'en';
  const term = kind === 'movie' ? (thai ? 'ภาพยนตร์' : 'film') : (thai ? 'อนิเมะ' : 'anime');
  const params = new URLSearchParams({ action: 'query', format: 'json', origin: '*', generator: 'search', gsrsearch: q + ' ' + term, gsrnamespace: '0', gsrlimit: '12', prop: 'pageimages|extracts|info|pageprops|langlinks', ppprop: 'disambiguation', lllang: 'en', lllimit: '1', piprop: 'thumbnail', pilicense: 'any', pithumbsize: '400', exintro: '1', explaintext: '1', exsentences: '3', inprop: 'url' });
  const data = await searchJSON(`https://${lang}.wikipedia.org/w/api.php?` + params, {}, signal);
  if (data.error) throw Error('Wikipedia unavailable');
  return Object.values(data.query?.pages || {}).sort((a, b) => a.index - b.index).filter(x => {
    const summary = (x.extract || '').slice(0, 650);
    if (Object.hasOwn(x.pageprops || {}, 'disambiguation')) return false;
    const terms = q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.every(term => x.title.toLocaleLowerCase().includes(term))) return false;
    if (/soundtrack|accolades|^list of|รายชื่อ|เพลงประกอบ|รางวัล/i.test(x.title)) return false;
    return kind === 'movie' ? /\bfilm\b|ภาพยนตร์/i.test(summary) : /\banime\b|อนิเมะ|อนิเมชัน/i.test(summary);
  }).map(x => {
    const year = (x.extract || '').match(/\b(?:19|20)\d{2}\b/);
    const buddhist = (x.extract || '').match(/\b(25\d{2})\b/);
    return { id: `wiki-${lang}-${x.pageid}`, title: x.title, englishTitle: x.langlinks?.[0]?.['*'], kind, year: kind === 'anime' ? null : year ? Number(year[0]) : buddhist ? Number(buddhist[0]) - 543 : null, episodes: kind === 'movie' ? 1 : null, poster: x.thumbnail?.source, synopsis: plain(x.extract), source: x.fullurl, provider: 'Wikipedia', genre: kind === 'movie' ? 'ภาพยนตร์' : 'อนิเมะ' };
  });
}
async function lookupTitles(q, kind, signal) {
  const key = kind + ':' + q.toLowerCase();
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.time < 300000) return cached.rows;
  let rows;
  if (kind === 'movie' || /[\u0E00-\u0E7F]/.test(q)) {
    rows = await wikiSearch(q, kind, signal);
    if (kind === 'anime' && rows.length) {
      const main = rows.find(x => x.title.toLocaleLowerCase() === q.toLocaleLowerCase()) || rows.find(x => x.englishTitle);
      if (main?.englishTitle) {
        try {
          const enriched = await animeSearch(main.englishTitle.replace(/\s*\([^)]*\)\s*$/, ''), signal);
          if (enriched.length) {
            enriched[0].aliases = [main.title, ...(enriched[0].aliases || [])];
            rows = enriched;
          }
        } catch (error) { if (signal?.aborted) throw error; }
      }
    }
    if (!rows.length && kind === 'anime') rows = await animeSearch(q, signal);
  } else {
    try { rows = await animeSearch(q, signal); }
    catch (error) {
      if (signal?.aborted) throw error;
      try { rows = await jikanSearch(q, signal); }
      catch (fallbackError) { if (signal?.aborted) throw fallbackError; rows = await wikiSearch(q, kind, signal); }
    }
    if (!rows.length) rows = await wikiSearch(q, kind, signal);
  }
  if (signal?.aborted) throw Error('cancelled');
  rows = [...new Map(rows.map(x => [x.id, x])).values()];
  searchCache.set(key, { rows, time: Date.now() });
  if (searchCache.size > 50) searchCache.delete(searchCache.keys().next().value);
  return rows;
}
function highlightTitle(title, query) {
  const text = String(title || ''), needle = query.trim().toLocaleLowerCase();
  if (!needle) return esc(text);
  let cursor = 0, output = '', index;
  while ((index = text.toLocaleLowerCase().indexOf(needle, cursor)) !== -1) {
    output += esc(text.slice(cursor, index)) + '<mark>' + esc(text.slice(index, index + needle.length)) + '</mark>';
    cursor = index + needle.length;
  }
  return output + esc(text.slice(cursor));
}
function initSearch() {
  let timer, controller, composing = false, active = -1;
  const input = $('query'), region = $('results'), button = $('search-button');
  const cancel = () => { clearTimeout(timer); controller?.abort(); ++searchId; button.disabled = false; region.setAttribute('aria-busy', 'false'); active = -1; input.removeAttribute('aria-activedescendant'); };
  const pick = index => { const x = results[index]; if (x) { cancel(); edit(items.find(i => i.id === x.id) || x); } };
  async function search() {
    cancel();
    const q = input.value.trim(), kind = $('search-kind').value, request = searchId;
    if (q.length < 2) { results = []; region.innerHTML = '<div class="search-start">พิมพ์อย่างน้อย 2 ตัวอักษร รายชื่อเรื่องจะแสดงอัตโนมัติ</div>'; return; }
    controller = new AbortController(); button.disabled = true; region.setAttribute('aria-busy', 'true'); region.innerHTML = '<div class="search-start"><span class="search-spinner"></span> กำลังค้นหา “' + esc(q) + '”…</div>';
    try {
      const found = await lookupTitles(q, kind, controller.signal);
      if (request !== searchId) return;
      results = found;
      region.innerHTML = found.length ? `<p class="search-summary">พบ ${found.length} เรื่อง · เลือกเพื่อเก็บเข้าคลัง</p>` + found.map((x, i) => {
        const alias = (x.aliases || []).find(s => s && s.toLowerCase() !== x.title.toLowerCase() && s.toLowerCase().includes(q.toLowerCase()));
        return `<div class="result" id="suggestion-${i}" data-suggestion="${i}">${safeURL(x.poster) ? `<img src="${esc(safeURL(x.poster))}" data-fallbacks="${esc(JSON.stringify(x.posterOptions || []))}" alt="" loading="lazy">` : '<div class="result-placeholder" aria-hidden="true">' + (kind === 'anime' ? '✧' : '▻') + '</div>'}<div class="result-body"><h3>${highlightTitle(x.title, q)}</h3>${alias ? `<div class="result-alias">${highlightTitle(alias, q)}</div>` : ''}<p>${esc(x.year || 'ไม่ระบุปี')} · ${esc(x.genre || '')}${x.episodes && kind === 'anime' ? ' · ' + x.episodes + ' ตอน' : ''}</p>${safeURL(x.source) ? `<a class="source-link" href="${esc(safeURL(x.source))}" target="_blank" rel="noopener noreferrer">${esc(x.provider)} ↗</a>` : ''}</div><button class="primary" data-result="${i}" aria-label="เก็บ ${esc(x.title)}">${items.some(item => item.id === x.id) ? 'ในคลังแล้ว' : '＋ เก็บ'}</button></div>`;
      }).join('') : '<div class="search-start">ไม่พบเรื่องที่ตรงกับ “' + esc(q) + '”<br>ลองชื่อภาษาอังกฤษ ชื่อภาษาไทย หรือเพิ่มข้อมูลเองได้</div>';
      region.querySelectorAll('img').forEach(img => img.onerror = () => retryImage(img));
    } catch (error) {
      if (request !== searchId) return;
      results = [];
      region.innerHTML = '<div class="search-start">เชื่อมต่อแหล่งข้อมูลไม่ได้ในตอนนี้<br><button type="button" class="secondary" id="retry-search">ลองค้นหาอีกครั้ง</button></div>';
      $('retry-search').onclick = search;
    } finally { if (request === searchId) { button.disabled = false; region.setAttribute('aria-busy', 'false'); } }
  }
  function schedule() {
    cancel(); results = [];
    if (composing) return;
    if (input.value.trim().length < 2) { region.innerHTML = '<div class="search-start">พิมพ์อย่างน้อย 2 ตัวอักษร รายชื่อเรื่องจะแสดงอัตโนมัติ</div>'; return; }
    region.innerHTML = '<div class="search-start">กำลังเตรียมรายชื่อเรื่อง…</div>';
    timer = setTimeout(search, 450);
  }
  input.oninput = schedule;
  input.oncompositionstart = () => { composing = true; cancel(); };
  input.oncompositionend = () => { composing = false; schedule(); };
  $('search-kind').onchange = schedule;
  $('search-form').onsubmit = e => { e.preventDefault(); if (active >= 0) pick(active); else search(); };
  input.onkeydown = e => {
    if (e.isComposing || composing || !results.length || !['ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault(); active = e.key === 'ArrowDown' ? (active + 1) % results.length : (active - 1 + results.length) % results.length;
    region.querySelectorAll('[data-suggestion]').forEach((row, i) => row.classList.toggle('suggestion-active', i === active));
    input.setAttribute('aria-activedescendant', `suggestion-${active}`);
    $(`suggestion-${active}`).scrollIntoView({ block: 'nearest' });
  };
  region.onclick = e => { const b = e.target.closest('[data-result]'); if (b) pick(Number(b.dataset.result)); };
  $('search-dialog').addEventListener('close', cancel);
}
