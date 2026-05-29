// styling-visualize.js — Interactive CSS Visualization

const STYLING_SCENARIOS = {
  'box-model': {
    id: 'box-model', name: 'Box Model',
    desc: 'Learn how padding, border, and margin affect element spacing',
    icon: '\u{1F4E6}',
    svg: '<svg viewBox="0 0 500 340" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;background:#0f172a;border-radius:8px;">\n      <style>.lbl{fill:#94a3b8;font-size:10px;font-family:sans-serif;text-anchor:middle;} .arr{stroke:#64748b;stroke-width:1.5;}</style>\n      <!-- Margin layer (outermost) -->\n      <rect x="40" y="30" width="420" height="280" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6,3" rx="4"/>\n      <text x="250" y="318" class="lbl" fill="#f59e0b">margin</text>\n      <line x1="250" y1="310" x2="250" y2="298" class="arr" stroke="#f59e0b"/>\n      <!-- Border layer -->\n      <rect x="100" y="70" width="300" height="200" fill="none" stroke="#4A90D9" stroke-width="2.5" rx="4"/>\n      <text x="410" y="173" class="lbl" fill="#4A90D9" transform="rotate(90,410,173)">border</text>\n      <line x1="400" y1="173" x2="392" y2="173" class="arr" stroke="#4A90D9"/>\n      <!-- Padding layer -->\n      <rect x="130" y="95" width="240" height="150" fill="rgba(34,197,94,0.1)" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4,2" rx="4"/>\n      <text x="72" y="173" class="lbl" fill="#22c55e" transform="rotate(-90,72,173)">padding</text>\n      <line x1="80" y1="173" x2="88" y2="173" class="arr" stroke="#22c55e"/>\n      <!-- Content area -->\n      <rect x="170" y="130" width="160" height="80" fill="#e44d26" rx="4"/>\n      <text x="250" y="177" class="lbl" fill="#fff" font-size="11" font-weight="600">CONTENT</text>\n      <!-- Labels -->\n      <text x="250" y="20" class="lbl" fill="#f1f5f9" font-size="12" font-weight="700">Box Model</text>\n      <text x="250" y="340" class="lbl" fill="#64748b" font-size="9">Edit CSS in the command box and click Run to see changes</text>\n    </svg>',
    demoHtml: '<div class="box">Content</div>',
    demoStyle: 'body{margin:0;display:flex;justify-content:center;align-items:center;min-height:200px;background:#0f172a;font-family:sans-serif;}',
    defaultCss: '.box {\n  width: 120px;\n  height: 120px;\n  padding: 20px;\n  border: 4px solid #4A90D9;\n  margin: 15px;\n  background: #e44d26;\n  color: white;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 600;\n  border-radius: 4px;\n}'
  },
  'flexbox': {
    id: 'flexbox', name: 'Flexbox',
    desc: 'Learn flex container and item properties',
    icon: '\u{27A1}\u{FE0F}',
    svg: '<svg viewBox="0 0 500 340" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;background:#0f172a;border-radius:8px;">\n      <style>.lbl{fill:#94a3b8;font-size:10px;font-family:sans-serif;text-anchor:middle;} .arr{stroke:#64748b;stroke-width:1.5;}</style>\n      <text x="250" y="20" class="lbl" fill="#f1f5f9" font-size="12" font-weight="700">Flexbox Layout</text>\n      <!-- Main axis arrow -->\n      <line x1="40" y1="170" x2="460" y2="170" stroke="#22c55e" stroke-width="2" marker-end="url(#flexArrow)"/>\n      <text x="250" y="158" class="lbl" fill="#22c55e" font-size="9">Main Axis (justify-content)</text>\n      <!-- Cross axis arrow -->\n      <line x1="250" y1="70" x2="250" y2="300" stroke="#4A90D9" stroke-width="2" marker-end="url(#flexArrowV)"/>\n      <text x="262" y="190" class="lbl" fill="#4A90D9" font-size="9">Cross Axis (align-items)</text>\n      <!-- Flex container outline -->\n      <rect x="60" y="85" width="380" height="180" fill="rgba(74,144,217,0.08)" stroke="#4A90D9" stroke-width="1.5" rx="6" stroke-dasharray="4,2"/>\n      <text x="68" y="78" class="lbl" fill="#4A90D9" font-size="8" text-anchor="start">flex-container</text>\n      <!-- Flex items -->\n      <rect x="85" y="115" width="80" height="120" fill="#e44d26" rx="4"/>\n      <text x="125" y="180" class="lbl" fill="#fff" font-size="10" font-weight="600">1</text>\n      <rect x="190" y="135" width="80" height="80" fill="#f59e0b" rx="4"/>\n      <text x="230" y="180" class="lbl" fill="#fff" font-size="10" font-weight="600">2</text>\n      <rect x="295" y="105" width="80" height="140" fill="#22c55e" rx="4"/>\n      <text x="335" y="180" class="lbl" fill="#fff" font-size="10" font-weight="600">3</text>\n      <!-- Gap label -->\n      <line x1="165" y1="272" x2="190" y2="272" class="arr"/>\n      <line x1="270" y1="272" x2="295" y2="272" class="arr"/>\n      <text x="230" y="284" class="lbl" fill="#64748b" font-size="9">gap</text>\n      <defs>\n        <marker id="flexArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#22c55e"/></marker>\n        <marker id="flexArrowV" viewBox="0 0 10 10" refX="5" refY="8" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L5,10 L10,0 Z" fill="#4A90D9"/></marker>\n      </defs>\n    </svg>',
    demoHtml: '<div class="flex-container"><div class="item">1</div><div class="item">2</div><div class="item">3</div></div>',
    demoStyle: 'body{margin:0;display:flex;justify-content:center;align-items:center;min-height:200px;background:#0f172a;font-family:sans-serif;}',
    defaultCss: '.flex-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 12px;\n  padding: 16px;\n  background: rgba(74,144,217,0.1);\n  border: 1px dashed #4A90D9;\n  border-radius: 8px;\n  min-height: 140px;\n}\n.item {\n  background: #e44d26;\n  color: white;\n  padding: 20px;\n  border-radius: 6px;\n  font-weight: 600;\n  text-align: center;\n  min-width: 50px;\n}'
  },
  'css-grid': {
    id: 'css-grid', name: 'CSS Grid',
    desc: 'Learn CSS Grid layout with template columns, rows, and gap',
    icon: '\u{1F532}',
    svg: '<svg viewBox="0 0 500 340" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;background:#0f172a;border-radius:8px;">\n      <style>.lbl{fill:#94a3b8;font-size:10px;font-family:sans-serif;text-anchor:middle;}</style>\n      <text x="250" y="20" class="lbl" fill="#f1f5f9" font-size="12" font-weight="700">CSS Grid</text>\n      <!-- Grid container -->\n      <rect x="40" y="45" width="420" height="255" fill="rgba(168,85,247,0.06)" stroke="#a855f7" stroke-width="1.5" rx="6" stroke-dasharray="4,2"/>\n      <text x="48" y="38" class="lbl" fill="#a855f7" font-size="8" text-anchor="start">grid-container</text>\n      <!-- Column tracks -->\n      <line x1="173" y1="45" x2="173" y2="300" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,2"/>\n      <line x1="315" y1="45" x2="315" y2="300" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,2"/>\n      <text x="107" y="308" class="lbl" fill="#f59e0b" font-size="8">col 1</text>\n      <text x="245" y="308" class="lbl" fill="#f59e0b" font-size="8">col 2</text>\n      <text x="370" y="308" class="lbl" fill="#f59e0b" font-size="8">col 3</text>\n      <!-- Row tracks -->\n      <line x1="40" y1="130" x2="460" y2="130" stroke="#22c55e" stroke-width="1" stroke-dasharray="3,2"/>\n      <line x1="40" y1="215" x2="460" y2="215" stroke="#22c55e" stroke-width="1" stroke-dasharray="3,2"/>\n      <text x="34" y="90" class="lbl" fill="#22c55e" font-size="8" text-anchor="end">row 1</text>\n      <text x="34" y="175" class="lbl" fill="#22c55e" font-size="8" text-anchor="end">row 2</text>\n      <text x="34" y="258" class="lbl" fill="#22c55e" font-size="8" text-anchor="end">row 3</text>\n      <!-- Grid cells -->\n      <rect x="55" y="58" width="107" height="62" fill="#e44d26" rx="3"/><text x="109" y="94" class="lbl" fill="#fff" font-size="12" font-weight="700">1</text>\n      <rect x="186" y="58" width="119" height="62" fill="#4A90D9" rx="3"/><text x="246" y="94" class="lbl" fill="#fff" font-size="12" font-weight="700">2</text>\n      <rect x="327" y="58" width="123" height="62" fill="#22c55e" rx="3"/><text x="389" y="94" class="lbl" fill="#fff" font-size="12" font-weight="700">3</text>\n      <rect x="55" y="142" width="107" height="63" fill="#f59e0b" rx="3"/><text x="109" y="179" class="lbl" fill="#fff" font-size="12" font-weight="700">4</text>\n      <rect x="186" y="142" width="119" height="63" fill="#a855f7" rx="3"/><text x="246" y="179" class="lbl" fill="#fff" font-size="12" font-weight="700">5</text>\n      <rect x="327" y="142" width="123" height="63" fill="#06b6d4" rx="3"/><text x="389" y="179" class="lbl" fill="#fff" font-size="12" font-weight="700">6</text>\n      <!-- Gap labels -->\n      <line x1="162" y1="322" x2="186" y2="322" stroke="#64748b" stroke-width="1"/><line x1="305" y1="322" x2="327" y2="322" stroke="#64748b" stroke-width="1"/>\n      <text x="245" y="336" class="lbl" fill="#64748b" font-size="8">column-gap / row-gap</text>\n    </svg>',
    demoHtml: '<div class="grid"><div class="cell">1</div><div class="cell">2</div><div class="cell">3</div><div class="cell">4</div><div class="cell">5</div><div class="cell">6</div></div>',
    demoStyle: 'body{margin:0;display:flex;justify-content:center;align-items:center;min-height:200px;background:#0f172a;font-family:sans-serif;}',
    defaultCss: '.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n  padding: 12px;\n  background: rgba(168,85,247,0.08);\n  border: 1px dashed #a855f7;\n  border-radius: 8px;\n  max-width: 400px;\n}\n.cell {\n  background: #4A90D9;\n  color: white;\n  padding: 16px;\n  border-radius: 4px;\n  font-weight: 600;\n  text-align: center;\n}'
  },
  'positioning': {
    id: 'positioning', name: 'Positioning',
    desc: 'Learn relative, absolute, fixed, and sticky positioning',
    icon: '\u{1F4CD}',
    svg: '<svg viewBox="0 0 500 340" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;background:#0f172a;border-radius:8px;">\n      <style>.lbl{fill:#94a3b8;font-size:10px;font-family:sans-serif;text-anchor:middle;}</style>\n      <text x="250" y="20" class="lbl" fill="#f1f5f9" font-size="12" font-weight="700">Positioning</text>\n      <!-- Parent container (relative) -->\n      <rect x="60" y="55" width="380" height="230" fill="rgba(100,116,139,0.15)" stroke="#64748b" stroke-width="1.5" rx="6"/>\n      <text x="68" y="48" class="lbl" fill="#64748b" font-size="8" text-anchor="start">parent (position: relative)</text>\n      <!-- Child absolute -->\n      <rect x="300" y="110" width="110" height="90" fill="#e44d26" rx="4" opacity="0.9"/>\n      <text x="355" y="160" class="lbl" fill="#fff" font-size="9" font-weight="600">absolute</text>\n      <!-- Arrow from top-right corner -->\n      <line x1="300" y1="110" x2="260" y2="88" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,2"/>\n      <text x="248" y="80" class="lbl" fill="#f59e0b" font-size="8">top: 50px; right: 20px;</text>\n      <!-- Fixed element -->\n      <rect x="60" y="258" width="180" height="35" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" stroke-width="1" rx="3"/>\n      <text x="150" y="280" class="lbl" fill="#3b82f6" font-size="8">position: fixed — stays on viewport</text>\n      <!-- Relative offset -->\n      <rect x="80" y="65" width="110" height="75" fill="rgba(234,179,8,0.2)" stroke="#eab308" stroke-width="1" rx="4" stroke-dasharray="3,2"/>\n      <text x="135" y="108" class="lbl" fill="#eab308" font-size="8">relative<br/>offset</text>\n    </svg>',
    demoHtml: '<div class="parent"><div class="child-abs">Absolute</div><div class="child-rel">Relative</div></div>',
    demoStyle: 'body{margin:0;display:flex;justify-content:center;align-items:center;min-height:200px;background:#0f172a;font-family:sans-serif;}',
    defaultCss: '.parent {\n  position: relative;\n  width: 300px;\n  height: 160px;\n  background: rgba(100,116,139,0.15);\n  border: 1px solid #64748b;\n  border-radius: 8px;\n}\n.child-abs {\n  position: absolute;\n  top: 30px;\n  right: 20px;\n  background: #e44d26;\n  color: white;\n  padding: 12px 20px;\n  border-radius: 4px;\n  font-weight: 600;\n}\n.child-rel {\n  position: relative;\n  top: 10px;\n  left: 20px;\n  background: #eab308;\n  color: #000;\n  padding: 10px 16px;\n  border-radius: 4px;\n  font-weight: 600;\n  width: fit-content;\n}'
  },
  'border-shadows': {
    id: 'border-shadows', name: 'Border & Shadows',
    desc: 'Learn border properties, border-radius, and box-shadow',
    icon: '\u{2728}',
    svg: '<svg viewBox="0 0 500 340" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;background:#0f172a;border-radius:8px;">\n      <style>.lbl{fill:#94a3b8;font-size:10px;font-family:sans-serif;text-anchor:middle;}</style>\n      <text x="250" y="20" class="lbl" fill="#f1f5f9" font-size="12" font-weight="700">Border & Box Shadows</text>\n      <!-- Shadow (behind) -->\n      <rect x="175" y="125" width="150" height="150" fill="rgba(0,0,0,0.3)" rx="12" transform="translate(6,6)"/>\n      <!-- Main box -->\n      <rect x="175" y="85" width="150" height="150" fill="#1e293b" stroke="#4A90D9" stroke-width="3" rx="12"/>\n      <!-- Border labels -->\n      <line x1="175" y1="65" x2="175" y2="78" stroke="#4A90D9" stroke-width="1.5"/>\n      <text x="175" y="58" class="lbl" fill="#4A90D9" font-size="8">border-width: 3px</text>\n      <!-- Radius label -->\n      <line x1="175" y1="85" x2="158" y2="76" stroke="#22c55e" stroke-width="1"/>\n      <text x="148" y="70" class="lbl" fill="#22c55e" font-size="8">border-radius: 12px</text>\n      <!-- Shadow label -->\n      <line x1="325" y1="275" x2="350" y2="290" stroke="#f59e0b" stroke-width="1"/>\n      <text x="360" y="294" class="lbl" fill="#f59e0b" font-size="8" text-anchor="start">box-shadow offset</text>\n      <!-- Inner content -->\n      <rect x="212" y="122" width="76" height="76" fill="#e44d26" rx="6"/>\n      <text x="250" y="165" class="lbl" fill="#fff" font-size="10" font-weight="600">content</text>\n      <!-- Color labels -->\n      <text x="250" y="255" class="lbl" fill="#4A90D9" font-size="8">border-color: #4A90D9</text>\n    </svg>',
    demoHtml: '<div class="card">Content</div>',
    demoStyle: 'body{margin:0;display:flex;justify-content:center;align-items:center;min-height:200px;background:#0f172a;font-family:sans-serif;}',
    defaultCss: '.card {\n  width: 160px;\n  height: 160px;\n  background: linear-gradient(135deg, #e44d26, #c0392b);\n  border: 3px solid #4A90D9;\n  border-radius: 12px;\n  box-shadow: 6px 6px 20px rgba(0,0,0,0.4);\n  color: white;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 600;\n}'
  },
  'typography': {
    id: 'typography', name: 'Typography',
    desc: 'Learn font properties, text alignment, and spacing',
    icon: '\u{1F524}',
    svg: '<svg viewBox="0 0 500 340" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;background:#0f172a;border-radius:8px;">\n      <style>.lbl{fill:#94a3b8;font-size:10px;font-family:sans-serif;text-anchor:middle;}</style>\n      <text x="250" y="20" class="lbl" fill="#f1f5f9" font-size="12" font-weight="700">Typography</text>\n      <!-- Sample text -->\n      <text x="250" y="95" fill="#f1f5f9" font-size="30" font-family="sans-serif" font-weight="700" text-anchor="middle">Hello World</text>\n      <text x="250" y="148" fill="#94a3b8" font-size="16" font-family="sans-serif" text-anchor="middle">The quick brown fox jumps over the lazy dog.</text>\n      <text x="250" y="185" fill="#64748b" font-size="13" font-family="sans-serif" text-anchor="middle">Line 2 of text showing line-height spacing between lines.</text>\n      <!-- Lines showing measurements -->\n      <line x1="60" y1="70" x2="440" y2="70" stroke="#4A90D9" stroke-width="1" stroke-dasharray="3,2"/>\n      <text x="70" y="66" class="lbl" fill="#4A90D9" font-size="8" text-anchor="start">font-size: 30px</text>\n      <!-- line-height label -->\n      <line x1="440" y1="70" x2="440" y2="185" stroke="#22c55e" stroke-width="1"/>\n      <text x="448" y="130" class="lbl" fill="#22c55e" font-size="8" text-anchor="start">line-height</text>\n      <!-- letter-spacing -->\n      <line x1="160" y1="95" x2="180" y2="95" stroke="#f59e0b" stroke-width="1.5"/>\n      <line x1="320" y1="95" x2="340" y2="95" stroke="#f59e0b" stroke-width="1.5"/>\n      <text x="250" y="110" class="lbl" fill="#f59e0b" font-size="8">letter-spacing</text>\n      <text x="250" y="325" class="lbl" fill="#64748b" font-size="9">Try changing: font-size, font-weight, line-height, letter-spacing, text-align</text>\n    </svg>',
    demoHtml: '<div class="text-box"><h1>Hello World</h1><p>The quick brown fox jumps over the lazy dog.</p><p>Second line showing line-height spacing between paragraphs.</p></div>',
    demoStyle: 'body{margin:0;display:flex;justify-content:center;align-items:center;min-height:200px;background:#0f172a;font-family:sans-serif;}',
    defaultCss: '.text-box {\n  max-width: 320px;\n  padding: 20px;\n  background: rgba(255,255,255,0.05);\n  border-radius: 8px;\n}\nh1 {\n  font-size: 28px;\n  font-weight: 700;\n  color: #f1f5f9;\n  letter-spacing: 1px;\n  margin: 0 0 10px 0;\n}\np {\n  font-size: 14px;\n  line-height: 1.6;\n  color: #94a3b8;\n  margin: 0 0 8px 0;\n}'
  },
  'colors': {
    id: 'colors', name: 'Colors & Gradients',
    desc: 'Learn color formats, opacity, and gradient backgrounds',
    icon: '\u{1F3A8}',
    svg: '<svg viewBox="0 0 500 340" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;background:#0f172a;border-radius:8px;">\n      <style>.lbl{fill:#94a3b8;font-size:10px;font-family:sans-serif;text-anchor:middle;}</style>\n      <text x="250" y="20" class="lbl" fill="#f1f5f9" font-size="12" font-weight="700">Colors & Gradients</text>\n      <!-- Gradient swatch -->\n      <defs><linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e44d26"/><stop offset="50%" stop-color="#a855f7"/><stop offset="100%" stop-color="#4A90D9"/></linearGradient></defs>\n      <rect x="100" y="45" width="300" height="80" fill="url(#grad1)" rx="8"/>\n      <text x="250" y="92" class="lbl" fill="#fff" font-size="11" font-weight="700">linear-gradient(135deg, #e44d26, #a855f7, #4A90D9)</text>\n      <!-- Color format boxes -->\n      <rect x="60" y="155" width="120" height="50" fill="#22c55e" rx="6"/>\n      <text x="120" y="185" class="lbl" fill="#fff" font-size="9" font-weight="600">HEX #22c55e</text>\n      <rect x="195" y="155" width="120" height="50" fill="rgba(228,77,38,0.7)" rx="6"/>\n      <text x="255" y="185" class="lbl" fill="#fff" font-size="9" font-weight="600">RGBA (0.7)</text>\n      <rect x="325" y="155" width="120" height="50" fill="hsl(210, 65%, 50%)" rx="6"/>\n      <text x="385" y="185" class="lbl" fill="#fff" font-size="9" font-weight="600">HSL 210\u00b0 65% 50%</text>\n      <!-- Opacity scale -->\n      <rect x="60" y="230" width="48" height="30" fill="#e44d26" rx="3"/>\n      <rect x="114" y="230" width="48" height="30" fill="rgba(228,77,38,0.75)" rx="3"/>\n      <rect x="168" y="230" width="48" height="30" fill="rgba(228,77,38,0.5)" rx="3"/>\n      <rect x="222" y="230" width="48" height="30" fill="rgba(228,77,38,0.25)" rx="3"/>\n      <text x="250" y="280" class="lbl" fill="#64748b" font-size="8">opacity: 1.0 \u2192 0.75 \u2192 0.5 \u2192 0.25</text>\n      <text x="250" y="325" class="lbl" fill="#64748b" font-size="9">Try using hex, rgb, rgba, hsl, or linear-gradient()</text>\n    </svg>',
    demoHtml: '<div class="gradient-box">Gradient</div>',
    demoStyle: 'body{margin:0;display:flex;justify-content:center;align-items:center;min-height:200px;background:#0f172a;font-family:sans-serif;}',
    defaultCss: '.gradient-box {\n  width: 280px;\n  height: 100px;\n  background: linear-gradient(135deg, #e44d26, #a855f7, #4A90D9);\n  color: white;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 600;\n  font-size: 18px;\n  border-radius: 8px;\n}'
  },
  'transforms': {
    id: 'transforms', name: 'Transforms & Transitions',
    desc: 'Learn transform properties and CSS transitions',
    icon: '\u{1F504}',
    svg: '<svg viewBox="0 0 500 340" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;background:#0f172a;border-radius:8px;">\n      <style>.lbl{fill:#94a3b8;font-size:10px;font-family:sans-serif;text-anchor:middle;}</style>\n      <text x="250" y="20" class="lbl" fill="#f1f5f9" font-size="12" font-weight="700">Transforms & Transitions</text>\n      <!-- Original position (ghost) -->\n      <rect x="100" y="80" width="80" height="80" fill="rgba(100,116,139,0.3)" stroke="#64748b" stroke-width="1" rx="6" stroke-dasharray="4,2"/>\n      <text x="140" y="125" class="lbl" fill="#64748b" font-size="8">original</text>\n      <!-- Transformed box -->\n      <rect x="200" y="100" width="80" height="80" fill="#e44d26" rx="8" transform="rotate(15, 240, 140)"/>\n      <text x="240" y="145" class="lbl" fill="#fff" font-size="9" font-weight="600">rotate</text>\n      <!-- Scale box -->\n      <rect x="320" y="60" width="60" height="60" fill="#4A90D9" rx="6" transform="scale(1.3) translate(-72, 16)"/>\n      <text x="355" y="175" class="lbl" fill="#4A90D9" font-size="9">scale(1.3)</text>\n      <!-- Transition timeline -->\n      <line x1="100" y1="270" x2="400" y2="270" stroke="#64748b" stroke-width="1.5"/>\n      <circle cx="250" cy="270" r="6" fill="#22c55e"/>\n      <text x="250" y="258" class="lbl" fill="#22c55e" font-size="8">transition: 0.3s ease</text>\n      <text x="100" y="290" class="lbl" fill="#64748b" font-size="8">start</text>\n      <text x="400" y="290" class="lbl" fill="#64748b" font-size="8">end</text>\n      <text x="250" y="325" class="lbl" fill="#64748b" font-size="9">Try: transform (rotate, scale, translate) and transition properties</text>\n    </svg>',
    demoHtml: '<div class="transform-box">Hover me</div>',
    demoStyle: 'body{margin:0;display:flex;justify-content:center;align-items:center;min-height:200px;background:#0f172a;font-family:sans-serif;}',
    defaultCss: '.transform-box {\n  width: 120px;\n  height: 120px;\n  background: #e44d26;\n  color: white;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 600;\n  border-radius: 8px;\n  transition: transform 0.3s ease, background 0.3s ease;\n}\n.transform-box:hover {\n  transform: rotate(15deg) scale(1.1);\n  background: #4A90D9;\n}'
  }
};

const SCENARIO_ORDER = ['box-model', 'flexbox', 'css-grid', 'positioning', 'border-shadows', 'typography', 'colors', 'transforms'];

let stylingCurrentScenario = 'box-model';

function initStylingVisualize() {
    const appEl = document.getElementById('app');
    appEl.className = 'styling-mode';
    currentLang = 'styling';
    document.getElementById('header-title').innerText = 'STYLING';
    document.querySelectorAll('.selector button').forEach(b => b.classList.remove('active'));
    const navBtn = document.getElementById('nav-styling');
    if (navBtn) navBtn.classList.add('active');
    document.getElementById('level-bar').style.display = 'none';
    document.getElementById('schemaDesigner').classList.remove('open');
    document.getElementById('compiler-output').style.display = 'none';
    document.getElementById('compiler-buttons').style.display = 'none';
    renderScenarioList();
    loadScenario('box-model');
}

function renderScenarioList() {
    const list = document.getElementById('topic-list');
    let html = '<div style="padding:4px 0;font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Scenarios</div>';
    for (const id of SCENARIO_ORDER) {
        const s = STYLING_SCENARIOS[id];
        const active = stylingCurrentScenario === id ? ' active-topic' : '';
        html += '<button class="item-btn' + active + '" id="btn-' + id + '" onclick="loadScenario(\'' + id + '\')">\n          <span class="topic-name">' + s.icon + ' ' + s.name + '</span>\n        </button>';
    }
    list.innerHTML = html;
}

function loadScenario(id) {
    const s = STYLING_SCENARIOS[id];
    if (!s) return;
    stylingCurrentScenario = id;
    document.querySelectorAll('.item-btn').forEach(b => b.classList.remove('active-topic'));
    const btn = document.getElementById('btn-' + id);
    if (btn) btn.classList.add('active-topic');

    document.getElementById('explanation').innerHTML = s.svg;
    document.getElementById('editor').value = s.defaultCss;
    updateHighlight();
    renderPreview(s.demoHtml, s.defaultCss, s.demoStyle);
}

function renderPreview(demoHtml, cssCode, demoStyle) {
    const out = document.getElementById('output');
    const fullHtml = '<html><head><meta charset="UTF-8"><style>' + demoStyle + '\n' + cssCode + '</style></head><body>' + demoHtml + '</body></html>';
    const escaped = fullHtml
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    out.innerHTML = '<iframe srcdoc="' + escaped + '" style="width:100%;height:100%;border:none;background:#fff;border-radius:4px;"></iframe>';
}

function processStylingCommand(cssCode) {
    const s = STYLING_SCENARIOS[stylingCurrentScenario];
    if (!s) {
        document.getElementById('output').innerText = '// No scenario loaded. Click a scenario first.';
        return;
    }
    renderPreview(s.demoHtml, cssCode, s.demoStyle);
}
