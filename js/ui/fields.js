// Small form building blocks (Design System inputs). They only build elements;
// the screen decides what happens when someone types.

import { h } from './dom.js';

let counter = 0;
const uid = (prefix) => `${prefix}-${++counter}`;

// Labelled text input. `onInput(value)` runs on every keystroke.
export function textField({ label, value = '', placeholder = '', field, inputmode, onInput, required = false }) {
  const id = uid('f');
  const input = h('input', {
    class: 'input',
    id,
    type: 'text',
    value,
    placeholder,
    inputmode: inputmode || null,
    autocomplete: 'off',
    'data-field': field || null,
    'aria-required': required ? 'true' : null
  });
  input.value = value;
  input.addEventListener('input', () => onInput(input.value));
  return { element: h('div', { class: 'field' }, h('label', { class: 'field__label', for: id }, label), input), input };
}

// Multi-line text that grows with its content.
export function autoGrow(textarea) {
  const fit = () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight + 2}px`;
  };
  textarea.addEventListener('input', fit);
  requestAnimationFrame(fit);
  return textarea;
}

export function textArea({ label, value = '', placeholder = '', field, onInput, rows = 3 }) {
  const id = uid('f');
  const textarea = autoGrow(h('textarea', {
    class: 'input input--textarea',
    id,
    rows: String(rows),
    placeholder,
    'data-field': field || null
  }));
  textarea.value = value;
  textarea.addEventListener('input', () => onInput(textarea.value));
  return { element: h('div', { class: 'field' }, h('label', { class: 'field__label', for: id }, label), textarea), input: textarea };
}

export function selectField({ label, value, options, field, onChange }) {
  const id = uid('f');
  const select = h('select', { class: 'input input--select', id, 'data-field': field || null },
    options.map(([optionValue, optionLabel]) => h('option', { value: optionValue }, optionLabel))
  );
  select.value = value;
  select.addEventListener('change', () => onChange(select.value));
  return { element: h('div', { class: 'field' }, h('label', { class: 'field__label', for: id }, label), select), input: select };
}
