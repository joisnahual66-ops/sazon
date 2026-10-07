// "Photo" area of the Create/Edit form: add, preview, replace, remove.
// It only shows things; the page decides how a picked file is processed and kept.
//   initial  — { url, info } for a photo the recipe already has, or null
//   onPick   — async (file) → { url, info }   (throws to show an error)
//   onRemove — () → void

import { h, icon } from './dom.js';

export function photoField({ initial, onPick, onRemove }) {
  const input = h('input', { type: 'file', accept: 'image/*', hidden: true });
  const body = h('div', { class: 'pf__body' });
  const message = h('p', { class: 'pf__message', role: 'status', 'aria-live': 'polite' });

  let current = initial; // { url, info } or null

  const choose = () => {
    input.value = '';
    input.click();
  };

  function showEmpty() {
    const add = h('button', { class: 'pf__add', type: 'button' },
      icon('camera'),
      h('span', { class: 'pf__add-title' }, 'Add photo'),
      h('span', { class: 'pf__add-hint' }, 'Camera or gallery')
    );
    add.addEventListener('click', choose);
    body.replaceChildren(add);
  }

  function showPhoto() {
    const replace = h('button', { class: 'btn btn--secondary', type: 'button' }, icon('refresh', 'icon--sm'), 'Replace');
    replace.addEventListener('click', choose);
    const remove = h('button', { class: 'btn btn--secondary', type: 'button' }, icon('trash', 'icon--sm'), 'Remove');
    remove.addEventListener('click', () => {
      current = null;
      message.textContent = '';
      onRemove();
      showEmpty();
    });
    body.replaceChildren(
      h('img', { class: 'pf__preview', src: current.url, alt: 'Recipe photo preview' }),
      h('div', { class: 'pf__actions' }, replace, remove),
      current.info ? h('p', { class: 'pf__info' }, current.info) : null
    );
  }

  function showBusy() {
    body.replaceChildren(h('div', { class: 'pf__busy' }, 'Preparing photo…'));
  }

  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const before = current;
    message.textContent = '';
    showBusy();
    try {
      current = await onPick(file);
      showPhoto();
    } catch (error) {
      current = before;
      message.textContent = error && error.userMessage ? error.userMessage : 'That photo couldn’t be used. Please try another one.';
      if (current) showPhoto(); else showEmpty();
    }
  });

  if (current) showPhoto(); else showEmpty();

  return h('section', { class: 'rf-card pf' },
    h('h2', { class: 't-section' }, 'Photo'),
    body,
    message,
    input
  );
}
