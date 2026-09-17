/**
 * Start the Java runtime as soon as the document is parsed, independently of React.
 *
 * The runnable example controls hydrate when the page loads. The runtime (CheerpJ,
 * the staged JDK and the compiler server) takes longer to become ready, so this
 * starts that work from an inline module in the page head:
 * it looks for runnable markup, starts the preload, and reports progress in a
 * small toast (`[data-jp-runtime-status]`) that dismisses itself once the runtime
 * is ready, so the reader knows Run will work without the lesson being pushed down.
 *
 * Idempotent: the preload is a shared promise in `runnerClient`, so the React
 * islands calling `preloadJavaRuntimeSoon()` on hydration join the same start.
 */
import { preloadJavaRuntimeSoon } from './preloadJavaRuntime';

export function installJavaPageStartup(doc: Document = document): void {
  let started = false;
  const start = () => {
    if (started || !doc.querySelector('[data-jp-example], [data-jp-playground]')) return;
    started = true;
    const toast = doc.querySelector<HTMLElement>('[data-jp-runtime-status]');
    const text = toast?.querySelector<HTMLElement>('.jp-runtime-toast-text') ?? toast;
    let hideTimer: number | undefined;
    const show = (message: string, state: 'loading' | 'ready' | 'error') => {
      if (!toast || !text) return;
      window.clearTimeout(hideTimer);
      toast.hidden = false;
      toast.dataset.state = state;
      text.textContent = message;
      // Next frame so the transition runs from the hidden state.
      requestAnimationFrame(() => toast.classList.add('jp-runtime-toast--visible'));
    };
    const dismiss = (afterMs: number) => {
      if (!toast) return;
      hideTimer = window.setTimeout(() => {
        toast.classList.remove('jp-runtime-toast--visible');
        const hide = () => {
          toast.hidden = true;
        };
        toast.addEventListener('transitionend', hide, { once: true });
        // Reduced motion disables the transition, so hide on a timer as well.
        window.setTimeout(hide, 400);
      }, afterMs);
    };
    show('Loading Java in the background…', 'loading');
    void preloadJavaRuntimeSoon((message) => show(message, 'loading'))
      .then(() => {
        show('Java is ready.', 'ready');
        dismiss(2500);
      })
      .catch((error: unknown) => {
        started = false;
        show('Java could not finish loading. Click Run to retry.', 'error');
        dismiss(8000);
        console.warn('Java background startup failed:', error);
      });
  };
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
  doc.addEventListener('astro:page-load', start);
}
