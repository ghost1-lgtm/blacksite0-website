/* Progressive enhancement for Theme 03. No business/form logic is replaced. */
(() => {
  'use strict';
  const body = document.body;
  const terminal = document.getElementById('psTerminal');
  const boot = document.getElementById('psBoot');
  const atmosphere = document.querySelector('.ps-atmosphere');
  const form = document.getElementById('psCommandForm');
  const input = document.getElementById('psCommand');
  const output = document.getElementById('psOutput');
  if (!terminal || !boot || !form || !input || !output) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let editorActive = false;
  let bootTimer;
  let activationTimer;
  function finishBoot() {
    window.clearTimeout(bootTimer);
    boot.hidden = true;
  }
  function syncTheme() {
    editorActive = body.dataset.fontMode === 'developer';
    terminal.hidden = !editorActive;
    if (atmosphere) atmosphere.hidden = !editorActive;
    body.classList.toggle('ps-paused', editorActive && document.hidden);
    if (!editorActive) {
      window.clearTimeout(activationTimer);
      terminal.open = false;
      finishBoot();
    }
  }
  function showBoot() {
    // Nonmodal, no input blocking, no focus change, no replay on scroll or reload.
    finishBoot();
    if (motion.matches || document.hidden) return;
    boot.hidden = false;
    bootTimer = window.setTimeout(finishBoot, 1250);
  }
  document.querySelector('[data-font-choice="developer"]')?.addEventListener('click', () => {
    // Capture the prior mode before the shared selector's bubble listener runs.
    // Defer one task: microtasks/observers can run between native event listeners.
    const wasActive = body.dataset.fontMode === 'developer';
    window.clearTimeout(activationTimer);
    activationTimer = window.setTimeout(() => {
      syncTheme();
      if (editorActive && !wasActive) showBoot();
    }, 0);
  }, {capture:true});
  new MutationObserver(syncTheme).observe(body, {attributes:true, attributeFilter:['data-font-mode']});
  document.addEventListener('visibilitychange', () => {
    syncTheme();
    if (document.hidden) finishBoot();
  });
  motion.addEventListener('change', () => { if (motion.matches) finishBoot(); });
  syncTheme();

  function print(message, type = '') {
    const line = document.createElement('p');
    line.textContent = message; // User input is always text; never parsed as markup.
    if (type) line.className = type;
    output.append(line);
    while (output.children.length > 8) output.firstElementChild.remove();
    output.scrollTop = output.scrollHeight;
  }
  function navigate(id) {
    const section = document.getElementById(id);
    if (!section) { print('This section is unavailable. Please use the website navigation.', 'ps-error'); return; }
    terminal.open = false;
    window.location.hash = id;
    section.setAttribute('tabindex', '-1');
    section.focus({preventScroll:true});
  }
  // Exact allowlist. These commands cannot execute JavaScript, shell code or requests.
  const commands = new Map([
    ['help', () => print('help · services · portfolio · contact · home · clear\nNavigation only. No system commands or external execution.')],
    ['services', () => navigate('capabilities')],
    ['portfolio', () => print('A public portfolio is not currently published. Use contact to request relevant work examples.')],
    ['contact', () => navigate('contact')],
    ['home', () => navigate('home')],
    ['clear', () => output.replaceChildren()]
  ]);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!editorActive) return;
    const command = input.value.trim().toLowerCase().slice(0,80);
    input.value = '';
    if (!command) return;
    print(`PS > ${command}`, 'ps-command');
    const action = commands.get(command);
    if (action) action();
    else print('Command not recognised. Type help for available navigation commands.', 'ps-error');
  });
  terminal.addEventListener('keydown', event => {
    if (event.key === 'Escape' && terminal.open) {
      terminal.open = false;
      terminal.querySelector('summary').focus();
    }
  });
})();
