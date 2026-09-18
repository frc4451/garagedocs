interface InstallPrompt extends Event {
  prompt(): Promise<{ outcome: string }>;
}
export function initializeOffline() {
  const panel = document.querySelector<HTMLElement>('[data-offline-controls]');
  if (!panel) return;
  const status = panel.querySelector<HTMLElement>('[data-offline-status]')!;
  const download = panel.querySelector<HTMLButtonElement>('[data-offline-download]')!;
  const progress = panel.querySelector<HTMLProgressElement>('[data-offline-progress]')!;
  const install = panel.querySelector<HTMLButtonElement>('[data-offline-install]')!;
  const notice = document.querySelector<HTMLElement>('[data-offline-notice]')!;
  const updateButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-offline-update]')];
  // The preferences drawer transforms on mobile; keep the update notice outside it.
  document.body.append(notice);
  const scope = panel.dataset.scope!;
  let registration: ServiceWorkerRegistration | undefined;
  let prompt: InstallPrompt | undefined;
  let applying = false;
  let downloading = false;
  const showUpdate = () => {
    if (!registration?.waiting) return;
    progress.hidden = true;
    downloading = false;
    status.textContent = 'Update ready. Save your code before reloading.';
    updateButtons.forEach(button => button.hidden = false);
    notice.hidden = false;
    download.disabled = false;
  };
  const reportError = () => {
    downloading = false;
    progress.hidden = true;
    download.disabled = false;
    status.textContent = 'Download failed. Check your connection and storage, then retry.';
  };
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    prompt = event as InstallPrompt;
    install.hidden = false;
  });
  install.addEventListener('click', async () => {
    await prompt?.prompt();
    prompt = undefined;
    install.hidden = true;
  });
  window.addEventListener('appinstalled', () => { install.hidden = true; });
  const reflectNetwork = () => {
    document.documentElement.toggleAttribute('data-offline', !navigator.onLine);
  };
  document.querySelector('.offline-footer-link')?.addEventListener('click', () => {
    window.setTimeout(() => panel.scrollIntoView({ block: 'start', behavior: 'instant' }), 250);
  });
  reflectNetwork();
  window.addEventListener('online', () => {
    reflectNetwork();
    if (!downloading && panel.dataset.production === 'true' && 'serviceWorker' in navigator) download.disabled = false;
  });
  window.addEventListener('offline', reflectNetwork);
  if (panel.dataset.production !== 'true') {
    status.textContent = 'Use the live site or production preview to download.';
    return;
  }
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    status.textContent = 'Offline downloads are unavailable here. Try a supported browser on the HTTPS site.';
    return;
  }
  navigator.serviceWorker.addEventListener('message', event => {
    const data = event.data;
    if (data?.type === 'OFFLINE_PROGRESS') {
      downloading = true;
      download.disabled = true;
      progress.hidden = false;
      progress.max = data.total;
      progress.value = data.completed;
      status.textContent = 'Downloading: ' + data.completed + ' of ' + data.total + ' files. Keep this tab open.';
    } else if (data?.type === 'OFFLINE_ERROR') reportError();
    else if (data?.type === 'OFFLINE_READY' || data?.type === 'OFFLINE_STATUS') {
      if (registration?.waiting) { showUpdate(); return; }
      if (downloading && data.type === 'OFFLINE_STATUS') return;
      downloading = false;
      progress.hidden = true;
      download.disabled = false;
      if (data.ready === false) {
        status.textContent = 'Offline copy missing or incomplete. Connect and download again.';
        download.textContent = 'Download again';
      } else {
        status.textContent = 'Ready offline. Clearing site data removes this copy.';
        download.textContent = 'Check for updates';
      }
    }
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (applying) window.location.reload();
    else navigator.serviceWorker.controller?.postMessage({ type: 'OFFLINE_STATUS' });
  });
  const watch = (reg: ServiceWorkerRegistration) => {
    registration = reg;
    const watchWorker = () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed') showUpdate();
        if (worker.state === 'redundant') reportError();
      });
    };
    reg.addEventListener('updatefound', watchWorker);
    watchWorker();
    showUpdate();
  };
  updateButtons.forEach(button => button.addEventListener('click', () => {
    applying = true;
    registration?.waiting?.postMessage({ type: 'APPLY_UPDATE' });
  }));
  document.querySelector('[data-offline-dismiss]')?.addEventListener('click', () => { notice.hidden = true; });
  download.addEventListener('click', async () => {
    download.disabled = true;
    status.textContent = 'Preparing download…';
    try {
      await navigator.storage?.persist?.();
      if (registration) {
        // A missing snapshot needs a fresh install, even if the worker source has not changed.
        if (download.textContent === 'Download again') {
          // A new script URL forces an install even when this build is unchanged.
          // Unregister/register can reuse a worker that still controls an open tab.
          watch(await navigator.serviceWorker.register(scope + 'sw.js?repair=' + Date.now(), { scope, updateViaCache: 'none' }));
          return;
        } else {
          await registration.update();
          if (!registration.installing && !registration.waiting) {
            status.textContent = 'Up to date.';
            download.disabled = false;
          }
          return;
        }
      }
      watch(await navigator.serviceWorker.register(scope + 'sw.js', { scope, updateViaCache: 'none' }));
    } catch { reportError(); }
  });
  void (async () => {
    try {
      const existing = await navigator.serviceWorker.getRegistration(scope);
      if (existing && existing.scope === new URL(scope, location.origin).href) {
        watch(existing);
        existing.active?.postMessage({ type: 'OFFLINE_STATUS' });
        if (navigator.onLine) void existing.update().catch(() => {});
        return;
      }
      const response = await fetch(scope + 'offline-info.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Missing offline snapshot');
      const info = await response.json();
      status.textContent = 'Download size: about ' + Math.ceil(info.bytes / 1048576) + ' MiB.';
      download.disabled = !navigator.onLine;
    } catch {
      status.textContent = 'Connect to download the docs.';
    }
  })();
}
