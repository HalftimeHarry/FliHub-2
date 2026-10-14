/**
 * Injected into every page before app scripts run. Playwright videos don't render
 * the OS cursor, so this draws a fake one that follows real mouse events, plus
 * click ripples, highlight boxes, and a caption bar.
 *
 * Must stay self-contained: it is serialized and evaluated in the browser.
 */
export const installOverlay = (options: {
  readonly captions: boolean;
}): void => {
  const zIndex = '2147483647';

  const mount = () => {
    if (document.getElementById('__demo-cursor') !== null) return;

    const style = document.createElement('style');
    style.textContent = `
      #__demo-cursor { position: fixed; left: 0; top: 0; width: 22px; height: 22px; pointer-events: none;
        z-index: ${zIndex}; transform: translate(-100px, -100px); transition: transform 40ms linear;
        filter: drop-shadow(0 2px 3px rgba(0,0,0,.45)); }
      .__demo-ripple { position: fixed; width: 36px; height: 36px; margin: -18px 0 0 -18px; border-radius: 9999px;
        border: 3px solid rgba(250, 204, 21, .95); pointer-events: none; z-index: ${zIndex};
        animation: __demo-ripple 550ms ease-out forwards; }
      @keyframes __demo-ripple { from { transform: scale(.4); opacity: 1 } to { transform: scale(1.6); opacity: 0 } }
      .__demo-highlight { position: fixed; pointer-events: none; z-index: ${zIndex}; border-radius: 12px;
        border: 3px solid rgba(250, 204, 21, .95); box-shadow: 0 0 0 9999px rgba(2, 6, 23, .35);
        transition: opacity 250ms ease; }
      #__demo-caption { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); max-width: 82%;
        padding: 12px 20px; border-radius: 14px; background: rgba(2, 6, 23, .86); color: #f8fafc;
        font: 500 19px/1.4 ui-sans-serif, system-ui, sans-serif; text-align: center; pointer-events: none;
        z-index: ${zIndex}; box-shadow: 0 10px 30px rgba(0,0,0,.35); transition: opacity 200ms ease; opacity: 0; }
    `;
    document.head.appendChild(style);

    const cursor = document.createElement('div');
    cursor.id = '__demo-cursor';
    cursor.innerHTML =
      '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M3 2l7.5 19 2.6-7.9L21 10.5z" fill="#fff" stroke="#0f172a" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    document.body.appendChild(cursor);

    const caption = document.createElement('div');
    caption.id = '__demo-caption';
    document.body.appendChild(caption);

    const saved = sessionStorage.getItem('__demo-cursor-pos');
    if (saved !== null) cursor.style.transform = `translate(${saved})`;

    document.addEventListener(
      'mousemove',
      (event) => {
        const pos = `${event.clientX.toString()}px, ${event.clientY.toString()}px`;
        cursor.style.transform = `translate(${pos})`;
        sessionStorage.setItem('__demo-cursor-pos', pos);
      },
      true
    );
    document.addEventListener(
      'mousedown',
      (event) => {
        const ripple = document.createElement('div');
        ripple.className = '__demo-ripple';
        ripple.style.left = `${event.clientX.toString()}px`;
        ripple.style.top = `${event.clientY.toString()}px`;
        document.body.appendChild(ripple);
        setTimeout(() => {
          ripple.remove();
        }, 600);
      },
      true
    );
  };

  const api = {
    caption(text: string | null) {
      mount();
      const el = document.getElementById('__demo-caption');
      if (el === null) return;
      if (!options.captions || text === null || text === '') {
        el.style.opacity = '0';
        return;
      }
      el.textContent = text;
      el.style.opacity = '1';
    },
    highlight(
      rect: { x: number; y: number; width: number; height: number },
      durationMs: number
    ) {
      mount();
      const pad = 6;
      const box = document.createElement('div');
      box.className = '__demo-highlight';
      box.style.left = `${(rect.x - pad).toString()}px`;
      box.style.top = `${(rect.y - pad).toString()}px`;
      box.style.width = `${(rect.width + pad * 2).toString()}px`;
      box.style.height = `${(rect.height + pad * 2).toString()}px`;
      document.body.appendChild(box);
      setTimeout(() => {
        box.style.opacity = '0';
        setTimeout(() => {
          box.remove();
        }, 300);
      }, durationMs);
    }
  };

  Object.assign(window, { __demo: api });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
};

export interface DemoOverlayApi {
  caption(text: string | null): void;
  highlight(
    rect: { x: number; y: number; width: number; height: number },
    durationMs: number
  ): void;
}
