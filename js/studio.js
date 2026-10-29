(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); nav.classList.remove('open'); };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('open', open);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => { if (!e.target.closest('.nav-wrap')) closeMenu(); });
  nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);

  const projects = JSON.parse(document.querySelector('#project-data').textContent);
  const dialog = document.querySelector('#project-dialog');
  document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
    const project = projects[Number(button.dataset.project)];
    const picture = document.querySelector('#dialog-image');
    picture.src = project[3]; picture.alt = `${project[0]} project preview`;
    document.querySelector('#dialog-category').textContent = project[1];
    document.querySelector('#dialog-title').textContent = project[0];
    document.querySelector('#dialog-description').textContent = project[2];
    document.querySelector('#dialog-contact').href = `contact-us.html?project=${encodeURIComponent(project[0])}`;
    dialog.showModal(); document.body.classList.add('dialog-open');
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));

  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button)); });
    let count = 0;
    document.querySelectorAll('.project[data-category]').forEach(card => { card.hidden = button.dataset.filter !== 'All projects' && card.dataset.category !== button.dataset.filter; if (!card.hidden) count++; });
    document.querySelector('#filter-status').textContent = `${count} projects shown`;
  }));

  document.querySelectorAll('[data-billing]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-billing]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    document.querySelectorAll('[data-monthly]').forEach(price => { price.textContent = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(price.dataset[button.dataset.billing])); });
    document.querySelectorAll('.billing-note').forEach(note => { note.textContent = button.dataset.billing === 'yearly' ? 'Monthly equivalent, billed annually' : 'Billed monthly'; });
  }));

  const form = document.querySelector('#project-form');
  if (form) {
    const project = new URLSearchParams(location.search).get('project');
    if (project) form.elements.message.value = `I would like to discuss ${project}.\n\n`;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      const message = `Hello Codly India!\n\nName: ${values.get('name')}\nEmail: ${values.get('email')}\nCompany: ${values.get('company') || 'Not specified'}\nService: ${values.get('service')}\nBudget: ${values.get('budget')}\n\n${values.get('message')}`;
      const link = document.createElement('a');
      link.href = `https://wa.me/916297247367?text=${encodeURIComponent(message)}`; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.click();
      document.querySelector('#form-status').textContent = 'Your WhatsApp draft is ready. Review and send it in WhatsApp to complete your enquiry.';
    });
  }
})();
