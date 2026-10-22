(() => {
  const data = window.PORTFOLIO;
  const $ = (s, root = document) => root.querySelector(s);
  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  document.querySelectorAll('[data-name]').forEach(el => el.textContent = data.designer.name);
  $('#year').textContent = new Date().getFullYear();

  const projectGrid = $('#project-grid');
  projectGrid.innerHTML = data.projects.map((p, i) => `<a class="project-card project-card-${i + 1}" href="projects.html#${safe(p.slug)}" aria-label="Открыть проект: ${safe(p.title)}"><span class="project-photo"><img src="${safe(p.cover)}" alt="${safe(p.title)} — ${safe(p.subtitle)}" loading="lazy"><span class="project-open" aria-hidden="true">↗</span></span><span class="project-meta"><span class="project-title">${safe(p.title)}</span><span class="project-kind">${safe(p.rooms.slice(0, 3).join(' · '))}</span><span class="project-description">${safe(p.summary)}</span></span><span class="project-count">${String(p.photoCount).padStart(2, '0')} фото</span></a>`).join('');

  $('#service-list').innerHTML = data.services.map((s,i) => `<article class="service-row"><span class="service-no">0${i+1}</span><h3>${safe(s.title)}</h3><p>${safe(s.text)}</p><span class="service-arrow" aria-hidden="true">↗</span></article>`).join('');
  const reviewGrid = $('#review-grid');
  reviewGrid.innerHTML = data.reviews.map((review, index) => `<article class="review-card"><span class="review-card-mark" aria-hidden="true">“</span><blockquote><p>${safe(review.text)}</p><footer><span class="review-author">${safe(review.name)}</span><span class="review-number">ОТЗЫВ ${String(index + 1).padStart(2, '0')}</span></footer></blockquote></article>`).join('');
  const reviewTotal = data.reviews.length;
  const reviewWord = reviewTotal === 1 ? 'отзыв' : reviewTotal >= 2 && reviewTotal <= 4 ? 'отзыва' : 'отзывов';
  $('#reviews-total').textContent = `${String(reviewTotal).padStart(2, '0')} ${reviewWord} о совместной работе`;

  const d = data.designer; const links = [
    d.whatsapp && {label:'WhatsApp', href:`https://wa.me/${d.whatsapp.replace(/\D/g,'')}`},
    d.telegram && {label:'Telegram', href:`https://t.me/${d.telegram.replace(/^@/,'')}`},
    d.phone && {label:d.phone, href:`tel:${d.phone.replace(/[^+\d]/g,'')}`},
    d.email && {label:d.email, href:`mailto:${d.email}`},
    d.instagram && {label:'Instagram', href:d.instagram.startsWith('http') ? d.instagram : `https://instagram.com/${d.instagram.replace(/^@/,'')}`}
  ].filter(Boolean);
  const contactActions = $('#contact-actions');
  if (contactActions) contactActions.innerHTML = links.length ? `<div class="contact-links">${links.map(x=>`<a href="${safe(x.href)}" ${x.href.startsWith('http')?'target="_blank" rel="noopener"':''}>${safe(x.label)} ↗</a>`).join('')}</div>` : `<p class="contact-hint">Ссылки на мессенджеры добавим после получения актуальных контактов.</p>`;

  const contactForm = $('#contact-form');
  const contactFormStatus = $('#contact-form-status');
  if (contactForm && contactFormStatus) contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    contactFormStatus.hidden = false;
    contactFormStatus.textContent = 'Это макет: данные не отправлены и не сохранены.';
  });

  if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero-eyebrow, .hero h1, .hero-bottom', {y:24, opacity:0, duration:.8, stagger:.12, ease:'power3.out', delay:.12});
    gsap.from('.hero-image', {clipPath:'inset(12% 0 0 0)', scale:1.04, duration:1.2, ease:'power3.out'});
    gsap.utils.toArray('.section-heading, .about-photo, .about-copy, .services-head, .service-row, .reviews-head, .review-stage').forEach(el => gsap.from(el,{y:24,opacity:0,duration:.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}}));
    gsap.utils.toArray('.project-card').forEach(el => gsap.from(el,{y:30,opacity:0,duration:.7,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}}));
  }
})();
