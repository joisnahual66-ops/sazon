// Bottom navigation (Design System primitive). Tabs are visual only until
// navigation between screens is built.

import { h, icon } from './dom.js';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'recipes', label: 'My Recipes', icon: 'book' },
  { key: 'add' },
  { key: 'categories', label: 'Categories', icon: 'grid' },
  { key: 'profile', label: 'Profile', icon: 'user' }
];

export function bottomNav(current) {
  return h('nav', { class: 'bottom-nav', 'aria-label': 'Main' },
    TABS.map((tab) => tab.key === 'add'
      ? h('button', { class: 'bottom-nav__add', type: 'button', 'aria-label': 'New recipe' }, icon('plus'))
      : h('button', {
          class: 'bottom-nav__item',
          type: 'button',
          'aria-current': tab.key === current ? 'page' : null
        }, icon(tab.icon), tab.label)
    )
  );
}
