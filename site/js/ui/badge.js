import { NOTES } from '../content/notes.js';

/** Static badge, for use inside another control. */
export const BS = (...ids) => ids.filter(Boolean).map(id => `<span class="bdg" data-act="badge" data-b="${id}" title="${NOTES[id] || ''}">${id}</span>`).join('');

export const B = (...ids) => ids.filter(Boolean).map(id => `<button type="button" class="bdg" data-act="badge" data-b="${id}" title="${NOTES[id] || ''}">${id}</button>`).join('');
