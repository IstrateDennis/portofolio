// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Smooth scroll focus fix
document.querySelectorAll('a[href^="#"]').forEach(a=>{
a.addEventListener('click', e=>{
    const id = a.getAttribute('href').slice(1);
    if(!id) return;
    const el = document.getElementById(id);
    if(el){
    e.preventDefault();
    el.scrollIntoView({behavior:'smooth', block:'start'});
    setTimeout(()=>el.setAttribute('tabindex','-1'), 300);
    }
})
});

// Download CV placeholder (creates a simple PDF blob)
function downloadCV(e){
e.preventDefault();
const text = [
    'Istrate Dennis — Curriculum Vitae',
    '',
    'Profile:',
    'Architecture graduate passionate about adaptive reuse, urban regeneration, and sustainable design.',
    '',
    'Education:',
    '— B.Arch / M.Arch, University of Architecture',
    '',
    'Selected Skills:',
    'Revit, AutoCAD, Rhino + Grasshopper, SketchUp, Twinmotion, Adobe Suite',
    '',
    'Contact: dennis.istrate@example.com'
].join('\n');

// Create a minimal PDF (very simple, text-only)
const pdf = minimalPDF(text);
const blob = new Blob([pdf], {type:'application/pdf'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url; a.download = 'Istrate_Dennis_CV.pdf';
document.body.appendChild(a); a.click(); a.remove();
URL.revokeObjectURL(url);
}
window.downloadCV = downloadCV;

// Minimal PDF generator (monospace, single page)
function minimalPDF(text){
// This is a super minimal PDF writer for a single page with text lines.
const lines = text.split('\n').map(l=>l.replace(/\r/g,''));
const objects = [];
const xref = [];
function addObject(str){ xref.push(lengthSoFar); objects.push(str); lengthSoFar += (str.length); }
function pdfEscape(s){ return s.replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)'); }

let lengthSoFar = 0;
const header = '%PDF-1.4\n';
lengthSoFar += header.length;

// 1: Catalog
addObject('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
// 2: Pages
addObject('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
// 3: Page
addObject('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n');
// 4: Contents (we will fill later)
// Build content stream
const top = 800;
const leading = 16;
let y = top;
let content = 'BT /F1 10 Tf 50 '+y+' Td 0 0 0 rg\n';
for(const l of lines){
    content += '('+pdfEscape(l)+') Tj T* \n';
}
content += 'ET\n';
const stream = '4 0 obj\n<< /Length '+content.length+' >>\nstream\n'+content+'endstream\nendobj\n';
addObject(stream);
// 5: Font
addObject('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n');

// XREF
let xrefStart = lengthSoFar;
let xrefStr = 'xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';
let pos = header.length;
for(const off of xref){
    xrefStr += (off.toString().padStart(10,'0')+' 00000 n \n');
}
const trailer = 'trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+(xrefStart)+'\n%%EOF';
const full = header + objects.join('') + xrefStr + trailer;
return new TextEncoder().encode(full);
}

// Scroll reveal
const io = new IntersectionObserver(entries=>{
entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
});
}, {threshold:.15});
document.querySelectorAll('.reveal').forEach(el=> io.observe(el));

// Load Projects dynamically from the globally available projectsData array
function renderProjects() {
  const grid = document.getElementById('projectGrid');
  if(!grid || typeof projectsData === 'undefined') return;
  
  projectsData.forEach(p => {
    const article = document.createElement('article');
    article.className = 'project reveal';
    
    // Determine the thumbnail style based on whether an image is provided
    const thumbStyle = p.image 
      ? `background-image: url('assets/projects/${p.image}'); background-size: cover; background-position: center;` 
      : '';
      
    article.innerHTML = `
      <div class="thumb" aria-hidden="true" style="${thumbStyle}"></div>
      <div class="body">
        <h3>${p.title}</h3>
        <div class="meta">${p.subtitle}</div>
        <p class="meta">${p.description}</p>
        <a href="assets/projects/${p.pdfFile}" target="_blank" class="open" aria-label="Open PDF for ${p.title}">
          View more
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13m0 0-5-5m5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </a>
      </div>
    `;
    
    grid.appendChild(article);
    
    // Observe for reveal animation
    io.observe(article);
    
    // Add 3D tilt effect
    article.addEventListener('mousemove', (e)=>{
        const r = article.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        article.style.transform = `rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateY(-4px)`;
    });
    article.addEventListener('mouseleave', ()=> article.style.transform = '');
  });
}

renderProjects();