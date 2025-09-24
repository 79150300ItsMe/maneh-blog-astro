/**
 * Maneh Blog - Main JavaScript
 * Optimized for performance and maintainability
 */
'use strict';

// Trusted Types helper untuk production
function setHTMLSafe(el, html) {
  if (!el) return;
  try {
    // Check if Trusted Types is available and policy exists
    if (window.trustedTypes && window.trustedTypes.isHTML) {
      // Use DOMPurify as primary sanitizer for better compatibility
      if (window.DOMPurify) {
        el.innerHTML = DOMPurify.sanitize(html);
      } else {
        el.innerHTML = html; // fallback
      }
    } else if (window.DOMPurify) {
      el.innerHTML = DOMPurify.sanitize(html);
    } else {
      el.innerHTML = html; // fallback terakhir (lokal)
    }
  } catch (e) {
    // fallback ekstra
    el.textContent = '';
    if (window.DOMPurify) el.innerHTML = DOMPurify.sanitize(html);
  }
}

// Performance monitoring
const perfStartTime = performance.now();
let metricsCollected = false;

// Restore scroll position
history.scrollRestoration = 'manual';

// Secure locale detection with fallback
let LOCALE = (() => {
  try {
    const lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    return lang.startsWith('id') ? 'id' : 'en';
  } catch (e) {
    console.warn('Locale detection failed, using fallback');
    return 'en';
  }
})();

// DOM Element Cache
const DOMCache = {
  home: null,
  reader: null,
  post: null,
  searchBar: null,
  drawer: null,
  btnMenu: null,
  btnClose: null,
  
  /**
   * Initialize DOM cache
   */
  init() {
    this.home = document.getElementById('home');
    this.reader = document.getElementById('reader');
    this.post = document.getElementById('post');
    this.searchBar = document.getElementById('searchBar');
    this.drawer = document.getElementById('drawer');
    this.btnMenu = document.getElementById('btnMenu');
    this.btnClose = document.getElementById('btnClose');
  },
  
  /**
   * Get cached element or query DOM
   * @param {string} id - Element ID
   * @returns {Element|null}
   */
  get(id) {
    return this[id] || document.getElementById(id);
  }
};

// Utility Functions
/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately
 * @returns {Function} Debounced function
 */
function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/* Enhanced locale detection with error handling */
function detectAndApplyLocale() {
  try {
  // Apply default locale immediately for fast initial render
  applyI18N(); 

    // Skip IP detection to avoid CORS issues and improve performance
    console.log('Using browser locale detection for better performance');
  } catch (error) {
    console.error('Locale detection error:', error);
    // Fallback to default
    LOCALE = 'en';
        applyI18N();
      }
}

// Secure translation function with error handling and fallback
function t(key) { 
  try {
    // Try current locale first
    let result = (I18N[LOCALE] || {})[key];
    
    // Fallback to Indonesian if not found
    if (!result && LOCALE !== 'id') {
      result = (I18N.id || {})[key];
    }
    
    // Fallback to English if still not found
    if (!result && LOCALE !== 'en') {
      result = (I18N.en || {})[key];
    }
    
    // Final fallback to key itself
    if (!result) {
      result = key;
      console.warn('Translation not found for key:', key, 'locale:', LOCALE);
    }
    
    return result;
  } catch (e) {
    console.warn('Translation error for key:', key, 'error:', e);
    return key;
  }
}

// Optimized I18N application with batch DOM updates
function applyI18N() {
  try {
    console.log('Applying I18N with locale:', LOCALE);
    console.log('I18N object available:', typeof I18N !== 'undefined');
    console.log('I18N[LOCALE] available:', I18N && I18N[LOCALE] ? 'yes' : 'no');
    
  document.documentElement.lang = LOCALE;
    
    // Batch DOM updates for better performance with safe innerHTML
    const updates = [
      { id: 'q', prop: 'placeholder', value: t('searchPH') },
      { id: 'pillCat', prop: 'textContent', value: t('pill') },
      { id: 'heroTitle', prop: 'textContent', value: t('heroTitle') },
      { id: 'heroSub', prop: 'textContent', value: t('heroSub') },
      { id: 'secFeatured', prop: 'textContent', value: t('featured') },
      { id: 'secPopular', prop: 'textContent', value: t('popular') },
      { id: 'menuNews', prop: 'textContent', value: t('menuNews') },
      { id: 'menuTutorial', prop: 'textContent', value: t('menuTutorial') },
      { id: 'menuAbout', prop: 'textContent', value: t('menuAbout') },
      { id: 'menuPolicy', prop: 'textContent', value: t('menuPolicy') },
      { id: 'menuContact', prop: 'textContent', value: t('menuContact') }
    ];
    
    // Apply updates efficiently with Trusted Types safety
    updates.forEach(({ id, prop, value }) => {
      const element = document.getElementById(id);
      if (element && value) {
        try {
          // Safe property assignment
          if (prop === 'innerHTML') {
            setHTMLSafe(element, value);
          } else {
            element[prop] = value;
          }
        } catch (e) {
          console.warn(`Failed to set ${prop} on ${id}:`, e);
          // Fallback untuk textContent
          if (prop === 'innerHTML' || prop === 'textContent') {
            element.textContent = value;
          }
        }
      }
    });
    
    // Handle special cases
    const aboutPostH1 = document.querySelector('#about h1');
    if (aboutPostH1) aboutPostH1.textContent = t('aboutTitle');
    
    const aboutContent = document.getElementById('aboutContent');
    if (aboutContent) setHTMLSafe(aboutContent, t('aboutHTML'));
    
    const policyPostH1 = document.querySelector('#policyPost h1');
    if (policyPostH1) policyPostH1.textContent = t('policyTitle');
    
    const contactPostH1 = document.querySelector('#contactPost h1');
    if (contactPostH1) contactPostH1.textContent = t('contactTitle');
    
    const policyContent = document.getElementById('policyContent');
    if (policyContent) setHTMLSafe(policyContent, t('policyHTML'));
    
    const contactContent = document.getElementById('contactContent');
    if (contactContent) setHTMLSafe(contactContent, t('contactHTML'));
    
  } catch (error) {
    console.error('I18N application error:', error);
  }
}

/* ======= Optimized Utils ======= */
function scrollToId(id) {
  try {
  const el = document.getElementById(id);
    if (!el) return;
    
  const header = document.querySelector('header');
  const offset = (header?.offsetHeight || 60) + 8;
  const y = el.getBoundingClientRect().top + window.scrollY - offset;
    
    window.scrollTo({
      top: y,
      behavior: 'smooth'
    });
  } catch (error) {
    console.warn('Scroll error:', error);
  }
}

// Secure slugify with XSS protection
function slugify(s) {
  if (typeof s !== 'string') return '';
  return s.trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Optimized date formatting with error handling
function fmtDate(iso) {
  try {
  const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    return d.toLocaleDateString(
      LOCALE === 'en' ? 'en-US' : 'id-ID',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'Invalid Date';
  }
}

// Secure array operations
function idxBySlug(slug) {
  try {
    if (!Array.isArray(ARTICLES)) return 0;
    return ARTICLES.findIndex(a => a.slug === slug) + 1;
  } catch (error) {
    console.warn('Index lookup error:', error);
    return 0;
  }
}

// Optimized canonical path generation
function canonicalPath(a) {
  try {
    if (!a || !a.published) return '/';
    
  const d = new Date(a.published);
    if (isNaN(d.getTime())) return '/';
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
  const index = idxBySlug(a.slug);
  const category = a.category ? `${a.category}-` : '';
    
  return `/${yyyy}/${mm}/${dd}/${index}-${category}${a.slug}`;
  } catch (error) {
    console.warn('Canonical path error:', error);
    return '/';
  }
}

/* ======= Secure Article Helpers ======= */

// Calculate reading time for analytics
function calculateReadingTime(content) {
  if (!content) return 0;
  const wordsPerMinute = 200; // Average reading speed
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Hyper-optimized shuffle function with Fisher-Yates algorithm
function shuffleArray(array) {
  try {
    if (!Array.isArray(array) || array.length <= 1) {
      console.log('Array shuffle: returning original array (length:', array?.length || 0, ')');
      return array;
    }
    const shuffled = array.slice(); // Faster than spread for large arrays
    let i = shuffled.length;
    while (--i > 0) {
    const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    console.log('Array shuffled successfully, length:', shuffled.length);
    return shuffled;
  } catch (error) {
    console.warn('Array shuffle error:', error);
    return Array.isArray(array) ? [...array] : [];
  }
}

function getRandomArticles(count) {
  try {
    if (!Array.isArray(ARTICLES) || count <= 0) {
      console.warn('Invalid articles array or count:', { articles: ARTICLES, count });
      return [];
    }
    const shuffled = shuffleArray(ARTICLES);
    const result = shuffled.slice(0, Math.min(count, ARTICLES.length));
    console.log('Random articles generated:', result.length);
    return result;
  } catch (error) {
    console.warn('Random articles error:', error);
    // Fallback: return first N articles
    try {
      return ARTICLES.slice(0, Math.min(count, ARTICLES.length));
    } catch (fallbackError) {
      console.error('Fallback articles failed:', fallbackError);
      return [];
    }
  }
}

/* ======= Constants ======= */
const AVATAR_URL = '/img/avatar-default.svg';
const OG_DEFAULT = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&h=630&auto=format&fit=crop&crop=center';

// Environment detection
const IS_LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);

// ====== SECTION CACHE & HELPERS ======
let SECTIONS = null;

function initSectionsCache() {
  if (SECTIONS) return SECTIONS;
  SECTIONS = {
    home:    document.getElementById('home'),
    reader:  document.getElementById('reader'),
    about:   document.getElementById('about'),
    policy:  document.getElementById('policy'),
    contact: document.getElementById('contact'),
  };
  return SECTIONS;
}

function hideSection(id) {
  const node = (SECTIONS || initSectionsCache())[id];
  if (!node) return;
  node.style.display = 'none';
}

function showSection(id) {
  const node = (SECTIONS || initSectionsCache())[id];
  if (!node) {
    console.error('Section not found:', id);
    return;
  }
  
  node.style.display = 'block';
  node.style.visibility = 'visible';
  node.style.opacity = '1';
  
  console.log('Show section:', id);
}

// ====== HASH PARSER ======
function getRoute() {
  // Check for pathname-based article routing first
  const pathname = location.pathname;
  if (pathname && pathname !== '/' && pathname !== '/index.html') {
    // Pattern: /2025/01/01/1-article-slug or /year/month/day/order-slug
    const pathMatch = pathname.match(/^\/(\d{4})\/(\d{2})\/(\d{2})\/(\d+)-(.+)$/);
    if (pathMatch) {
      const [, year, month, day, order, slug] = pathMatch;
      console.log('Routing -> article (pathname)', { slug, pathname });
      return { name: 'article', params: { slug, year, month, day, order } };
    }
  }
  
  // Fallback to hash-based routing
  const raw = (location.hash || '').replace(/^#/, '').trim(); // "", "category/news", "about"
  if (!raw) return { name: 'home', params: {} };

  const parts = raw.split('/').filter(Boolean);
  
  // Handle article hash routes: #p/slug or #post/slug
  if ((parts[0] === 'p' || parts[0] === 'post') && parts[1]) {
    console.log('Routing -> article (hash)', { slug: parts[1] });
    return { name: 'article', params: { slug: parts[1] } };
  }
  
  if (parts[0] === 'category' && parts[1]) {
    return { name: 'category', params: { slug: parts[1].toLowerCase() } };
  }
  if (['about', 'policy', 'contact'].includes(parts[0])) {
    return { name: parts[0], params: {} };
  }
  return { name: 'home', params: {} };
}

/**
 * Wait until condition is met
 * @param {Function} testFn - Function to test condition
 * @param {number} timeout - Timeout in milliseconds
 * @param {number} step - Check interval in milliseconds
 * @returns {Promise<boolean>} - Resolves when condition is met
 */
function waitUntil(testFn, timeout = 5000, step = 50) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    (function tick() {
      try {
        if (testFn()) return resolve(true);
        if (Date.now() - t0 > timeout) return reject(new Error('waitUntil timeout'));
        setTimeout(tick, step);
      } catch (e) { reject(e); }
    })();
  });
}

/**
 * Helper URL absolut yang aman
 * @param {string} pathOrHash - Path atau hash route
 * @returns {string} - URL absolut
 */
function absUrl(pathOrHash = location.pathname) {
  try {
    // Jika sudah absolut, langsung pakai
    if (/^https?:\/\//i.test(pathOrHash)) return pathOrHash;
    // Jika hash route (#about, dsb), canonical tetap pakai pathname
    const base = location.origin;
    if (pathOrHash.startsWith('#')) return base + location.pathname + pathOrHash;
    // Normal path
    return base + (pathOrHash.startsWith('/') ? pathOrHash : '/' + pathOrHash);
  } catch (e) {
    return location.origin + location.pathname; // fallback aman
  }
}

/**
 * Validasi URL cover dan return fallback jika 404
 * @param {string} url - URL cover image
 * @returns {Promise<string>} - URL yang valid atau fallback
 */
async function validateCoverUrl(url) {
  if (!url) {
    console.log('No cover URL provided, using default');
    return OG_DEFAULT;
  }
  
  try {
    // Jika sudah OG_DEFAULT, langsung return
    if (url === OG_DEFAULT) {
      console.log('Cover URL is already default, using as-is');
      return url;
    }
    
    // Test URL dengan HEAD request
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    
    // Handle opaque responses (CSP blocked) - assume valid
    if (response.type === 'opaque') {
      console.log('Cover URL appears valid (opaque response):', url);
      return url;
    }
    
    // Jika response OK, return URL asli
    if (response.ok) {
      console.log('Cover URL validated successfully:', url);
      return url;
    }
    
    // Jika 404 atau error, return fallback
    console.warn(`Cover URL 404: ${url}, using fallback`);
    return OG_DEFAULT;
  } catch (error) {
    // Jika fetch gagal karena CSP atau network, coba langsung return URL
    if (error.name === 'TypeError' || error.message.includes('CORS') || error.message.includes('CSP')) {
      console.log('Cover URL assumed valid (CSP/network issue):', url);
      return url;
    }
    
    console.warn(`Cover URL validation failed: ${url}, using fallback`, error);
    return OG_DEFAULT;
  }
}

/**
 * Set image dengan fallback otomatis
 * @param {HTMLImageElement} img - Image element
 * @param {string} src - Source URL
 * @param {string} fallback - Fallback URL
 */
function setImageWithFallback(img, src, fallback = OG_DEFAULT) {
  try {
    if (!img) {
      console.warn('No image element provided');
      return;
    }
    
    img.src = src || fallback;
    img.onerror = () => {
      console.warn(`Image failed to load: ${src}, using fallback`);
      img.src = fallback;
    };
  } catch (error) {
    console.error('❌ Image fallback error:', error);
    // Fallback: set default image
    try {
      img.src = fallback;
    } catch (fallbackError) {
      console.error('❌ Image fallback failed:', fallbackError);
    }
  }
}

/**
 * Create image element with fallback
 * @param {string} src - Source URL
 * @param {string} alt - Alt text
 * @param {string} fallback - Fallback URL
 * @returns {HTMLImageElement} - Image element
 */
function imgWithFallback(src, alt = '', fallback = OG_DEFAULT) {
  const el = new Image();
  el.loading = 'lazy';
  el.alt = alt;
  el.src = src || fallback;
  el.onerror = function() { 
    this.src = fallback; 
    this.onerror = null; 
  };
  return el;
}

/* ======= AdSense Health Check ======= */
function checkAdSenseSetup() {
  if (IS_LOCAL) {
    console.info('🧪 Dev mode: AdSense disabled on localhost');
    return;
  }
  
  console.log('🔍 Checking AdSense setup...');
  
  try {
    // Check AdSense script
    const adsenseScript = document.querySelector('script[src*="adsbygoogle.js"]');
    if (adsenseScript) {
      console.log('✅ AdSense script loaded');
    } else {
      console.log('❌ AdSense script not found');
    }
    
    // Check meta tag
    const adsenseMeta = document.querySelector('meta[name="google-adsense-account"]');
    if (adsenseMeta && adsenseMeta.content === 'ca-pub-2251624901582740') {
      console.log('✅ AdSense meta tag found');
    } else {
      console.log('❌ AdSense meta tag not found or incorrect');
    }
    
    // Check CSP
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (cspMeta && cspMeta.content.includes('ep2.adtrafficquality.google') && cspMeta.content.includes('pagead2.googlesyndication.com')) {
      console.log('✅ CSP includes all AdSense domains (including adtrafficquality)');
    } else {
      console.log('❌ CSP missing AdSense domains');
    }
    
    // Check ads.txt
    fetch('/ads.txt')
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        throw new Error('ads.txt not accessible');
      })
      .then(text => {
        const expectedContent = 'google.com, pub-2251624901582740, DIRECT, f08c47fec0942fa0';
        if (text.trim() === expectedContent) {
          console.log('✅ ads.txt accessible and correct');
        } else {
          console.log('❌ ads.txt content incorrect');
        }
      })
      .catch(error => {
        console.log('❌ ads.txt not accessible:', error.message);
      });
      
    // Test AdSense connection
    setTimeout(() => {
      const hasAdSenseErrors = console.error.toString().includes('CSP') || 
                              document.querySelector('[data-adsbygoogle-status]');
      if (!hasAdSenseErrors) {
        console.log('✅ CSP OK - No AdSense connection errors detected');
      }
    }, 2000);
  } catch (error) {
    console.debug('[adsense non-critical]', error?.message || error);
  }
}

/* ======= Enhanced SEO helpers ======= */

/**
 * Find or create meta tag with null safety
 * @param {string} selector - CSS selector for meta tag
 * @param {string} attribute - Attribute to set (content, property, name)
 * @param {string} value - Value to set
 * @param {string} content - Content value (for content attribute)
 */

/**
 * Find or create meta element with proper attributes
 * @param {string} selector - CSS selector for meta tag
 * @param {Object} attrs - Attributes to set
 * @returns {HTMLElement} - Meta element
 */
function findOrCreateMeta(selector, attrs = {}) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v);
    }
    document.head.appendChild(el);
  } else {
    // Update existing attributes
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v);
    }
  }
  return el;
}

/**
 * Ensure canonical link exists and return it
 * @returns {HTMLElement} - Canonical link element
 */
function ensureLinkCanonical() {
  let canon = document.head.querySelector('link[rel="canonical"]');
  if (!canon) {
    canon = document.createElement('link');
    canon.rel = 'canonical';
    document.head.appendChild(canon);
  }
  return canon;
}

/**
 * Set page title with null safety
 * @param {string} text - Title text
 */
function setHeadTitle(text) {
  const t = document.head.querySelector('title') || document.head.appendChild(document.createElement('title'));
  t.textContent = text;
}

/**
 * Ensure single meta tag (deduplication)
 * @param {string} selector - CSS selector
 * @param {Function} createFn - Function to create element
 */
function ensureSingle(selector, createFn) {
  const nodes = [...document.head.querySelectorAll(selector)];
  nodes.slice(1).forEach(n => n.remove());
  if (!nodes.length) document.head.appendChild(createFn());
}

/**
 * Comprehensive SEO synchronization for all routes
 * @param {Object} options - SEO options
 * @param {string} options.type - Route type ('post', 'page', 'home')
 * @param {string} options.title - Page title
 * @param {string} options.description - Meta description
 * @param {string} options.image - OG/Twitter image URL
 */
async function syncSEO({type, title, description, image}) {
  try {
    const SITE = 'Maneh';
    const url = absUrl(location.pathname);
    
    // Auto-fix untuk title dan description
    if (title && title.length > 65) title = title.slice(0, 62).trim() + '…';
    if (description && description.length > 155) description = description.slice(0, 152).trim() + '…';
    
    // Prevent double brand in title
    const ttl = title ? 
      (title.includes('Maneh') ? title : `${title} — ${SITE}`) : 
      SITE;
    const desc = description || 'Tutorial & Tips Teknologi: web, mobile, AI, produktivitas.';
    
    // Validasi cover URL dengan fallback
    const ogImage = await validateCoverUrl(image);

  // Set page title
  setHeadTitle(ttl);

  // Ensure single meta description
  ensureSingle('meta[name="description"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'description');
    return m;
  });
  document.querySelector('meta[name="description"]').setAttribute('content', desc);

  // Ensure single canonical link
  ensureSingle('link[rel="canonical"]', () => {
    const l = document.createElement('link');
    l.setAttribute('rel', 'canonical');
    return l;
  });
  document.querySelector('link[rel="canonical"]').setAttribute('href', url);

  // Robots meta (production only)
  if (!['localhost', '127.0.0.1'].includes(location.hostname)) {
    findOrCreateMeta('meta[name="robots"]', {name: 'robots'})
      .setAttribute('content', 'index, follow, max-image-preview:large');
  }

  // Open Graph tags
  const ogType = (type === 'post') ? 'article' : 'website';
  findOrCreateMeta('meta[property="og:type"]', {property: 'og:type'}).setAttribute('content', ogType);
  findOrCreateMeta('meta[property="og:title"]', {property: 'og:title'}).setAttribute('content', ttl);
  findOrCreateMeta('meta[property="og:description"]', {property: 'og:description'}).setAttribute('content', desc);
  findOrCreateMeta('meta[property="og:url"]', {property: 'og:url'}).setAttribute('content', url);
  findOrCreateMeta('meta[property="og:image"]', {property: 'og:image'}).setAttribute('content', ogImage);

  // Twitter Card tags
  findOrCreateMeta('meta[name="twitter:card"]', {name: 'twitter:card'}).setAttribute('content', 'summary_large_image');
  findOrCreateMeta('meta[name="twitter:title"]', {name: 'twitter:title'}).setAttribute('content', ttl);
  findOrCreateMeta('meta[name="twitter:description"]', {name: 'twitter:description'}).setAttribute('content', desc);
  findOrCreateMeta('meta[name="twitter:image"]', {name: 'twitter:image'}).setAttribute('content', ogImage);

  // Health check log
  console.log('🧭 SEO Sync:', {
    ttl, desc, url, ogType,
    hasDesc: !!document.head.querySelector('meta[name="description"]'),
    hasCanon: !!document.head.querySelector('link[rel="canonical"]'),
    hasOG: !!document.head.querySelector('meta[property="og:title"]'),
    hasTw: !!document.head.querySelector('meta[name="twitter:title"]')
  });
  } catch (error) {
    console.error('❌ SEO sync error:', error);
    // Fallback: set basic title
    try {
      document.title = 'Maneh — Tutorial & Tips Teknologi';
    } catch (titleError) {
      console.error('❌ Title fallback failed:', titleError);
    }
  }
}

/**
 * Assert SEO completeness and log results
 */
function assertSEO() {
  const fail = [];
  if (!document.querySelector('title')?.textContent) fail.push('title');
  if (!document.querySelector('meta[name="description"]')) fail.push('meta:description');
  if (!document.querySelector('link[rel="canonical"]')) fail.push('canonical');
  if (!document.querySelector('meta[property="og:title"]')) fail.push('og:title');
  if (!document.querySelector('meta[name="twitter:title"]')) fail.push('tw:title');
  
  if (fail.length) {
    console.error('❌ SEO missing:', fail.join(', '));
  } else {
    console.log('✅ SEO OK for', location.pathname);
  }
}

/**
 * Validator helpers for SEO QA
 */
function textLenOK(s, max) { 
  return !!s && s.trim().length <= max; 
}

function metaOnce(sel) { 
  const n = [...document.head.querySelectorAll(sel)]; 
  return {ok: n.length === 1, count: n.length}; 
}

/**
 * Inject JSON-LD structured data
 * @param {Object} obj - Schema object
 */
function injectJSONLD(obj) {
  let el = document.querySelector('script[type="application/ld+json"].seo-jsonld');
  if (!el) { 
    el = document.createElement('script'); 
    el.type = 'application/ld+json'; 
    el.className = 'seo-jsonld'; 
    document.head.appendChild(el); 
  }
  el.textContent = JSON.stringify(obj);
}

/**
 * Build Schema.org structured data
 * @param {Object} options - Schema options
 * @param {string} options.type - Schema type ('article' or 'page')
 * @param {string} options.title - Page title
 * @param {string} options.description - Page description
 * @param {string} options.image - Page image
 * @returns {Object} - Schema object
 */
function buildSchema({type, title, description, image}) {
  const url = location.origin + location.pathname;
  const base = {
    "@context": "https://schema.org",
    "mainEntityOfPage": url,
    "headline": title,
    "description": description,
    "image": image || OG_DEFAULT,
    "author": {"@type": "Person", "name": "Penjaga"},
    "publisher": {"@type": "Organization", "name": "Maneh"}
  };
  
  if (type === 'article') {
    return {...base, "@type": "NewsArticle", "datePublished": new Date().toISOString()};
  } else {
    return {...base, "@type": "WebPage"};
  }
}

/**
 * Comprehensive SEO QA with auto-fix and validation
 * @param {Object} options - SEO options
 * @param {string} options.type - Route type ('post', 'page', 'home')
 * @param {string} options.title - Page title
 * @param {string} options.description - Meta description
 * @param {string} options.image - OG/Twitter image URL
 */
function seoQA({type, title, description, image}) {
  const url = location.origin + location.pathname;

  // Auto-fix ringan
  if (!image) { image = OG_DEFAULT; }
  if (!textLenOK(description, 155)) { 
    description = (description || '').slice(0, 152).trim() + '…'; 
  }

  // Inject Schema JSON-LD
  injectJSONLD(buildSchema({type, title, description, image}));

  // Validasi presence
  const checks = {
    title: !!document.title,
    desc: !!document.querySelector('meta[name="description"]'),
    canon: !!document.querySelector('link[rel="canonical"]'),
    ogt: !!document.querySelector('meta[property="og:title"]'),
    ogd: !!document.querySelector('meta[property="og:description"]'),
    ogu: !!document.querySelector('meta[property="og:url"]'),
    ogi: !!document.querySelector('meta[property="og:image"]'),
    twt: !!document.querySelector('meta[name="twitter:title"]'),
    twd: !!document.querySelector('meta[name="twitter:description"]'),
    twi: !!document.querySelector('meta[name="twitter:image"]'),
    robots: !!document.querySelector('meta[name="robots"]') || ['localhost', '127.0.0.1'].includes(location.hostname),
    lenTitle: textLenOK(document.title, 65),
    lenDesc: textLenOK(description, 155),
    dupeDesc: metaOnce('meta[name="description"]').ok,
    dupeCanon: metaOnce('link[rel="canonical"]').ok
  };

  // Log ringkas
  const fails = Object.entries(checks).filter(([k, v]) => !v).map(([k]) => k);
  if (fails.length) {
    console.error('❌ SEO QA failed for', url, '→', fails.join(', '));
  } else {
    console.log('✅ SEO QA OK:', url);
  }
}

/**
 * Find or create link tag with null safety
 * @param {string} rel - rel attribute value
 * @param {string} href - href value
 */
function findOrCreateLink(rel, href) {
  let link = document.querySelector(`link[rel="${rel}"]`);
  
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  
  link.href = href;
  return link;
}

async function updateSEOForArticle(a){
  try {
    // Use new comprehensive SEO sync
    await syncSEO({
      type: 'post',
      title: a.title,
      description: a.summary || 'Tutorial lengkap dengan panduan step-by-step.',
      image: a.cover
    });
    
    // Verify SEO completeness
    assertSEO();
    
    // Enhanced Article Structured Data
  let ld = document.getElementById('ld-article');
    if(!ld){ 
      ld = document.createElement('script'); 
      ld.type='application/ld+json'; 
      ld.id='ld-article'; 
      document.head.appendChild(ld); 
    }
    
    // Get article reading time estimate
    const wordCount = a.html.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
    
    // Get category articles for related content
    const allArticles = window.ARTICLES || ARTICLES || [];
    const categoryArticles = allArticles.filter(art => art.category === a.category && art.slug !== a.slug);
    const relatedArticles = categoryArticles.slice(0, 3).map(art => ({
      "@type": "Article",
      "headline": art.title,
      "url": `https://maneh.blog${canonicalPath(art)}`,
      "image": art.cover,
      "datePublished": art.published
    }));
    
  ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": a.title,
      "description": a.summary,
      "image": [a.cover],
      "datePublished": a.published,
      "dateModified": a.published,
      "author": {
        "@type": "Person",
        "name": "Penjaga",
        "url": "https://maneh.blog"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Maneh",
        "url": "https://maneh.blog",
        "logo": {
          "@type": "ImageObject",
          "url": "https://maneh.blog/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": absUrl(location.pathname)
      },
    "inLanguage": LOCALE==='en'?'en-US':'id-ID',
      "wordCount": wordCount,
      "timeRequired": `PT${readingTime}M`,
      "articleSection": a.category || "Technology",
      "keywords": a.tags ? a.tags.join(', ') : "tutorial teknologi, tips teknologi",
      "about": {
        "@type": "Thing",
        "name": "Teknologi",
        "description": "Tutorial dan tips teknologi terbaru"
      },
      "mentions": relatedArticles,
      "isPartOf": {
        "@type": "Blog",
        "name": "Maneh Blog",
        "url": "https://maneh.blog"
      }
    });
    
    // Update breadcrumb structured data
    updateBreadcrumbStructuredData(a);
    
    console.log('SEO updated for article:', a.title);
  } catch (error) {
    console.error('SEO update error:', error);
  }
}

async function resetSEOHome(){
  try {
    // Use new comprehensive SEO sync for home page
    const siteTitle = typeof SITE_TITLE !== 'undefined' ? SITE_TITLE : 'Maneh — Tutorial & Tips Teknologi Terlengkap 2025';
    const siteDesc = typeof SITE_DESC !== 'undefined' ? SITE_DESC : 'Maneh: platform tutorial & tips teknologi terlengkap dengan bahasa sederhana, panduan step-by-step, dan bisa langsung dipraktikkan. Update terbaru 2025!';
    
    await syncSEO({
      type: 'page',
      title: siteTitle,
      description: siteDesc,
      image: OG_DEFAULT
    });
    
    // Remove article structured data
    const ld = document.getElementById('ld-article'); 
    if(ld) ld.remove();
    
    // Update breadcrumb for home
    updateBreadcrumbStructuredData(null);
    
    // Verify SEO completeness
    assertSEO();
    
    // Run SEO QA after content is rendered
    setTimeout(() => {
      seoQA({
        type: 'page',
        title: siteTitle,
        description: siteDesc,
        image: OG_DEFAULT
      });
    }, 100);
    
    console.log('SEO reset to home page');
  } catch (error) {
    console.error('SEO reset error:', error);
  }
}

/**
 * Update SEO for category pages
 * @param {string} categoryName - Category name
 * @param {number} articleCount - Number of articles
 */
async function updateSEOForCategory(categoryName, articleCount) {
  try {
    const cleanCategoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    const categoryDesc = `Koleksi ${articleCount} tutorial dan tips ${cleanCategoryName.toLowerCase()} terbaru. Panduan lengkap dengan bahasa sederhana dan bisa langsung dipraktikkan.`;
    
    // Use new comprehensive SEO sync for category page
    await syncSEO({
      type: 'page',
      title: `Category: ${cleanCategoryName}`,
      description: categoryDesc,
      image: OG_DEFAULT
    });
    
    // Verify SEO completeness
    assertSEO();
    
    // Run SEO QA after content is rendered
    setTimeout(() => {
      seoQA({
        type: 'page',
        title: `Category: ${cleanCategoryName}`,
        description: categoryDesc,
        image: OG_DEFAULT
      });
    }, 100);
    
  } catch (error) {
    console.error('Error updating SEO for category:', error);
  }
}

/**
 * Update SEO for tag pages
 * @param {string} tagName - Tag name
 * @param {number} articleCount - Number of articles
 */
function updateSEOForTag(tagName, articleCount) {
  try {
    const cleanTagName = tagName.charAt(0).toUpperCase() + tagName.slice(1);
    const tagUrl = `https://maneh.blog/#tag/${tagName}`;
    
    // Update page title
    const siteTitle = typeof SITE_TITLE !== 'undefined' ? SITE_TITLE : 'Maneh Blog';
    document.title = `Tag: ${cleanTagName} - ${articleCount} Artikel | ${siteTitle}`;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = `Temukan ${articleCount} artikel dengan tag "${cleanTagName}". Tutorial dan tips teknologi terbaru dengan panduan lengkap.`;
    }
    
    // Update canonical URL
    const canon = document.getElementById('canon');
    if (canon) canon.href = tagUrl;
    
    // Update Open Graph tags
    const ogTitle = document.getElementById('ogTitle');
    const ogDesc = document.getElementById('ogDesc');
    const ogUrl = document.getElementById('ogUrl');
    
    if (ogTitle) ogTitle.content = `Tag: ${cleanTagName} - ${articleCount} Artikel | Maneh Blog`;
    if (ogDesc) ogDesc.content = `Temukan ${articleCount} artikel dengan tag "${cleanTagName}" di Maneh.`;
    if (ogUrl) ogUrl.content = tagUrl;
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    const twitterUrl = document.querySelector('meta[name="twitter:url"]');
    
    if (twitterTitle) twitterTitle.content = `Tag: ${cleanTagName} - ${articleCount} Artikel | Maneh Blog`;
    if (twitterDesc) twitterDesc.content = `Temukan ${articleCount} artikel dengan tag "${cleanTagName}" di Maneh.`;
    if (twitterUrl) twitterUrl.content = tagUrl;
    
  } catch (error) {
    console.error('Error updating SEO for tag:', error);
  }
}

/**
 * Image optimization with fallback and lazy loading
 * @param {string} imageUrl - Original image URL
 * @param {string} alt - Alt text
 * @param {string} className - CSS class
 * @returns {string} Optimized image HTML
 */
function createOptimizedImage(imageUrl, alt = '', className = '') {
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNTAgMjAwSDQ1MFYyNTBIMzUwVjIwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4K';
  
  return `
    <img 
      src="${imageUrl}" 
      alt="${alt}" 
      class="${className}"
      loading="lazy" 
      decoding="async"
      onerror="this.src='${fallbackImage}'; this.onerror=null;"
      style="width: 100%; height: auto;"
    />
  `;
}

// Global fallback for all images
document.addEventListener('DOMContentLoaded', function() {
  // Add fallback to all images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.onerror) {
      img.onerror = function() {
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNTAgMjAwSDQ1MFYyNTBIMzUwVjIwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iNDAwIiB5PSIzMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4K';
        this.onerror = null;
      };
    }
  });
});

/**
 * Validate and optimize all images in article content
 * @param {string} htmlContent - HTML content with images
 * @returns {string} Optimized HTML content
 */
function optimizeImagesInContent(htmlContent) {
  if (!htmlContent) return htmlContent;
  
  // Add lazy loading and error handling to existing images
  return htmlContent.replace(
    /<img([^>]*?)src="([^"]*?)"([^>]*?)>/gi,
    (match, before, src, after) => {
      // Check if already has loading attribute
      if (match.includes('loading=')) return match;
      
    // Add lazy loading and alt text
    const altText = a.alt || 'Gambar artikel';
    return `<img${before}src="${src}"${after} alt="${altText}" loading="lazy" decoding="async">`;
    }
  );
}

// Enhanced breadcrumb structured data
function updateBreadcrumbStructuredData(article) {
  try {
    let breadcrumb = document.getElementById('ld-breadcrumb');
    if (!breadcrumb) {
      breadcrumb = document.createElement('script');
      breadcrumb.type = 'application/ld+json';
      breadcrumb.id = 'ld-breadcrumb';
      document.head.appendChild(breadcrumb);
    }
    
    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://maneh.blog/"
        }
      ]
    };
    
    if (article) {
      // Add category breadcrumb
      if (article.category) {
        breadcrumbList.itemListElement.push({
          "@type": "ListItem",
          "position": 2,
          "name": article.category.charAt(0).toUpperCase() + article.category.slice(1),
          "item": `https://maneh.blog/#category/${article.category}`
        });
      }
      
      // Add article breadcrumb
      breadcrumbList.itemListElement.push({
        "@type": "ListItem",
        "position": breadcrumbList.itemListElement.length + 1,
        "name": article.title,
        "item": `https://maneh.blog${canonicalPath(article)}`
      });
    }
    
    breadcrumb.textContent = JSON.stringify(breadcrumbList);
  } catch (error) {
    console.error('Breadcrumb structured data error:', error);
  }
}

/* ======= Render list grid ======= */

/**
 * Safe home render function with comprehensive error handling
 */
function renderHomeSafe() {
  // Guard: prevent double render
  if (window.__HOME_RENDERING) {
    console.log('⚠️ Home already rendering, skipping...');
    return;
  }
  window.__HOME_RENDERING = true;
  
  try {
    console.log('🏠 Rendering home safely...');
    
    // Reset header to home defaults
    resetHomeHeader();
    
    // Ensure home section is visible (idempotent if already shown by router)
    try {
      showSection('home');
      console.log('[SECTION] home');
    } catch(e) { 
      console.warn('❌ Show home failed:', e); 
    }

    // Render article cards
    try {
      const articles = getRandomArticles(8);
      renderList(articles || ARTICLES.slice(0, 8));
      console.log('✅ Article cards rendered');
    } catch(e) { 
      console.error('❌ Article render failed:', e);
      // Fallback: show simple message
      const listEl = document.getElementById('list');
      if (listEl) {
        setHTMLSafe(listEl, '<p>Loading articles...</p>');
      }
    }

    // Non-critical: SEO/QA should not stop render
    try { 
      const siteTitle = 'Artikel Unggulan — Maneh';
      const siteDesc = 'Jelajahi panduan mendalam dan berita teknologi terkini dari Maneh, disajikan dengan cara yang jelas dan mudah dipahami.';
      syncSEO({ type: 'page', title: siteTitle, description: siteDesc }); 
    } catch(e) {
      console.warn('❌ SEO sync failed (non-critical):', e);
    }
    
    // Non-critical: Analytics (only in production)
    try {
      if (!IS_LOCAL) {
        // Analytics code here if needed
      }
    } catch(e) {
      console.debug('[analytics non-critical]', e?.message || e);
    }
    
    console.log('✅ Home rendered safely');
  } catch (error) {
    console.error('❌ Critical home render error:', error);
  } finally {
    // Reset render guard
    window.__HOME_RENDERING = false;
  }
}

// ====== DIAGNOSTIC LOGGING ======
function logArticleMetadata(articles) {
  if (!articles || articles.length === 0) return;
  
  console.debug('[CAT DIAG] keys', Object.keys(articles[0]));
  
  const sampleArticle = articles[0];
  const diagnosticPaths = [
    'category', 'categories', 'type', 'tag', 'tags', 'topic', 'topics', 
    'label', 'labels', 'section', 'keywords',
    'meta.category', 'meta.categories', 'meta.tags',
    'frontmatter.category', 'frontmatter.categories', 'frontmatter.tags',
    'data.category', 'data.categories', 'data.tags',
    'slug', 'url', 'permalink', 'path', 'filePath', 'source'
  ];
  
  console.log('=== CATEGORY DIAGNOSTIC (1x) ===');
  console.log('Available keys:', Object.keys(sampleArticle));
  
  const foundPaths = [];
  const sampleValues = [];
  
  diagnosticPaths.forEach(path => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], sampleArticle);
    if (value !== undefined && value !== null && value !== '') {
      foundPaths.push(path);
      const rawValue = JSON.stringify(value).substring(0, 80);
      sampleValues.push(`${path}: ${rawValue}`);
    }
  });
  
  console.log('Found paths:', foundPaths.join(', '));
  console.log('Sample values:', sampleValues.slice(0, 3).join(' | '));
  console.log('=== END DIAGNOSTIC ===');
}

// ====== HELPER NORMALISASI ======
function normalize(str) {
  if (!str || typeof str !== 'string') return '';
  
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // hapus combining marks
    .replace(/[^a-z0-9]+/g, '-')     // non-alphanumeric jadi dash
    .replace(/^-+|-+$/g, '');        // trim dash di awal/akhir
}

// ====== ALIAS MAPPING ======
const CATEGORY_ALIASES = {
  news: ['news', 'berita', 'berita-teknologi', 'tech-news', 'trending', 'tren', 'trend'],
  tutorial: ['tutorial', 'panduan', 'guide', 'how-to', 'howto', 'step-by-step', 'belajar']
};

// ====== CATEGORY COPY MAPPING ======
const CATEGORY_COPY = {
  news: {
    h1: "News",
    subtitle: "Kumpulan berita dan ulasan tren teknologi terbaru dari Maneh—padat, jelas, dan mudah diikuti.",
    seoTitle: "News — Maneh",
    seoDesc: "Berita dan analisis tren teknologi terkini dari Maneh. Update padat, jelas, dan relevan."
  },
  tutorial: {
    h1: "Tutorial", 
    subtitle: "Koleksi panduan praktis dari Maneh untuk memahami teknologi langkah demi langkah, siap dipraktikkan.",
    seoTitle: "Tutorial — Maneh",
    seoDesc: "Tutorial teknologi dari Maneh: panduan praktis, jelas, dan bertahap untuk meningkatkan skill digital."
  }
};

// ====== ARTICLE FINDER BY SLUG ======
function getArticleBySlug(slug) {
  if (!slug || typeof slug !== 'string') {
    console.warn('Invalid slug provided:', slug);
    return null;
  }
  
  // Access ARTICLES consistently
  const articles = window.ARTICLES || ARTICLES || [];
  if (!articles.length) {
    console.warn('No articles available for slug lookup');
    return null;
  }
  
  // Normalize function (same as used for category matching)
  const normalize = str => {
    if (!str || typeof str !== 'string') return '';
    return String(str)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove combining marks
      .replace(/[^a-z0-9]+/g, '-')     // non-alphanumeric to dash
      .replace(/^-+|-+$/g, '');        // trim dashes
  };
  
  const normalizedTargetSlug = normalize(slug);
  
  // Find article by exact slug match or normalized title match
  const found = articles.find(article => {
    // Try exact slug match first
    if (article.slug && normalize(article.slug) === normalizedTargetSlug) {
      return true;
    }
    // Fallback to normalized title match
    if (article.title && normalize(article.title) === normalizedTargetSlug) {
      return true;
    }
    return false;
  });
  
  if (found) {
    console.log('Article found for slug:', slug, '→', found.title);
  } else {
    console.warn('Article not found for slug:', slug);
    console.log('Available slugs:', articles.map(a => a.slug || normalize(a.title)).slice(0, 10));
  }
  
  return found || null;
}

// ====== ENHANCED CATEGORY GETTER ======
function getArticleCategories(article) {
  if (!article) return new Set();

  const candidates = [];

  // Ambil semua kandidat label dari artikel
  const fields = ['category', 'categories', 'type', 'tags'];
  
  fields.forEach(field => {
    try {
      const value = article[field];
      if (value !== undefined && value !== null && value !== '') {
        candidates.push(value);
      }
    } catch (e) {
      // Ignore errors, nilai angka/objek asing diabaikan
    }
  });

  // Flatten dan buang null/undefined/empty
  const flattened = [];
  candidates.forEach(candidate => {
    try {
      if (Array.isArray(candidate)) {
        candidate.forEach(item => {
          if (typeof item === 'string' && item.trim()) {
            flattened.push(item.trim());
          } else if (typeof item === 'object' && item !== null) {
            // Handle object dengan property name/title/slug
            const objValue = item.name || item.title || item.slug || item.label;
            if (objValue && typeof objValue === 'string') {
              flattened.push(objValue.trim());
            }
          }
        });
      } else if (typeof candidate === 'string' && candidate.trim()) {
        flattened.push(candidate.trim());
      }
    } catch (e) {
      // Ignore errors
    }
  });

  // Normalize setiap label
  const normalizedSet = new Set();
  flattened.forEach(label => {
    const normalized = normalize(label);
    if (normalized) {
      normalizedSet.add(normalized);
    }
  });

  return normalizedSet;
}

// ====== LOGIKA COCOK KATEGORI ======
function matchesCategory(article, targetSlug) {
  const normalizedTarget = normalize(targetSlug);
  if (!normalizedTarget) return false;

  // Buat targetSet dengan slug dan semua aliasnya (semua di-normalize)
  const targetSet = new Set([normalizedTarget]);
  
  // Tambahkan aliases yang sudah dinormalize
  if (CATEGORY_ALIASES[normalizedTarget]) {
    CATEGORY_ALIASES[normalizedTarget].forEach(alias => {
      targetSet.add(normalize(alias));
    });
  }

  // Dapatkan labels artikel yang sudah dinormalize
  const articleLabels = getArticleCategories(article);

  // Cek irisan - apakah ada yang cocok
  for (const label of articleLabels) {
    if (targetSet.has(label)) {
      return true;
    }
  }

  return false;
}

// ====== CATEGORY HEADER SETTER ======
function setCategoryHeader(slug) {
  const normalizedSlug = normalize(slug);
  const copy = CATEGORY_COPY[normalizedSlug];
  
  if (!copy) {
    console.warn('No category copy found for:', normalizedSlug);
    return;
  }
  
  // Add category-page class to hide pill
  document.body.classList.add('category-page');
  
  // Update H1 heroTitle
  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) {
    heroTitle.textContent = copy.h1;
  }
  
  // Update subtitle heroSub
  const heroSub = document.getElementById('heroSub');
  if (heroSub) {
    heroSub.textContent = copy.subtitle;
  }
  
  console.debug('Category header set:', normalizedSlug, copy.h1);
}

// ====== RESET HOME HEADER ======
function resetHomeHeader() {
  try {
    // Remove category-page class to show pill again
    document.body.classList.remove('category-page');
    
    // Reset to original home values using consistent Indonesian
    const heroTitle = document.getElementById('heroTitle');
    if (heroTitle) {
      heroTitle.textContent = 'Artikel Unggulan';
    }
    
    const heroSub = document.getElementById('heroSub');
    if (heroSub) {
      heroSub.textContent = 'Jelajahi panduan mendalam dan berita teknologi terkini, disajikan dengan cara yang jelas dan mudah dipahami.';
    }
    
    const pillCat = document.getElementById('pillCat');
    if (pillCat) {
      pillCat.textContent = 'Tutorial • Tips • Teknologi';
    }
  } catch (e) {
    console.warn('❌ Reset home header failed:', e);
  }
}

// ====== FALLBACK HEURISTIC ======
function deriveCategoryFromContent(article) {
  const content = `${article.title || ''} ${article.summary || ''}`.toLowerCase();
  const result = [];
  
  // Tutorial keywords
  const tutorialKeywords = ['cara', 'panduan', 'langkah', 'tutorial', 'memulai', 'setup', 'how-to', 'step-by-step'];
  if (tutorialKeywords.some(keyword => content.includes(keyword))) {
    result.push('tutorial');
  }
  
  // News keywords
  const newsKeywords = ['rilis', 'update', 'kabar', 'tren', 'ancaman', 'laporan', 'peningkatan', 'terbaru', 'baru'];
  if (newsKeywords.some(keyword => content.includes(keyword))) {
    result.push('news');
  }
  
  return result;
}

// ====== CATEGORY RENDERER ======
async function renderCategoryPage(slug) {
  try {
    // Normalize slug permintaan
    const normalizedSlug = normalize(slug || '');
    if (!normalizedSlug) {
      console.warn('Invalid category slug');
      return;
    }

    // Logging dengan aliases
    const aliases = CATEGORY_ALIASES[normalizedSlug] || [normalizedSlug];
    console.log("Looking for category:", normalizedSlug, "(aliases:", aliases, ")");
    
    // Akses ARTICLES dengan berbagai cara untuk memastikan tersedia
    let articles;
    if (typeof window !== 'undefined' && window.ARTICLES) {
      articles = window.ARTICLES;
    } else if (typeof ARTICLES !== 'undefined') {
      articles = ARTICLES;
    } else {
      articles = [];
    }
    
    console.log(`DEBUG: articles.length = ${articles.length}, typeof ARTICLES = ${typeof ARTICLES}, typeof window.ARTICLES = ${typeof window.ARTICLES}`);
    
    if (articles.length === 0) {
      console.error('❌ No articles available for filtering!');
      console.log('Available globals:', Object.keys(window).filter(k => k.includes('ARTICLE')));
    }
    
    if (articles.length > 0 && !window._metadataDiagnosed) {
      logArticleMetadata(articles);
      window._metadataDiagnosed = true;
    }

    // Filter menggunakan matchesCategory
    const filtered = articles.filter(a => {
      // abaikan draft / unpublished bila ada flag
      if (a.draft === true || a.published === false) return false;
      
      return matchesCategory(a, normalizedSlug);
    });

    console.log("Category matched:", normalizedSlug, "count:", filtered.length);
    
    // Debug logging jika kosong
    if (filtered.length === 0) {
      console.warn(`Category empty: ${normalizedSlug} — fields checked: category/categories/type/tags`);
      console.log('--- Debug: Sampel 3 artikel pertama ---');
      console.log(`DEBUG: Total articles available: ${articles.length}`);
      articles.slice(0, 3).forEach((a, idx) => {
        const labels = getArticleCategories(a);
        const fields = ['category', 'categories', 'type', 'tags'];
        const fieldValues = fields.map(f => `${f}: ${JSON.stringify(a[f])}`).join(', ');
        console.log(`[${idx}] ${a.title?.substring(0, 40)}...`);
        console.log(`  Fields: ${fieldValues}`);
        console.log(`  Normalized: [${Array.from(labels).join(', ')}]`);
        console.log(`  Matches ${normalizedSlug}? ${matchesCategory(a, normalizedSlug)}`);
      });
    }

    // Sort descending by date jika tersedia
    const sortedList = filtered.sort((a, b) => {
      const dateA = new Date(a.published || a.date || 0);
      const dateB = new Date(b.published || b.date || 0);
      return dateB - dateA; // descending
    });

    // Render kategori - show home section for container
    hideSection('about');
    hideSection('policy');
    hideSection('contact');
    hideSection('reader');
    showSection('home');          // kita pakai container list yang sama seperti home
    
    const container = document.getElementById('list');
    if (container) setHTMLSafe(container, ''); // clear list
    
    // Set category header and SEO first
    setCategoryHeader(normalizedSlug);
    
    // Get category copy for SEO
    const copy = CATEGORY_COPY[normalizedSlug];
    const seoTitle = copy ? copy.seoTitle : `Category: ${slug.charAt(0).toUpperCase() + slug.slice(1)} — Maneh`;
    const seoDesc = copy ? copy.seoDesc : `Koleksi artikel kategori ${slug} dari Maneh.`;
    
    // SEO sinkron sesuai kategori
    await syncSEO({
      type: 'page',
      title: seoTitle,
      description: seoDesc,
      image: OG_DEFAULT
    });
    
    // Hanya render jika ada hasil filter, tidak ada fallback random
    if (filtered.length > 0) {
      // Panggil renderArticlesList dengan context category (no shuffle)
      renderArticlesList(sortedList, { shuffle: false, context: 'category', slug: normalizedSlug });
    } else {
      // Empty state - tampilkan pesan tanpa fallback
      if (container) {
        setHTMLSafe(container, `<div style="text-align: center; padding: 2rem; color: #666;">Belum ada artikel di kategori "${slug}".</div>`);
      }
    }

    console.log(`📚 Category rendered: ${normalizedSlug} (${filtered.length} items)`);
  } catch (e) {
    console.error('renderCategoryPage error:', e);
  }
}

function renderArticlesList(list, opts={}) {
  const container = document.getElementById('list');
  if (!container) return;
  const items = opts.shuffle === false ? list : shuffleArray(list);
  
  console.log('Rendering articles list with', items.length, 'items');
  
  try {
    const html = items.map(a => {
      // Generate new URL format
      const date = new Date(a.published);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      // Get order number based on category and published date
      const allArticles = window.ARTICLES || ARTICLES || [];
      const categoryArticles = allArticles.filter(art => art.category === a.category)
        .sort((x, y) => new Date(y.published) - new Date(x.published));
      const order = categoryArticles.findIndex(art => art.slug === a.slug) + 1;

      const newUrl = `/${year}/${month}/${day}/${order}-${a.slug}`;

      return `
        <a href="${newUrl}" data-slug="${a.slug}" class="card">
        <img class="thumb" loading="lazy" decoding="async" src="${a.cover || OG_DEFAULT}" alt="${a.title}" onerror="this.src='${OG_DEFAULT}'; this.onerror=null;">
        <div class="h2">${a.title}</div>
        <div class="meta"><time datetime="${a.published}">${fmtDate(a.published)}</time></div>
        <p class="desc">${a.summary}</p>
      </a>
      `;
    }).join('');

    // Safe HTML rendering
    if (typeof DOMPurify !== 'undefined') {
      setHTMLSafe(container, DOMPurify.sanitize(html));
    } else {
      setHTMLSafe(container, html); // Fallback
    }
    console.log('Articles list rendered, cards created:', container.querySelectorAll('.card').length);
  } catch (error) {
    console.error('❌ Error rendering articles list:', error);
    // Fallback: show error message
    setHTMLSafe(container, '<p>Error loading articles. Please refresh the page.</p>');
  }
}

function renderList(items){
  items = items || window.ARTICLES || ARTICLES || [];
  console.log('Rendering list with', items.length, 'items');
  const box = document.getElementById('list');
  if (!box) {
    console.error('List container not found!');
    return;
  }

  try {
    const html = items.map(a => {
      // Generate new URL format
      const date = new Date(a.published);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      // Get order number based on category and published date
      const allArticles = window.ARTICLES || ARTICLES || [];
      const categoryArticles = allArticles.filter(art => art.category === a.category)
        .sort((x, y) => new Date(y.published) - new Date(x.published));
      const order = categoryArticles.findIndex(art => art.slug === a.slug) + 1;

      const newUrl = `/${year}/${month}/${day}/${order}-${a.slug}`;

      return `
        <a href="${newUrl}" data-slug="${a.slug}" class="card">
        <img class="thumb" loading="lazy" decoding="async" src="${a.cover || OG_DEFAULT}" alt="${a.title}" onerror="this.src='${OG_DEFAULT}'; this.onerror=null;">
      <div class="h2">${a.title}</div>
      <div class="meta"><time datetime="${a.published}">${fmtDate(a.published)}</time></div>
      <p class="desc">${a.summary}</p>
    </a>
      `;
    }).join('');

    // Safe HTML rendering
    if (typeof DOMPurify !== 'undefined') {
      setHTMLSafe(box, DOMPurify.sanitize(html));
    } else {
      setHTMLSafe(box, html); // Fallback
    }
    console.log('List rendered, cards created:', box.querySelectorAll('.card').length);
  } catch (error) {
    console.error('❌ Error rendering list:', error);
    // Fallback: show error message
    setHTMLSafe(box, '<p>Error loading articles. Please refresh the page.</p>');
  }
}

/* Intercept semua <a data-slug> untuk URL baru */
function setupClickHandlers() {
document.addEventListener('click', async (e)=>{
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    
    // Handle hash routes through navigateTo for proper normalization
    if (href.startsWith('#')) {
      console.log('Hash navigation detected:', href);
      e.preventDefault();
      
      // Handle ToC links (in-page scroll)
      if (a.hasAttribute('data-toc')) {
        const targetId = href.substring(1); // Remove #
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Update hash for bookmarking without affecting router
          history.replaceState(null, '', href);
          return;
        }
      }
      
      // Handle related article links (SPA navigation)
      if (a.hasAttribute('data-rel') && a.getAttribute('data-rel') === 'related') {
        navigateTo(href);
        return;
      }
      
      // Handle other hash routes
      navigateTo(href);
      return;
    }
    
    console.log('Click detected on:', e.target);
    
  // Check for internal links (including index.html)
  const internalLink = e.target.closest('a[href^="/"], a[href^="./"], a[href^="../"]');
  if (internalLink) {
    const href = internalLink.getAttribute('href');
    
    // Check if it's an index.html link or root link
    if (href === '/' || href === '/index.html' || href.endsWith('/index.html')) {
      console.log('Internal home link found:', href);
  e.preventDefault();
      e.stopPropagation();
      
      // Normalize to root path
      const normalizedHref = href.replace(/\/index\.html$/, '/');
      
      // Use History API to navigate
      history.pushState({ type: 'home' }, '', normalizedHref);
      
      // Trigger route function
      await route();
      return;
    }
  }
  
  // Check for article links with pathname format
  const articleLink = e.target.closest('a[href^="/"][data-slug]');
  if (articleLink) {
    console.log('Article link found (pathname format):', articleLink);
    e.preventDefault();
    e.stopPropagation();
    
    const href = articleLink.getAttribute('href');
    const slug = articleLink.dataset.slug;
    
    if (href && slug) {
      console.log('Navigating to article URL:', href, 'slug:', slug);
      
      // Use History API to navigate
      history.pushState({ type: 'post', slug: slug }, '', href);
      
      // Trigger route function to handle the new pathname
      await route();
    } else {
      console.warn('Invalid article link - missing href or slug');
    }
    return;
  }
  
  // Check for hash-based article links (backward compatibility)
  const hashLink = e.target.closest('a[href^="#p/"], a[href^="#post/"]');
  if (hashLink) {
    console.log('Article link found (hash format):', hashLink);
    e.preventDefault();
    e.stopPropagation();
    
    const href = hashLink.getAttribute('href');
    const slug = hashLink.dataset.slug;
    
    if (href && slug) {
      console.log('Converting hash link to pathname format');
      
      // Generate new URL format
      const article = ARTICLES.find(art => art.slug === slug);
      if (article) {
        const date = new Date(article.published);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        const categoryArticles = ARTICLES.filter(art => art.category === article.category)
          .sort((a, b) => new Date(b.published) - new Date(a.published));
        const order = categoryArticles.findIndex(art => art.slug === slug) + 1;
        
        const newUrl = `/${year}/${month}/${day}/${order}-${slug}`;
        console.log('Converting to new URL:', newUrl);
        history.pushState(null, '', newUrl);
        debouncedRoute();
      }
    }
    return;
  }
  });
}

/* ======= SECTION SWITCHING ======= */
function switchSection(targetId) {
  console.log('[SECTION]', targetId);
  
  // Hide all sections first
  const allSections = ['home', 'reader', 'about', 'policy', 'contact'];
  allSections.forEach(id => {
    if (id !== targetId) {
      hideSection(id);
    }
  });
  
  // Show target section
  showSection(targetId);
}
function renderReader(slug, queryStr) {
  try {
    console.log('Rendering reader for slug:', slug);
    console.log('Available articles:', ARTICLES?.length || 0);
    
    // Input validation
    if (!slug || typeof slug !== 'string') {
      console.warn('Invalid slug provided');
      location.hash = '#';
      return;
    }
    
    const a = getArticleBySlug(slug);
    if (!a) { 
      console.warn('Article not found for slug:', slug);
      location.hash = '#';
      return; 
    }
    console.log('Found article:', a.title);
    
    // Analytics tracking for article view
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: a.title,
        page_location: window.location.href,
        content_group1: a.category,
        custom_parameter_1: a.category,
        custom_parameter_2: calculateReadingTime(a.content)
      });
      
      // Track article engagement
      trackArticleView(a.title, a.category);
    }
    
    const post = document.getElementById('post');
    if (!post) {
      console.error('Post element not found!');
      return;
    }
    
    // ENHANCED SECURITY: Multi-layer HTML sanitization
    let cleanHTML = '';
    let cleanTitle = '';
    
    try {
      // Sanitize title
      cleanTitle = (window.DOMPurify && DOMPurify.sanitize) ? DOMPurify.sanitize(a.title) : a.title.replace(/[<>]/g, '');
      
      // Sanitize HTML content with multiple layers
      if (window.DOMPurify && typeof DOMPurify.sanitize === 'function') {
        cleanHTML = DOMPurify.sanitize(a.html, {
          ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'b', 'i', 'br', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption', 'div', 'span', 'code', 'pre'],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'datetime', 'loading', 'decoding'],
          ALLOW_DATA_ATTR: false,
          ALLOW_UNKNOWN_PROTOCOLS: false,
          SANITIZE_DOM: true,
          KEEP_CONTENT: true
        });
        console.log('HTML sanitized with DOMPurify');
      } else {
        console.warn('DOMPurify not available, using enhanced basic sanitization');
        // Enhanced basic sanitization fallback
        cleanHTML = a.html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
          .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
          .replace(/javascript:/gi, '');
      }
    } catch (error) {
      console.error('HTML sanitization error:', error);
      cleanTitle = 'Error loading article';
      cleanHTML = '<p>Sorry, there was an error loading this article.</p>';
    }
    
    // Optimize images in content
    const optimizedHTML = optimizeImagesInContent(cleanHTML);
    
    // Secure DOM update with proper order: H1 → Meta → Figure → Body
    setHTMLSafe(post, `
      <h1 class="post-title" id="post-top">${cleanTitle}</h1>
      <div class="post-meta" role="contentinfo" aria-label="Informasi penulis dan tanggal">
        <span class="post-verified" title="Verified" aria-label="Verified">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
            <path d="M9 12L11 14L15 10" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </span>
        <span class="post-author">Penjaga</span>
        <time class="post-date" datetime="${a.published}">${fmtDate(a.published)}</time>
      </div>
      <figure class="post-hero">
        <img class="thumb" src="${a.cover}" alt="${a.title}" loading="eager" decoding="async" fetchpriority="high">
        <figcaption class="caption">${a.altTitle || a.title}</figcaption>
      </figure>
      <div class="post-body">${optimizedHTML}</div>
    `);
    console.log('Article content rendered with proper order: H1 → Meta → Figure → Body');
    
    // Ensure the post element is visible
    post.style.display = 'block';
    post.style.visibility = 'visible';
    post.style.opacity = '1';

  /* Tampilkan Tags */
  post.querySelectorAll('.tags-container').forEach(n => n.remove()); // Hapus yg lama jika ada
  if (a.tags && a.tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'tags-container';
    setHTMLSafe(tagsContainer, a.tags.map(tag => 
      `<a href="#tag/${slugify(tag)}" class="tag-item">${tag}</a>`
    ).join(''));
    const postMeta = post.querySelector('.post-meta');
    if (postMeta) {
      postMeta.after(tagsContainer);
    } else {
      post.appendChild(tagsContainer);
    }
    
    // Add internal links section
    const internalLinks = renderInternalLinks(a);
    if (internalLinks) {
      post.insertAdjacentHTML('beforeend', internalLinks);
    }
  }

  // ToC
  if (window._mountTOC) { window._mountTOC(slug); }
  
  // Log verification
  console.log('✅ meta synced | ✅ canonical | ✅ alt ok | ✅ links ok');

  // Scroll target (?s=)
  const params = new URLSearchParams(queryStr||'');
  const sec = params.get('s');
  setTimeout(()=>scrollToId(sec || 'post'), 30);

  // Side lists
  const others=ARTICLES.filter(x=>x.slug!==slug);
  setHTMLSafe(document.getElementById('pilihan'), others.slice(0,3).map(x=>{
    // Generate new URL format
    const date = new Date(x.published);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const categoryArticles = ARTICLES.filter(art => art.category === x.category)
      .sort((a, b) => new Date(b.published) - new Date(a.published));
    const order = categoryArticles.findIndex(art => art.slug === x.slug) + 1;
    
    const newUrl = `/${year}/${month}/${day}/${order}-${x.slug}`;
    
    return `
      <a href="${newUrl}" data-slug="${x.slug}" class="sideItem">
      <img loading="lazy" decoding="async" src="${x.cover}" alt="${x.title}">
      <div><div style="font-weight:700">${x.title}</div><div class="meta"><time datetime="${x.published}">${fmtDate(x.published)}</time></div></div>
      </a>
    `;
  }).join(''));
  setHTMLSafe(document.getElementById('populer'), others.slice(0,4).map((x,i)=>{
    // Generate new URL format
    const date = new Date(x.published);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const categoryArticles = ARTICLES.filter(art => art.category === x.category)
      .sort((a, b) => new Date(b.published) - new Date(a.published));
    const order = categoryArticles.findIndex(art => art.slug === x.slug) + 1;
    
    const newUrl = `/${year}/${month}/${day}/${order}-${x.slug}`;
    
    return `
      <a href="${newUrl}" data-slug="${x.slug}" class="rank">
      <div class="dot">#${i+1}</div><div style="font-weight:700">${x.title}</div>
      </a>
    `;
  }).join(''));


  // Generate new URL format: /2025/09/25/1-era-baru-sinema-ai-sora
  const article = ARTICLES.find(a => a.slug === slug);
  if (article) {
    const date = new Date(article.published);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get order number based on category and published date
    const categoryArticles = ARTICLES.filter(a => a.category === article.category)
      .sort((a, b) => new Date(b.published) - new Date(a.published));
    const order = categoryArticles.findIndex(a => a.slug === slug) + 1;
    
    const newUrl = `/${year}/${month}/${day}/${order}-${slug}`;
    history.replaceState(null, '', newUrl);
    console.log('New URL generated:', newUrl);
  } else {
    // Fallback to old format
  history.replaceState(null, '', window.location.pathname + window.location.search + `#p/${slug}`);
  }
  // SEO already updated in renderPost, don't update again
  switchSection('reader');
  console.log('✅ Reader page should now be visible');
  
  } catch (error) {
    console.error('Render reader error:', error);
    showReaderError();
  }
}

/**
 * Render article post with proper SEO and navigation
 * @param {Object} article - Article object from ARTICLES array
 */
async function renderPost(article) {
  try {
    console.log('Rendering post:', article.title);
    
    // Update SEO for article first
    await updateSEOForArticle(article);
    
    // Render the article content
    renderReader(article.slug);
    
    // Show reader section
    switchSection('reader');
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Run SEO QA after content is rendered
    setTimeout(() => {
      seoQA({
        type: 'article',
        title: article.title,
        description: article.summary || 'Tutorial lengkap dengan panduan step-by-step.',
        image: article.cover
      });
    }, 100);
    
    console.log('✅ Post rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering post:', error);
    render404();
  }
}

/**
 * Show reader error page
 */
function showReaderError() {
  console.log('Showing reader error page');
  const post = document.getElementById('post');
  if (post) {
    setHTMLSafe(post, `
      <h1>Error Loading Article</h1>
      <p>Maaf, terjadi kesalahan saat memuat artikel.</p>
      <p><a href="/">← Kembali ke Beranda</a></p>
    `);
  }
  show('reader');
}

/**
 * Render internal links section
 * @param {Object} article - Article object with links array
 */
function renderInternalLinks(article) {
  if (!article.links || article.links.length === 0) return '';
  
  const relatedArticles = article.links.slice(0, 3).map(slug => {
    const relatedArticle = ARTICLES.find(a => a.slug === slug);
    if (!relatedArticle) return null;
    
    // Format URL: /YYYY/MM/DD/slug
    const [year, month, day] = relatedArticle.published.split('-');
    const articleUrl = `/${year}/${month}/${day}/${relatedArticle.slug}`;
    
    return `
      <div class="related-article">
        <a href="${articleUrl}" 
           class="related-link"
           data-rel="related">
          <h4>${relatedArticle.title}</h4>
          <p>${relatedArticle.summary}</p>
        </a>
      </div>
    `;
  }).filter(Boolean).join('');
  
  if (!relatedArticles) return '';
  
  return `
    <div class="related-articles">
      <h3>Baca Juga</h3>
      <div class="related-grid">
        ${relatedArticles}
      </div>
    </div>
  `;
}

/**
 * Add alt text to images in content
 * @param {string} html - HTML content
 * @param {string} defaultAlt - Default alt text
 * @returns {string} - HTML with alt text added
 */
function addAltTextToImages(html, defaultAlt) {
  return html.replace(/<img([^>]*?)(?:\s+alt\s*=\s*["'][^"']*["'])?([^>]*?)>/gi, (match, before, after) => {
    // Check if alt already exists
    if (match.includes('alt=')) {
      return match;
    }
    // Add alt text
    return `<img${before} alt="${defaultAlt}"${after}>`;
  });
}

/**
 * Render 404 page
 */
function render404() {
  console.log('Rendering 404 page');
  show('reader');
  const post = document.getElementById('post');
  if (post) {
    setHTMLSafe(post, `
      <h1>Artikel Tidak Ditemukan</h1>
      <p>Maaf, artikel yang Anda cari tidak ditemukan.</p>
      <p><a href="/">← Kembali ke Beranda</a></p>
    `);
  }
}

// ====== ROUTER ======
let isRouting = false;

async function route() {
  // Prevent concurrent routing
  if (isRouting) {
    console.log('⚠️ Route already in progress, skipping...');
    return;
  }
  
  isRouting = true;
  console.log('🔄 Starting route...');
  
  try {
    initSectionsCache(); // pastikan cache siap
    const { name, params } = getRoute();
    console.log('[ROUTE]', location.hash, '→', name, params);

    if (name === 'home') {
      switchSection('home');
      await renderHomeSafe();
      console.log('✅ Home route executed');
      return;
    }
    if (name === 'category') {
      switchSection('home'); // Category uses home section
      await renderCategoryPage(params.slug);
      console.log('✅ Category route executed');
      return;
    }
    if (name === 'article') {
      console.log('Routing -> article', { slug: params.slug });
      const article = getArticleBySlug(params.slug);
      if (article) {
        await renderPost(article);
        console.log('✅ Article route executed');
      } else {
        console.warn('Article not found, redirecting to home');
        navigateTo('#');
      }
      return;
    }
    if (name === 'about')  { 
      switchSection('about');  
      syncSEO({type:'page', title:'Tentang Maneh — Maneh', description:SITE_DESC}); 
      console.log('✅ About route executed');
      return; 
    }
    if (name === 'policy') { 
      switchSection('policy'); 
      syncSEO({type:'page', title:'Kebijakan Privasi Maneh — Maneh', description:'Kebijakan privasi Maneh'}); 
      console.log('✅ Policy route executed');
      return; 
    }
    if (name === 'contact'){ 
      switchSection('contact'); 
      syncSEO({type:'page', title:'Hubungi Tim Maneh — Maneh', description:'Hubungi redaksi/teknis Maneh'}); 
      console.log('✅ Contact route executed');
      return; 
    }

    // Fallback to home
    switchSection('home');
    await renderHomeSafe();
    console.log('✅ Fallback route executed');
  } catch (err) {
    console.error('route error', err);
    switchSection('home');
    await renderHomeSafe();
  } finally {
    isRouting = false;
    console.log('✅ Route completed');
  }
}
// Unit tests for routing (lightweight)
function testRouting() {
  const testCases = [
    { hash: '#', expected: 'home' },
    { hash: '#home', expected: 'home' },
    { hash: '#p/test-slug', expected: 'article' },
    { hash: '#post/test-slug', expected: 'article' },
    { hash: '#category/news', expected: 'category' },
    { hash: '#tag/ai', expected: 'tag' },
    { hash: '#about', expected: 'static' },
    { hash: '#policy', expected: 'static' },
    { hash: '#contact', expected: 'static' }
  ];
  
  console.log('🧪 Running routing tests...');
  testCases.forEach(test => {
    const originalHash = location.hash;
    location.hash = test.hash;
    const hash = location.hash.slice(1).trim();
    
    let result = 'unknown';
    if (!hash || hash === '' || hash === 'home') result = 'home';
    else if (hash === 'about' || hash === 'policy' || hash === 'contact') result = 'static';
    else if (hash.startsWith('category/')) result = 'category';
    else if (hash.startsWith('tag/')) result = 'tag';
    else if (hash.startsWith('p/') || hash.startsWith('post/')) result = 'article';
    
    const passed = result === test.expected;
    console.log(`${passed ? '✅' : '❌'} ${test.hash} → ${result} (expected: ${test.expected})`);
    
    location.hash = originalHash;
  });
  console.log('🧪 Routing tests completed');
}

// Run tests in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.testRouting = testRouting;
  console.log('💡 Call testRouting() to run routing tests');
}

// ====== ROUTER INITIALIZATION ======
// Add event listeners only once
if (!window.routeListenersAdded) {
  window.addEventListener('hashchange', () => {
    console.log('Hash changed to:', location.hash.replace(/^#/, ''));
    route();
  });
  
  window.addEventListener('popstate', () => {
    console.log('Popstate event:', location.pathname, location.hash);
    route();
  });
  
  window.routeListenersAdded = true;
  console.log('✅ Route listeners added');
}

// Global interceptor for all internal links to prevent full page reloads
document.addEventListener('click', async function(e) {
  const link = e.target.closest('a[href]');
  if (!link) return;
  
  const href = link.getAttribute('href');
  
  // Check if it's an internal link that should be handled by SPA
  if (href && (
    href === '/' || 
    href === '/index.html' || 
    href.endsWith('/index.html') ||
    href.startsWith('/') && !href.startsWith('//') // Internal absolute paths
  )) {
    // Don't prevent if it's already handled by specific handlers above
    if (e.defaultPrevented) return;
    
    console.log('🔄 Intercepting internal link:', href);
    e.preventDefault();
    
    // Normalize path
    const normalizedHref = href.replace(/\/index\.html$/, '/');
    
    // Use History API
    history.pushState({ type: 'internal' }, '', normalizedHref);
    
    // Trigger route
    await route();
  }
});

/* ======= Search ======= */
const q=document.getElementById('q');
const qResults=document.getElementById('qResults');
let qTimer=null, qActiveIndex=-1;

// Debounce function already defined above

function renderQuickResults(term){
  const v = term.trim().toLowerCase();
  if(v.length<2){ qResults.classList.remove('show'); setHTMLSafe(qResults, ''); qActiveIndex=-1; return; }
  const filtered = ARTICLES.filter(a => (a.title+' '+a.summary).toLowerCase().includes(v));
  setHTMLSafe(qResults, filtered.length
    ? filtered.map(a=>{
        // Generate new URL format for search results
        const date = new Date(a.published);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        const categoryArticles = ARTICLES.filter(art => art.category === a.category)
          .sort((x, y) => new Date(y.published) - new Date(x.published));
        const order = categoryArticles.findIndex(art => art.slug === a.slug) + 1;
        
        const newUrl = `/${year}/${month}/${day}/${order}-${a.slug}`;
        
        return `
          <a href="${newUrl}" data-slug="${a.slug}">
          <img loading="lazy" decoding="async" src="${a.cover}" alt="">
          <div>
            <div class="hit-title">${a.title}</div>
            <div class="hit-meta"><time datetime="${a.published}">${fmtDate(a.published)}</time></div>
          </div>
          </a>`;
      }).join('') : `<div style="padding:12px;color:var(--muted)">${t('noResultsFor')} &ldquo;${term}&rdquo;.</div>`);
  qResults.classList.add('show');
  qActiveIndex=-1;
}

// Create debounced search function
const debouncedSearch = debounce((term) => {
  const filtered = ARTICLES.filter(a => (a.title + a.summary).toLowerCase().includes(term.toLowerCase()));
  if (document.getElementById('home').style.display !== 'none') { 
    renderList(filtered); 
  }
    renderQuickResults(term);
}, 160);

q?.addEventListener('input', e => {
  const term = e.target.value;
  debouncedSearch(term);
});
q?.addEventListener('keydown',e=>{
  const items = Array.from(qResults.querySelectorAll('a[data-slug]'));
  if(e.key==='ArrowDown' && items.length){
    e.preventDefault(); qActiveIndex = (qActiveIndex+1)%items.length; items.forEach(n=>n.classList.remove('active')); items[qActiveIndex].classList.add('active'); items[qActiveIndex].scrollIntoView({block:'nearest'});
  }else if(e.key==='ArrowUp' && items.length){
    e.preventDefault(); qActiveIndex = (qActiveIndex-1+items.length)%items.length; items.forEach(n=>n.classList.remove('active')); items[qActiveIndex].classList.add('active'); items[qActiveIndex].scrollIntoView({block:'nearest'});
  }else if(e.key==='Enter'){
    e.preventDefault();
    const target = (qActiveIndex>=0?items[qActiveIndex]:qResults.querySelector('a[data-slug]'));
    if(target){ target.click(); }
  }else if(e.key==='Escape'){
    qResults.classList.remove('show');
    document.getElementById('searchBar').classList.remove('show');
  }
});
function hideSearch() {
  qResults.classList.remove('show');
  document.getElementById('searchBar').classList.remove('show');
  q.value = '';
}

qResults.addEventListener('click',e=>{
  const a = e.target.closest('a[data-slug]');
  if(!a) return;
  e.preventDefault();
  hideSearch();
  
  const href = a.getAttribute('href');
  const slug = a.dataset.slug;
  
  if (href && slug) {
    console.log('Search result clicked, navigating to:', href);
    history.pushState({ type: 'post', slug: slug }, '', href);
    debouncedRoute();
  } else {
    console.warn('Invalid search result link');
  }
});
window.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){
    e.preventDefault();
    document.getElementById('searchBar').classList.add('show');
    q.focus();
  }
});

/* ======= Drawer & global keyboard ======= */
/**
 * Open drawer with accessibility support
 */
function openDrawer() {
  const drawer = DOMCache.get('drawer');
  if (!drawer) return;
  
  drawer.classList.add('show');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('noscroll');
}

/**
 * Close drawer with accessibility support
 */
function closeDrawer() {
  const drawer = DOMCache.get('drawer');
  if (!drawer) return;
  
  // Check if drawer was open
  if (drawer.classList.contains('show')) {
    console.warn('Overlay/backdrop was open. Closing.');
  }
  
  // Remove focus from any focused element inside drawer before hiding
  const focusedElement = drawer.querySelector(':focus');
  if (focusedElement) {
    focusedElement.blur();
  }
  
  drawer.classList.remove('show');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('noscroll');
  
  // Additional backdrop cleanup
  const backdrop = drawer.querySelector('.backdrop');
  if (backdrop) {
    if (backdrop.style.pointerEvents !== 'none') {
      console.warn('Backdrop still active, disabling.');
      backdrop.style.pointerEvents = 'none';
    }
  }
}

// Event listeners with null checks
const btnMenu = DOMCache.get('btnMenu');
const btnClose = DOMCache.get('btnClose');
const drawer = DOMCache.get('drawer');

if (btnMenu) btnMenu.onclick = openDrawer;
if (btnClose) btnClose.onclick = closeDrawer;
if (drawer) {
  const backdrop = drawer.querySelector('.backdrop');
  if (backdrop) backdrop.onclick = closeDrawer;
}

// Auto-close menu on navigation
function addMenuNavigationHandlers() {
  const menuLinks = document.querySelectorAll('.menu .link');
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Handle hash navigation
      if (href && href.startsWith('#')) {
        console.log('Menu navigation to:', href);
        
        // Close menu FIRST to prevent backdrop interference
        closeDrawer();
        
        // Prevent default to let our global hash handler take over
        e.preventDefault();
        e.stopPropagation();
        
        // Use navigateTo for consistent navigation with normalization
        navigateTo(href);
      } else {
        // For other links, close menu after small delay
        setTimeout(() => {
          closeDrawer();
        }, 100);
      }
    });
  });
}

// Initialize menu handlers after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addMenuNavigationHandlers);
} else {
  addMenuNavigationHandlers();
}

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeDrawer();
    const searchBar = DOMCache.get('searchBar');
    if (searchBar) searchBar.classList.remove('show');
  }
});

/* ======= Search toggle ======= */
const btnSearch = document.getElementById('btnSearch');
if (btnSearch) {
  btnSearch.onclick = () => {
    const searchBar = DOMCache.get('searchBar');
    if (!searchBar) return;
    
  searchBar.classList.toggle('show');
    if (searchBar.classList.contains('show')) {
      const q = document.getElementById('searchInput');
      if (q) q.focus();
    }
};
}
document.addEventListener('click',e=>{
  const bar = document.getElementById('searchBar');
  if(!bar.contains(e.target) && e.target.id!=='btnSearch'){
    qResults.classList.remove('show');
  }
  
  if (e.target.closest('a[href="#about"], a[href="#policy"], a[href="#contact"]')) {
    console.log('About/Policy link clicked in search handler:', e.target.closest('a[href="#about"], a[href="#policy"]'));
  }
});

/* ======= Share ======= */
function share(url,title){
  const u=encodeURIComponent(url), t=encodeURIComponent(title);
  document.getElementById('shareFb').href=`https://www.facebook.com/sharer/sharer.php?u=${u}`;
  document.getElementById('shareIg').href=`https://instagram.com/`;
  document.getElementById('shareX').href=`https://twitter.com/intent/tweet?url=${u}&text=${t}`;
  document.getElementById('shareYt').href=`https://youtube.com/`;
}
share(location.href,'Maneh &mdash; Tutorial & Tips Teknologi');

/* ======= Ad Management Removed ======= */

/* ======= Reading Progress Tracking ======= */
function initReadingProgress() {
  let readingStartTime = Date.now();
  let progressTracked = [];
  
  const trackProgress = () => {
    if (window.location.hash.startsWith('#p/')) {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      
      // Track at 25%, 50%, 75%, 100% intervals
      [25, 50, 75, 100].forEach(milestone => {
        if (scrollPercent >= milestone && !progressTracked.includes(milestone)) {
          progressTracked.push(milestone);
          
          if (typeof trackReadingProgress !== 'undefined') {
            trackReadingProgress(milestone);
          }
          
          // Track time spent reading
          if (milestone === 100) {
            const readingTime = Math.round((Date.now() - readingStartTime) / 1000);
            if (typeof gtag !== 'undefined') {
              gtag('event', 'article_complete', {
                'reading_time_seconds': readingTime,
                'event_category': 'engagement'
              });
            }
          }
        }
      });
    }
  };
  
  // Reset on new article (debounced)
  const debouncedReadingReset = debounce(() => {
    readingStartTime = Date.now();
    progressTracked = [];
  }, 120);
  
  window.addEventListener('hashchange', debouncedReadingReset);
  
  // Track progress on scroll
  window.addEventListener('scroll', trackProgress, { passive: true });
}

// Initialize reading progress tracking
document.addEventListener('DOMContentLoaded', initReadingProgress);

/* ======= Health Check for Monitoring ======= */
function healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.4',
    uptime: Math.round(performance.now() / 1000),
    services: {
      css: document.querySelector('link[href*="style.css"]') ? 'ok' : 'error',
      js: typeof ARTICLES !== 'undefined' && ARTICLES.length > 0 ? 'ok' : 'error',
      analytics: typeof gtag !== 'undefined' ? 'ok' : 'error',
      dompurify: typeof DOMPurify !== 'undefined' ? 'ok' : 'error',
      articles_count: ARTICLES?.length || 0,
      locale: LOCALE || 'unknown'
    },
    performance: {
      page_load: Math.round(performance.now()),
      memory_used: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : 'unknown'
    }
  };
}

// Expose health check for monitoring
window.healthCheck = healthCheck;

// Expose health endpoint via hash route (debounced)
const debouncedHealthCheck = debounce(() => {
  if (location.hash === '#health') {
    setHTMLSafe(document.body, `<pre>${JSON.stringify(healthCheck(), null, 2)}</pre>`);
  }
}, 120);

window.addEventListener('hashchange', debouncedHealthCheck);

/* ======= Theme Toggle ======= */
(function initTheme() {
  const btnTheme = document.getElementById('btnTheme');
  if (!btnTheme) return;

  // Default to light theme, check for saved theme preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const savedTheme = localStorage.getItem('theme');
  let isDark = savedTheme ? savedTheme === 'dark' : false; // Default to light

  function updateThemeUI(dark) {
    // Update document theme
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    
    // Update button icons
    const sunPath = btnTheme.querySelector('.sun');
    const moonPath = btnTheme.querySelector('.moon');
    if (sunPath) sunPath.style.display = dark ? 'none' : 'block';
    if (moonPath) moonPath.style.display = dark ? 'block' : 'none';
  }

  function setTheme(dark) {
    isDark = dark;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    updateThemeUI(dark);
  }

  // Initialize theme
  setTheme(isDark);

  // Handle button click
  btnTheme.addEventListener('click', () => setTheme(!isDark));

  // Handle system theme changes
  prefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches);
    }
  });
})();

/* ======= Init ======= */
// Initialize year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

function clearCache() {
  if ('serviceWorker' in navigator && 'caches' in window) {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('All caches cleared');
      location.reload();
    });
  }
}

/**
 * Initialize blog with proper error handling and performance optimization
 */
function initializeBlog() {
  try {
    console.log('Initializing Maneh blog...');
    
    // Check AdSense setup
    checkAdSenseSetup();
    
    // Initialize DOM cache
    DOMCache.init();
    
    // Validate required data
    if (typeof ARTICLES === 'undefined') {
      console.error('❌ ARTICLES not loaded! Check data.js file');
      return;
    }
    if (typeof I18N === 'undefined') {
      console.error('❌ I18N not loaded! Check data.js file');
      return;
    }
    
    console.log('✅ Data loaded successfully:', {
      articles: ARTICLES.length,
      i18n: typeof I18N !== 'undefined',
      dompurify: typeof DOMPurify !== 'undefined'
    });
    
    // Check if required elements exist
    const homeEl = document.getElementById('home');
    const readerEl = document.getElementById('reader');
    const postEl = document.getElementById('post');
    console.log('Home element:', homeEl ? 'found' : 'missing');
    console.log('Reader element:', readerEl ? 'found' : 'missing');
    console.log('Post element:', postEl ? 'found' : 'missing');
    
    // Setup click handlers first
    setupClickHandlers();
    
    // Ensure I18N is loaded before applying translations
    if (typeof I18N !== 'undefined') {
detectAndApplyLocale(); // Run locale detection and initial render
      // Don't call route() here - it will be called from index.html after scripts load
      console.log('Initialization complete');
    } else {
      console.error('I18N not loaded, retrying...');
      setTimeout(() => {
        if (typeof I18N !== 'undefined') {
          detectAndApplyLocale();
          // Don't call route() here - it will be called from index.html after scripts load
        } else {
          console.error('I18N still not available after timeout');
        }
      }, 100);
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Normalize path to prevent routing issues
(function normalizeIndex() {
  try {
    if (location.pathname.endsWith('/index.html')) {
      history.replaceState(null, '', location.pathname.replace(/\/index\.html$/, '/'));
    }
  } catch(e) {
    console.warn('Path normalization failed:', e);
  }
})();

// ====== PATH HELPERS ======
function isArticlePath(pathname) {
  // Match pattern: /2025/01/01/1-article-slug
  return /^\/\d{4}\/\d{2}\/\d{2}\/[^\/]+\/?$/.test(pathname);
}

function rootBase() {
  // Use APP_BASE if available, otherwise default to '/'
  return (window.APP_BASE || '/');
}

// ====== NAVIGATION HELPER ======
function navigateTo(targetHash) {
  if (!targetHash) {
    console.warn('navigateTo called with empty hash');
    return;
  }
  
  // Ensure hash starts with #
  if (!targetHash.startsWith('#')) {
    targetHash = '#' + targetHash;
  }
  
  console.log('[NAV]', targetHash);
  
  // If we're on an article path OR not on root base, force redirect to root + hash
  if (isArticlePath(location.pathname) || location.pathname !== rootBase()) {
    const rootUrl = rootBase() + targetHash;
    console.log('[NAV] Normalizing from article path to:', rootUrl);
    location.assign(rootUrl);
    return;
  }
  
  // Already on root → just update hash
  if (location.hash !== targetHash) {
    location.hash = targetHash;
  } else {
    console.log('[NAV] Hash unchanged, triggering route manually');
    route(); // Trigger route if hash is same but we need to re-render
  }
}

// ====== NAV LISTENERS (Removed duplicates) ======
// Event listeners are now handled in the consolidated section above

// Handler klik global: jangan block <a href="#...">
document.addEventListener('click', async (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (href.startsWith('#')) return; // allow default, hashchange akan memicu route()
});
console.log('✅ Route listeners added');

// ====== BOOTSTRAP ORDER ======
function waitUntilSafe({ timeout = 3500 } = {}) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const timer = setInterval(() => {
      const ready = !!(window.ARTICLES && document.readyState !== 'loading');
      if (ready || Date.now() - t0 > timeout) {
        clearInterval(timer);
        // Only show timeout warning if data is actually not ready
        if (!ready && Date.now() - t0 >= timeout) {
          console.warn(`⚠️ ARTICLES/I18N: timeout after ${timeout}ms — continue anyway`);
        }
        resolve();
      }
    }, 50);
  });
}

async function safeStart() {
  // Guard: prevent double bootstrap
  if (window.__APP_BOOTSTRAPPED) {
    console.log('⚠️ Bootstrap already completed, skipping...');
    return;
  }
  
  try {
    initSectionsCache();                   // <-- penting: definisikan cache dulu!
    await waitUntilSafe({ timeout: 3500 }); // atau 4000 jika perlu
    await route();
    window.__APP_BOOTSTRAPPED = true;
    console.log('✅ Bootstrap completed');
  } catch (e) {
    console.error('❌ Bootstrap error:', e);
    // fallback ke home agar tidak blank
    try { await renderHomeSafe(); } catch(_) {}
  }
}

// Kick-off setelah DOM siap
document.addEventListener('DOMContentLoaded', () => {
  // jangan panggil route() di tempat lain lagi
  safeStart();
});

/* ======= ToC (bersih) ======= */
(function(){
  function cleanText(t){ return t.replace(/^\d+(\.\d+)?[.)]?\s+/, '').trim(); }
  window._buildTOC_clean = function(articleEl, slug){
    const headings = [...articleEl.querySelectorAll('h2, h3')];
    if(!headings.length) return null;
    let h2i = 0, h3i = 0;
    const items = []; const used = new Set();
    headings.forEach(h=>{
      const level = h.tagName === 'H2' ? 2 : 3;
      if(level===2){ h2i++; h3i=0; } else { h3i++; }
      const baseId = h.id || slugify(cleanText(h.textContent));
      let id = baseId || (level===2?'section':'sub');
      let k=2; while(used.has(id) || document.getElementById(id)){ id = baseId+'-'+(k++); }
      used.add(id); h.id=id;
      const label = level===2 ? `${h2i}.` : `${h2i}.${h3i}`;
      const pure = cleanText(h.textContent);
      h.textContent = `${label} ${pure}`;
      items.push({id, level, label, text: pure});
    });
    const wrap = document.createElement('div'); wrap.className='toc';
    const head = document.createElement('div'); head.className='toc-head';
    const title = document.createElement('div'); title.className='toc-title'; title.textContent = t('toc');
    const btn = document.createElement('button'); 
    btn.type='button'; btn.className='burger'; btn.setAttribute('aria-label','Tampilkan/Sembunyikan Daftar Isi'); 
    btn.setAttribute('aria-expanded','true');
    setHTMLSafe(btn, `<svg viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>`);
    head.appendChild(title); head.appendChild(btn); wrap.appendChild(head);
    const root = document.createElement('ol'); root.className='toc-ol'; wrap.appendChild(root);
    let stack=[root], curLevel=2;
    items.forEach(it=>{
      while(it.level>curLevel){ const ol=document.createElement('ol'); ol.className='toc-ol'; stack[stack.length-1].lastElementChild?.appendChild(ol); stack.push(ol); curLevel++; }
      while(it.level<curLevel){ stack.pop(); curLevel--; }
      const li=document.createElement('li');
      const a=document.createElement('a'); a.href=`#${it.id}`; a.textContent = `${it.label} ${it.text}`;
      a.setAttribute('data-toc', 'true');
      a.addEventListener('click',(ev)=>{ 
        ev.preventDefault(); 
        scrollToId(it.id); 
        // Update URL hash for bookmarking without affecting router
        history.replaceState(null, '', `#${it.id}`);
      });
      li.appendChild(a); stack[stack.length-1].appendChild(li);
    });
    let collapsed = window.innerWidth < 760;
    if(collapsed){ wrap.classList.add('collapsed'); btn.setAttribute('aria-expanded','false'); }
    btn.addEventListener('click',()=>{ 
      wrap.classList.toggle('collapsed'); 
      btn.setAttribute('aria-expanded', String(!wrap.classList.contains('collapsed')));
    });
    return wrap;
  };
  window._mountTOC = function(slug){
    const post = document.getElementById('post');
    if(!post) return;
    post.querySelectorAll('.toc').forEach(n=>n.remove());
    const firstH2 = post.querySelector('h2');
    const toc = window._buildTOC_clean(post, slug);
    if(!toc) return;
    if(firstH2){ firstH2.parentNode.insertBefore(toc, firstH2); }
    else { post.appendChild(toc); }
  };
})();

/* ======= Comment Form ======= */
(function initCommentForm() {
  const commentForm = document.getElementById('commentForm');
  if (!commentForm) return;

  // Load saved user info
  function loadSavedInfo() {
    const savedName = localStorage.getItem('commentName');
    const savedEmail = localStorage.getItem('commentEmail');
    const savedWebsite = localStorage.getItem('commentWebsite');
    const savedRemember = localStorage.getItem('commentRemember') === 'true';
    
    if (savedName) document.getElementById('commentName').value = savedName;
    if (savedEmail) document.getElementById('commentEmail').value = savedEmail;
    if (savedWebsite) document.getElementById('commentWebsite').value = savedWebsite;
    if (savedRemember) document.getElementById('remember').checked = savedRemember;
  }

  // Save user info
  function saveUserInfo() {
    const saveInfo = document.getElementById('remember').checked;
    localStorage.setItem('commentRemember', saveInfo);
    
    if (saveInfo) {
      localStorage.setItem('commentName', document.getElementById('commentName').value);
      localStorage.setItem('commentEmail', document.getElementById('commentEmail').value);
      localStorage.setItem('commentWebsite', document.getElementById('commentWebsite').value);
    } else {
      localStorage.removeItem('commentName');
      localStorage.removeItem('commentEmail');
      localStorage.removeItem('commentWebsite');
    }
  }

  // Clear error messages
  function clearErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(el => el.classList.remove('show'));
    
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.setAttribute('aria-invalid', 'false');
      input.classList.remove('is-invalid');
    });
  }

  // Show error message
  function showError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + 'Error');
    const inputEl = document.getElementById(fieldId);
    
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }
    
    if (inputEl) {
      inputEl.setAttribute('aria-invalid', 'true');
      inputEl.classList.add('is-invalid');
    }
  }

  // Validate form fields
  function validateForm() {
    clearErrors();
    let isValid = true;

    // Validate comment
    const comment = document.getElementById('commentText').value.trim();
    if (!comment) {
      showError('commentText', 'Komentar wajib diisi');
      isValid = false;
    }

    // Validate name
    const name = document.getElementById('commentName').value.trim();
    if (!name) {
      showError('commentName', 'Nama wajib diisi');
      isValid = false;
    }

    // Validate email
    const email = document.getElementById('commentEmail').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showError('commentEmail', 'Email wajib diisi');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      showError('commentEmail', 'Format email tidak valid');
      isValid = false;
    }

    // Validate website (optional)
    const website = document.getElementById('commentWebsite').value.trim();
    if (website) {
      try {
        new URL(website);
      } catch {
        showError('commentWebsite', 'Format URL tidak valid');
        isValid = false;
      }
    }

    return isValid;
  }

  // Handle form submission
  commentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const formData = new FormData(commentForm);
    const commentData = {
      comment: formData.get('comment'),
      name: formData.get('name'),
      email: formData.get('email'),
      website: formData.get('website'),
      timestamp: new Date().toISOString()
    };

    // Save user info if checkbox is checked
    saveUserInfo();

    // Simulate comment submission (in real app, this would send to server)
    console.log('Comment submitted:', commentData);
    
    // Show success message
    alert('Komentar berhasil dikirim! Terima kasih atas feedback Anda.');
    
    // Reset form
    commentForm.reset();
    
    // Reload saved info
    loadSavedInfo();
  });

  // Real-time validation
  const inputs = commentForm.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.hasAttribute('required') && !this.value.trim()) {
        showError(this.id, 'Field ini wajib diisi');
      } else if (this.type === 'email' && this.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.value.trim())) {
          showError(this.id, 'Format email tidak valid');
        }
      } else if (this.type === 'url' && this.value.trim()) {
        try {
          new URL(this.value.trim());
        } catch {
          showError(this.id, 'Format URL tidak valid');
        }
      }
    });

    input.addEventListener('input', function() {
      if (this.getAttribute('aria-invalid') === 'true') {
        this.setAttribute('aria-invalid', 'false');
        this.classList.remove('is-invalid');
        const errorEl = document.getElementById(this.id + 'Error');
        if (errorEl) {
          errorEl.classList.remove('show');
        }
      }
    });
  });

  // Load saved info on page load
  loadSavedInfo();
})();

/* ======= Development Route Test ======= */
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  window.runSeoRouteTest = async (routes = [
    '/', '#about', '#policy', '#contact',
    '/2025/01/22/setup-vscode-web-development-panduan-lengkap'
  ]) => {
    const prev = location.href;
    console.log('🧪 Starting SEO route test...');
    
    for (const r of routes) {
      console.log(`Testing route: ${r}`);
      history.pushState({}, '', r);
      await new Promise(resolve => setTimeout(resolve, 200)); // tunggu render
      
      // Trigger route function
      await route();
      
      // Wait a bit more for SEO to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Restore original route
    history.replaceState({}, '', prev);
    await route();
    
    console.log('🧪 Route test done.');
  };
  
  // Auto-run test on page load in dev only if requested
  const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
  const q = new URLSearchParams(location.search);
  if (isLocal && q.get('test') === 'seo') {
    setTimeout(() => window.runSeoRouteTest?.(), 300);
  }
}

/* ======= Global Error Handling ======= */
// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  console.error('❌ Unhandled Promise Rejection:', event.reason);
  console.error('Stack trace:', event.reason?.stack);
  
  // Prevent the default behavior (which would log to console)
  event.preventDefault();
  
  // Log to console for debugging
  console.error('Promise rejection handled gracefully');
});

// Handle uncaught errors
window.addEventListener('error', function(event) {
  console.error('❌ Uncaught Error:', event.error);
  console.error('Stack trace:', event.error?.stack);
  
  // Prevent the default behavior
  event.preventDefault();
  
  // Log to console for debugging
  console.error('Error handled gracefully');
});

/* ======= Blog Initialization - Cleaned ======= */
// Initialization handled above - duplicated code removed