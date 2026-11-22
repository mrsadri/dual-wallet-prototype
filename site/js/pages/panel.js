const STORAGE_KEY = 'dual-wallet-prototype:panel';
const narrow = matchMedia('(max-width: 900px)');
const roomy = matchMedia('(min-width: 1200px)');

function readPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved === 'open';
  } catch {
    // Storage can be blocked; use the default.
  }
  return roomy.matches; // below this, an open panel shrinks the frame too much
}

function savePreference(open) {
  try {
    localStorage.setItem(STORAGE_KEY, open ? 'open' : 'closed');
  } catch {
    // The preference then lasts for this visit only.
  }
}

/** A remembered sidebar on wide screens, a drawer that starts closed on narrow ones. */
export function createPanel({ element, toggle, stage, scrim }) {
  let preferred = readPreference();
  let open = !narrow.matches && preferred;

  function apply() {
    const drawer = open && narrow.matches;
    document.body.classList.toggle('ctl-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    stage.inert = drawer;
    scrim.hidden = !drawer;
  }

  function set(value) {
    const focusWasInside = element.contains(document.activeElement);
    open = value;
    if (!narrow.matches) {
      preferred = value;
      savePreference(value);
    }
    apply();
    if (!value && focusWasInside) toggle.focus();
  }

  narrow.addEventListener('change', () => {
    open = !narrow.matches && preferred;
    apply();
  });
  apply();

  return { set, isOpen: () => open, isDrawer: () => open && narrow.matches, isNarrow: () => narrow.matches };
}
