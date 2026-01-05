
const SITE_CONFIG = {
  defaultLang: 'en',
  defaultCurrency: 'USD',
  // Static conversion rates (approx). Update in js/site.js if needed.
  fx: { USD: 1, EUR: 0.92, AED: 3.67 }
};

const I18N = {
  en: {
    brand_name: "Irina Aksenova",
    brand_tagline: "Contemporary Artist",
    nav_work: "Work",
    nav_collections: "Collections",
    nav_about: "About",
    nav_commissions: "Commissions",
    nav_exhibitions: "Exhibitions",
    nav_shop: "Shop",
    nav_contact: "Contact",
    cta_inquire: "Inquire",
    footer_location: "Based in Kazan, Russia.",
    footer_dubai_rep: "Dubai representative available for the Middle East.",
    home_title: "Irina Aksenova — Contemporary Art",
    home_headline: "Contemporary watercolor and pastel works.",
    home_subhead: "Original artworks and commissions for private collectors, art consultants, and hospitality spaces across the Middle East, Europe, and the US.",
    commissions_headline: "Commissioned Works",
    pay_paypal: "Pay with PayPal",
    pay_card: "Pay by card (worldwide)"
    about_title: "Artist bio",
    exh_kicker: "Exhibitions & press",
    exh_title: "Selected highlights",
    exh_note: "A curated selection of public showings. A full exhibition list and portfolio PDF are available upon request.",
    exh_de_1: "Exhibited in group and curated formats (cities and venues available in the full CV).",
    exh_at_1: "Selected showings and cultural events (details in the full CV).",
    exh_ru_1: "Regional and national exhibitions, including presentations connected to Kazan.",
    exh_int_1: "Additional showings and private presentations by request.",
    exh_request_title: "Request press kit",
    exh_request_note: "For galleries, consultants, and interior designers: please request the portfolio PDF, artwork list, and availability.",
    contact_markets_label: "Markets:",
    contact_dubai_label: "Dubai:",
    contact_dubai_text: "Representative available for viewings and logistics support.",
    contact_payments_label: "Payments:",
  },
  ar: {
    brand_name: "إيرينا أكسينوفا",
    brand_tagline: "فنانة معاصرة",
    nav_work: "الأعمال",
    nav_collections: "المجموعات",
    nav_about: "نبذة",
    nav_commissions: "طلبات خاصة",
    nav_exhibitions: "المعارض",
    nav_shop: "المتجر",
    nav_contact: "تواصل",
    cta_inquire: "استفسار",
    footer_location: "مقيمة في قازان، روسيا.",
    footer_dubai_rep: "يوجد ممثل في دبي للشرق الأوسط.",
    home_title: "إيرينا أكسينوفا — فن معاصر",
    home_headline: "أعمال مائية وباستيل بألوان هادئة.",
    home_subhead: "أعمال أصلية وطلبات خاصة لهواة الجمع ومستشاري الفن ومساحات الضيافة في الشرق الأوسط وأوروبا والولايات المتحدة.",
    commissions_headline: "أعمال حسب الطلب",
    pay_paypal: "الدفع عبر باي بال",
    pay_card: "الدفع بالبطاقة (عالميًا)"
  }
};

function getLang(){
  return localStorage.getItem('lang') || SITE_CONFIG.defaultLang;
}
function setLang(lang){
  localStorage.setItem('lang', lang);
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  applyI18n();
  if (typeof renderWork === 'function') renderWork();
  if (typeof renderArtworkPage === 'function') renderArtworkPage();
}
function applyI18n(){
  const lang = getLang();
  const dict = I18N[lang] || I18N.en;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(dict[key]) el.textContent = dict[key];
  });
}

function getCurrency(){
  return localStorage.getItem('currency') || SITE_CONFIG.defaultCurrency;
}
function setCurrency(cur){
  localStorage.setItem('currency', cur);
  // re-render prices if present
  if (typeof renderWork === 'function') renderWork();
  if (typeof renderArtworkPage === 'function') renderArtworkPage();
}
function fmtMoneyUSD(amount, currency){
  const cur = currency || getCurrency();
  const fx = SITE_CONFIG.fx[cur] || 1;
  const value = amount * fx;
  const fmt = new Intl.NumberFormat(getLang()==='ar'?'ar':'en', { style:'currency', currency: cur, maximumFractionDigits: 0 });
  return fmt.format(value);
}

async function loadArtworks(){
  const res = await fetch('data/artworks.json');
  if(!res.ok) throw new Error('Failed to load artworks.json');
  return await res.json();
}

function qs(sel, el=document){ return el.querySelector(sel); }
function qsa(sel, el=document){ return [...el.querySelectorAll(sel)]; }

function fmtAvailability(av){
  const label = av || 'On request';
  return label;
}

function cardHTML(a){
  const badge = `<span class="badge">${fmtAvailability(a.availability)}</span>`;
  const meta = `${a.year} • ${a.medium} • ${a.size_cm}`;
  return `
    <a class="card" href="artwork.html?slug=${encodeURIComponent(a.slug)}" aria-label="${a.title}">
      <div class="thumb" role="img" aria-label="Artwork image" style="background-image:url(${a.image||''});"></div>
      <div class="card-body">
        <p class="title">${a.title}</p>
        <p class="small" style="margin:0 0 10px;">${a.price_usd ? fmtMoneyUSD(a.price_usd) : (a.price || "Price on request")}</p>
        <div class="meta">
          <span>${meta}</span>
          ${badge}
        </div>
      </div>
    </a>
  `;
}

function renderGrid(targetId, items){
  const el = document.getElementById(targetId);
  if(!el) return;
  el.innerHTML = items.map(cardHTML).join('');
}

function unique(arr){ return [...new Set(arr)].filter(Boolean); }

function initFilters(all){
  const fAvail = qs('#filterAvailability');
  const fMedium = qs('#filterMedium');
  const fSize = qs('#filterSize');
  const fYear = qs('#filterYear');
  const fCollection = qs('#filterCollection');

  if(!fAvail) return;

  const avail = unique(all.map(a=>a.availability));
  const mediums = unique(all.map(a=>a.medium));
  const years = unique(all.map(a=>a.year)).sort((a,b)=>b-a);
  const collections = unique(all.map(a=>a.collection));

  function fill(select, values, placeholder){
    select.innerHTML = `<option value="">${placeholder}</option>` + values.map(v=>`<option value="${String(v)}">${String(v)}</option>`).join('');
  }

  fill(fAvail, avail, 'Availability');
  fill(fMedium, mediums, 'Medium');
  fill(fYear, years, 'Year');
  fill(fCollection, collections, 'Collection');

  // Size is a lightweight preset (not derived)
  fSize.innerHTML = `
    <option value="">Size</option>
    <option value="small">Small</option>
    <option value="medium">Medium</option>
    <option value="large">Large</option>
  `;

  function sizeBucket(sizeCm){
    // expects "W × H cm"
    const nums = (sizeCm||'').match(/\d+(\.\d+)?/g);
    if(!nums || nums.length < 2) return 'medium';
    const w = parseFloat(nums[0]), h = parseFloat(nums[1]);
    const area = w*h;
    if(area <= 7000) return 'small';        // ~ < 100x70
    if(area <= 15000) return 'medium';      // ~ < 150x100
    return 'large';
  }

  function apply(){
    const vAvail = fAvail.value;
    const vMedium = fMedium.value;
    const vYear = fYear.value;
    const vCollection = fCollection.value;
    const vSize = fSize.value;

    const filtered = all.filter(a=>{
      if(vAvail && a.availability !== vAvail) return false;
      if(vMedium && a.medium !== vMedium) return false;
      if(vYear && String(a.year) !== String(vYear)) return false;
      if(vCollection && a.collection !== vCollection) return false;
      if(vSize && sizeBucket(a.size_cm) !== vSize) return false;
      return true;
    });

    renderGrid('workGrid', filtered);
    const countEl = qs('#workCount');
    if(countEl) countEl.textContent = `${filtered.length} works`;
  }

  [fAvail,fMedium,fYear,fCollection,fSize].forEach(s=>s.addEventListener('change', apply));
  apply();
}

async function initHome(){
  const grid = document.getElementById('featuredGrid');
  if(!grid) return;
  const all = await loadArtworks();
  renderGrid('featuredGrid', all.slice(0,6));
}

async function initWork(){
  const grid = document.getElementById('workGrid');
  if(!grid) return;
  const all = await loadArtworks();
  initFilters(all);
}

async function initArtwork(){
  const root = document.getElementById('artworkRoot');
  if(!root) return;
  const all = await loadArtworks();
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const a = all.find(x=>x.slug===slug) || all[0];

  qs('#artTitle').textContent = a.title;
  qs('#artMeta').textContent = `${a.year} • ${a.medium}`;
  qs('#artSize').textContent = `${a.size_cm} / ${a.size_in}`;
  qs('#artAvail').textContent = fmtAvailability(a.availability);
  qs('#artPrice').textContent = a.price_usd ? fmtMoneyUSD(a.price_usd) : (a.price || 'Price on request');
  qs('#artNote').textContent = a.hero_note || '';

  
  // Hero image
  const hero = document.getElementById('artHeroImg');
  if(hero){
    hero.style.backgroundImage = `url(${a.image||''})`;
  }
  const gallery = document.getElementById('artGallery');
  if(gallery){
    const imgs = (a.gallery && a.gallery.length ? a.gallery : [a.image]).filter(Boolean);
    gallery.innerHTML = imgs.slice(0,4).map((u,i)=>`<button class="thumb thumb-sm" type="button" aria-label="View image ${i+1}" style="background-image:url(${u});"></button>`).join('');
    gallery.querySelectorAll('button').forEach((btn, idx)=>{
      btn.addEventListener('click', ()=>{
        if(hero) hero.style.backgroundImage = `url(${imgs[idx]})`;
      });
    });
  }

// Pre-fill inquiry subject
  const subj = encodeURIComponent(`Inquiry: ${a.title} (${a.id})`);
  const mail = qs('#inquiryMail');
  if(mail) mail.href = `mailto:studio@example.com?subject=${subj}`;

  // Related works
  const related = all.filter(x=>x.collection===a.collection && x.slug!==a.slug).slice(0,3);
  if(related.length){
    renderGrid('relatedGrid', related);
  }else{
    const el = document.getElementById('relatedSection');
    if(el) el.style.display = 'none';
  }
}

function markActiveNav(){
  const path = location.pathname.split('/').pop() || 'index.html';
  qsa('.menu a').forEach(a=>{
    const href = a.getAttribute('href');
    if(href === path) a.classList.add('active');
  });
}

document.addEventListener('DOMContentLoaded', async ()=>{
  markActiveNav();
  try{
    await initHome();
    await initWork();
    await initArtwork();
  }catch(e){
    console.error(e);
  }
});



function initGlobalToggles(){
  // Initial lang/dir
  const lang = getLang();
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  applyI18n();
  if (typeof renderWork === 'function') renderWork();
  if (typeof renderArtworkPage === 'function') renderArtworkPage();

  const langBtn = document.getElementById('langToggle');
  if(langBtn){
    langBtn.addEventListener('click', ()=>{
      const next = getLang()==='en' ? 'ar' : 'en';
      setLang(next);
    });
  }

  const curSel = document.getElementById('currencySelect');
  if(curSel){
    curSel.value = getCurrency();
    curSel.addEventListener('change', ()=> setCurrency(curSel.value));
  }
}

document.addEventListener('DOMContentLoaded', initGlobalToggles);


async function renderWork(){ try{ await initWork(); }catch(e){ console.error(e);} }
async function renderArtworkPage(){ try{ await initArtwork(); }catch(e){ console.error(e);} }
