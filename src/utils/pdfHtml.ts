
export function buildPdfHtmlFromBase64(b64: string) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
  <title>PDF Viewer</title>
  <style>
    :root { --bg:#111; --fg:#fff; --btn:#e5e7eb; --btnfg:#111; }
    html, body { height:100%; margin:0; background:var(--bg); color:var(--fg); }
    #viewerContainer { position:absolute; inset:0; overflow:auto; -webkit-overflow-scrolling:touch; }
    canvas { display:block; margin:0 auto 12px auto; background:#fff; box-shadow:0 2px 12px rgba(0,0,0,.25); }
    #controls { position:fixed; top:8px; right:8px; z-index:10; display:flex; gap:8px; }
    #controls button {
      border:1px solid rgba(0,0,0,.15); background:var(--btn); color:var(--btnfg);
      border-radius:6px; padding:6px 10px; font-size:16px;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head>
<body>
  <div id="controls">
    <button id="zoomOut">−</button>
    <button id="zoomIn">+</button>
  </div>
  <div id="viewerContainer"></div>
  <script>
  (function () {
    const b64 = "${b64}";
    const pdfjsLib = window['pdfjsLib'];
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const container = document.getElementById('viewerContainer');
    let pdfDoc = null;
    let scale = 1;      // escala de PDF.js (lógica)
    let fitScale = 1;   // escala que ajusta al ancho
    let rendering = false;

    function bytesFromBase64(b64) {
      const raw = atob(b64); const len = raw.length; const bytes = new Uint8Array(len);
      for (let i=0;i<len;i++) bytes[i] = raw.charCodeAt(i);
      return bytes;
    }

    function computeFitScale(page) {
      // viewport con escala 1 (anchura en puntos CSS)
      const v1 = page.getViewport({ scale: 1 });
      // ancho disponible real en CSS px (sin restar nada)
      const available = container.clientWidth || window.innerWidth;
      // escala para que viewport.width == available
      return Math.max(0.5, Math.min(4, available / v1.width));
    }

    async function renderDoc() {
      if (!pdfDoc || rendering) return;
      rendering = true;
      container.innerHTML = '';

      const dpr = window.devicePixelRatio || 1; // HiDPI
      const pages = pdfDoc.numPages;

      for (let i = 1; i <= pages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });  // tamaño lógico (CSS px)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Pintamos a resolución física (CSS px * dpr), pero mostramos a 100% del ancho lógico
        canvas.width  = Math.floor(viewport.width  * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width  = Math.floor(viewport.width)  + 'px';
        canvas.style.height = Math.floor(viewport.height) + 'px';

        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        });
        await renderTask.promise;
        container.appendChild(canvas);
      }
      rendering = false;
    }

    function fitToWidth() {
      pdfDoc.getPage(1).then(page => {
        fitScale = computeFitScale(page);
        scale = fitScale;
        renderDoc();
      });
    }

    // Controles
    document.getElementById('zoomIn').addEventListener('click', () => {
      scale = Math.min(4, scale + 0.15);
      renderDoc();
    });
    document.getElementById('zoomOut').addEventListener('click', () => {
      scale = Math.max(0.5, scale - 0.15);
      renderDoc();
    });

    // Recalcula al cambiar tamaño/orientación
    let rt = null;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => fitToWidth(), 150);
    });

    // Carga del PDF
    const bytes = bytesFromBase64(b64);
    pdfjsLib.getDocument({ data: bytes }).promise
      .then(doc => { pdfDoc = doc; fitToWidth(); })
      .catch(err => {
        container.innerHTML = '<div style="padding:16px;color:#f66">Error: ' + err + '</div>';
      });
  })();
  </script>
</body>
</html>
`;
}
