// Create/Edit Recipe form (D-059).
// The draft object passed in is the single source of truth:
//   • typing updates the draft and never redraws anything;
//   • adding or removing an ingredient or step redraws only that list.
// The screen never talks to the database; the page decides what Save does.

import { h, icon } from '../ui/dom.js';
import { textField, textArea, selectField, autoGrow } from '../ui/fields.js';
import { emptyIngredient, emptyStep } from '../model/recipe.js';
import { UNIT_GROUPS, isKnownUnit } from '../model/units.js';

const CUSTOM = '__custom';

const SOURCE_OPTIONS = [
  ['own', 'My own recipe'],
  ['person', 'From a person'],
  ['book', 'From a book'],
  ['website', 'From a website'],
  ['other', 'Other source']
];

const SOURCE_NAME_LABEL = {
  person: 'Who shared it?',
  book: 'Book title',
  website: 'Website name',
  other: 'Source'
};

function card(title, ...children) {
  return h('section', { class: 'rf-card' }, h('h2', { class: 't-section' }, title), children);
}

/* ---------- Ingredients ---------- */

function unitSelect(item, amountInput) {
  const known = isKnownUnit(item.unit);
  const select = h('select', { class: 'input input--select rf-ing__unit', 'aria-label': 'Unit' },
    UNIT_GROUPS.map((group) =>
      h('optgroup', { label: group.label }, group.units.map(([code, label]) => h('option', { value: code }, label)))
    ),
    h('optgroup', { label: 'Custom' }, h('option', { value: CUSTOM }, 'Other unit…'))
  );
  select.value = known ? item.unit : CUSTOM;

  const custom = h('input', {
    class: 'input rf-ing__custom',
    type: 'text',
    placeholder: 'Unit, e.g. handful',
    'aria-label': 'Custom unit',
    autocomplete: 'off'
  });
  custom.value = known ? '' : item.unit;
  custom.hidden = known;

  const sync = () => {
    const toTaste = select.value === 'to_taste';
    amountInput.disabled = toTaste;
    amountInput.placeholder = toTaste ? '—' : 'Amount';
  };

  select.addEventListener('change', () => {
    const isCustom = select.value === CUSTOM;
    custom.hidden = !isCustom;
    item.unit = isCustom ? custom.value.trim() : select.value;
    if (isCustom) custom.focus();
    sync();
  });
  custom.addEventListener('input', () => { item.unit = custom.value.trim(); });
  sync();

  return { select, custom };
}

function ingredientRow(item, index) {
  const name = h('input', {
    class: 'input',
    type: 'text',
    placeholder: 'Ingredient, e.g. Chicken breast',
    'aria-label': `Ingredient ${index + 1} name`,
    autocomplete: 'off',
    'data-field': `ingredient:${item.id}:name`
  });
  name.value = item.name;
  name.addEventListener('input', () => { item.name = name.value; });

  const amount = h('input', {
    class: 'input rf-ing__amount',
    type: 'text',
    placeholder: 'Amount',
    'aria-label': `Ingredient ${index + 1} amount`,
    autocomplete: 'off',
    'data-field': `ingredient:${item.id}:amount`
  });
  amount.value = item.amountText;
  amount.addEventListener('input', () => { item.amountText = amount.value; });

  const { select, custom } = unitSelect(item, amount);

  const note = h('input', { class: 'input', type: 'text', placeholder: 'Note, e.g. finely chopped', 'aria-label': 'Note', autocomplete: 'off' });
  note.value = item.note;
  note.addEventListener('input', () => { item.note = note.value; });

  const section = h('input', { class: 'input', type: 'text', placeholder: 'Group, e.g. For the salsa', 'aria-label': 'Group', autocomplete: 'off' });
  section.value = item.section;
  section.addEventListener('input', () => { item.section = section.value; });

  const more = h('details', { class: 'rf-more', open: item.note || item.section ? true : null },
    h('summary', { class: 'rf-more__toggle' }, 'Note & group', icon('chevron-down', 'icon--sm')),
    h('div', { class: 'rf-more__body' }, note, section)
  );

  return h('li', { class: 'rf-ing' },
    h('div', { class: 'rf-ing__top' },
      name,
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': `Remove ingredient ${index + 1}` }, icon('close'))
    ),
    h('div', { class: 'rf-ing__amount-row' }, amount, select),
    custom,
    more
  );
}

function ingredientsEditor(draft) {
  const list = h('ul', { class: 'rf-list' });

  const render = (focusLast = false) => {
    list.replaceChildren(...draft.ingredients.map((item, i) => {
      const row = ingredientRow(item, i);
      row.querySelector('.rf-ing__top .icon-btn').addEventListener('click', () => {
        draft.ingredients.splice(i, 1);
        render();
      });
      return row;
    }));
    if (focusLast && list.lastElementChild) list.lastElementChild.querySelector('input').focus();
  };

  const add = h('button', { class: 'btn btn--secondary rf-add', type: 'button' }, icon('plus'), 'Add ingredient');
  add.addEventListener('click', () => {
    draft.ingredients.push(emptyIngredient());
    render(true);
  });

  render();
  return card('Ingredients',
    h('p', { class: 't-meta t-soft' }, 'Amounts like 2, 1/2, 0.5 or 2-3 all work.'),
    list,
    add
  );
}

/* ---------- Steps ---------- */

function stepsEditor(draft) {
  const list = h('ol', { class: 'rf-list' });

  const render = (focusLast = false) => {
    list.replaceChildren(...draft.steps.map((step, i) => {
      const text = autoGrow(h('textarea', {
        class: 'input input--textarea',
        rows: '2',
        placeholder: i === 0 ? 'e.g. Season the chicken and cook it in a hot pan.' : 'Next step',
        'aria-label': `Step ${i + 1}`
      }));
      text.value = step.text;
      text.addEventListener('input', () => { step.text = text.value; });

      const remove = h('button', { class: 'icon-btn', type: 'button', 'aria-label': `Remove step ${i + 1}` }, icon('close'));
      remove.addEventListener('click', () => {
        draft.steps.splice(i, 1);
        render();
      });

      return h('li', { class: 'rf-step' },
        h('span', { class: 'rf-step__number', 'aria-hidden': 'true' }, String(i + 1)),
        text,
        remove
      );
    }));
    if (focusLast && list.lastElementChild) list.lastElementChild.querySelector('textarea').focus();
  };

  const add = h('button', { class: 'btn btn--secondary rf-add', type: 'button' }, icon('plus'), 'Add step');
  add.addEventListener('click', () => {
    draft.steps.push(emptyStep());
    render(true);
  });

  render();
  return card('Steps', list, add);
}

/* ---------- Source ---------- */

function sourceEditor(draft) {
  const p = draft.provenance;

  const name = textField({ label: SOURCE_NAME_LABEL[p.sourceType] || 'Source', value: p.sourceName, onInput: (v) => { p.sourceName = v; } });
  const url = textField({ label: 'Web address (optional)', value: p.sourceUrl, placeholder: 'e.g. example.com/recipe', onInput: (v) => { p.sourceUrl = v; } });
  url.input.type = 'url';

  const sync = () => {
    name.element.hidden = p.sourceType === 'own';
    name.element.querySelector('label').textContent = SOURCE_NAME_LABEL[p.sourceType] || 'Source';
    url.element.hidden = p.sourceType !== 'website';
  };

  const type = selectField({
    label: 'Where is it from?',
    value: p.sourceType,
    options: SOURCE_OPTIONS,
    onChange: (v) => { p.sourceType = v; sync(); }
  });

  sync();
  return card('Source', type.element, name.element, url.element);
}

/* ---------- Screen ---------- */

export function renderRecipeForm(draft, { isNew, onSave, onCancel }) {
  const errorBox = h('div', { class: 'rf-errors', role: 'alert', hidden: true });

  const save = (extraClass = '') => {
    const button = h('button', { class: `btn btn--primary ${extraClass}`.trim(), type: 'button' }, 'Save');
    button.addEventListener('click', () => onSave());
    return button;
  };

  const close = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close without saving' }, icon('close'));
  close.addEventListener('click', () => onCancel());

  const title = textField({ label: 'Recipe name', value: draft.title, placeholder: 'e.g. Tacos de pollo', field: 'title', required: true, onInput: (v) => { draft.title = v; } });
  const description = textArea({ label: 'Short description (optional)', value: draft.description, rows: 2, onInput: (v) => { draft.description = v; } });

  const servings = textField({ label: 'Servings', value: draft.servings, field: 'servings', inputmode: 'numeric', required: true, onInput: (v) => { draft.servings = v; } });
  const prep = textField({ label: 'Prep (min)', value: draft.prepMinutes, field: 'prepMinutes', inputmode: 'numeric', placeholder: 'optional', onInput: (v) => { draft.prepMinutes = v; } });
  const cook = textField({ label: 'Cook (min)', value: draft.cookMinutes, field: 'cookMinutes', inputmode: 'numeric', placeholder: 'optional', onInput: (v) => { draft.cookMinutes = v; } });
  const calories = textField({ label: 'kcal per serving', value: draft.caloriesPerServing, field: 'caloriesPerServing', inputmode: 'decimal', placeholder: 'optional', onInput: (v) => { draft.caloriesPerServing = v; } });

  const notes = textArea({ label: 'Tips, storage, variations… (optional)', value: draft.notes, rows: 3, onInput: (v) => { draft.notes = v; } });

  const saveTop = save('rf-save-top');
  const saveBottom = save('rf-save-bottom');

  const element = h('main', { class: 'rf' },
    h('header', { class: 'rf-top' },
      close,
      h('h1', { class: 't-section rf-top__title' }, isNew ? 'New recipe' : 'Edit recipe'),
      saveTop
    ),
    errorBox,
    h('section', { class: 'rf-card' }, title.element, description.element),
    card('Basics', h('div', { class: 'rf-grid' }, servings.element, prep.element, cook.element, calories.element)),
    ingredientsEditor(draft),
    stepsEditor(draft),
    card('Notes', notes.element),
    sourceEditor(draft),
    saveBottom
  );

  // Typing in a field that was marked wrong clears the mark.
  element.addEventListener('input', (event) => {
    if (event.target.getAttribute('aria-invalid') === 'true') event.target.removeAttribute('aria-invalid');
  });

  function showErrors(errors) {
    element.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.removeAttribute('aria-invalid'));
    errorBox.replaceChildren(
      h('p', { class: 'rf-errors__title' }, errors.length === 1 ? 'One thing to fix before saving:' : `${errors.length} things to fix before saving:`),
      h('ul', {}, errors.map((error) => {
        const target = error.field ? element.querySelector(`[data-field="${CSS.escape(error.field)}"]`) : null;
        if (target) target.setAttribute('aria-invalid', 'true');
        const item = h('li', {}, error.message);
        if (target) {
          const link = h('button', { class: 'rf-errors__link', type: 'button' }, error.message);
          link.addEventListener('click', () => { target.focus(); target.scrollIntoView({ block: 'center' }); });
          return h('li', {}, link);
        }
        return item;
      }))
    );
    errorBox.hidden = false;
    errorBox.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function setSaving(saving) {
    [saveTop, saveBottom].forEach((b) => {
      b.disabled = saving;
      b.textContent = saving ? 'Saving…' : 'Save';
    });
  }

  return { element, showErrors, setSaving };
}
