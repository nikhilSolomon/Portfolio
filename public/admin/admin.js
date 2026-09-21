(() => {
  document.getElementById('sideToggle')?.addEventListener('click', () => document.body.classList.toggle('side-open'));
  document.querySelectorAll('form[data-confirm]').forEach(f => f.addEventListener('submit', e => { if (!confirm(f.dataset.confirm)) e.preventDefault(); }));

  // Drag-to-reorder projects
  const list = document.getElementById('plist');
  if (list) {
    let dragging = null;
    list.addEventListener('dragstart', e => { dragging = e.target.closest('li'); dragging?.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    list.addEventListener('dragend', () => { dragging?.classList.remove('dragging'); dragging = null; save(); });
    list.addEventListener('dragover', e => { e.preventDefault(); const li = e.target.closest('li'); if (!li || li === dragging) return; const r = li.getBoundingClientRect(); const after = e.clientY > r.top + r.height / 2; li.parentNode.insertBefore(dragging, after ? li.nextSibling : li); });
    async function save() { const ids = [...list.querySelectorAll('li')].map(li => li.dataset.id);
      const r = await fetch('/admin/projects/reorder', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-csrf-token': list.dataset.csrf }, body: JSON.stringify({ ids }) });
      if (!r.ok) alert('Could not save the new order. Reload and try again.'); }
  }

  // Slug preview from title
  const title = document.querySelector('input[name=title]'), slug = document.querySelector('input[name=slug]');
  if (title && slug && !slug.value) title.addEventListener('input', () => { slug.placeholder = title.value.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-'); });
})();
