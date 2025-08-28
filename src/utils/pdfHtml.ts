export function buildPdfHtmlFromBase64(b64: string, initialPercent = 0) {
  return `
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<title>PDF Viewer</title>
<style>
  :root { --bg:#111; --fg:#fff; --btn:#e5e7eb; --btnfg:#111; }
  html,body { height:100%; margin:0; background:var(--bg); color:var(--fg); }
  #viewerContainer { position:absolute; inset:0; overflow:auto; -webkit-overflow-scrolling:touch; }
  canvas { display:block; margin:0 auto 12px; background:#fff; box-shadow:0 2px 12px rgba(0,0,0,.25); }
  #controls { position:fixed; top:8px; right:8px; z-index:10; display:flex; gap:8px; }
  #controls button{ border:1px solid rgba(0,0,0,.15); background:var(--btn); color:var(--btnfg); border-radius:6px; padding:6px 10px; font-size:16px; }
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
  (function(){
      const initialPercent = ${Math.max(0, Math.min(100, Number(initialPercent)))};

    const RN = (msg) => {
      try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(msg)); } catch(e){}
    };

    const pdfjsLib = window['pdfjsLib'];
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const container = document.getElementById('viewerContainer');
    let pdfDoc=null, scale=1, fitScale=1, rendering=false;

    function bytesFromBase64(b64){
      const raw=atob("${b64}"); const len=raw.length; const bytes=new Uint8Array(len);
      for(let i=0;i<len;i++) bytes[i]=raw.charCodeAt(i);
      return bytes;
    }

    function computeFitScale(page){
      const v1 = page.getViewport({ scale: 1 });
      const available = container.clientWidth || window.innerWidth;
      return Math.max(0.5, Math.min(4, available / v1.width));
    }

    async function renderDoc(){
      if(!pdfDoc || rendering) return;
      rendering=true;
      container.innerHTML='';

      const dpr = window.devicePixelRatio || 1;
      for(let i=1;i<=pdfDoc.numPages;i++){
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const ctx    = canvas.getContext('2d');

        canvas.width  = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width  = Math.floor(viewport.width)  + 'px';
        canvas.style.height = Math.floor(viewport.height) + 'px';

        const task = page.render({ canvasContext: ctx, viewport, transform: dpr!==1 ? [dpr,0,0,dpr,0,0] : undefined });
        await task.promise;
        container.appendChild(canvas);
      }
      rendering=false;

      // Si hay progreso inicial, posiciona
      if (initialPercent > 0) {
        requestAnimationFrame(()=>scrollToPercent(initialPercent));
      }
      // Reporta la primera vez
      reportProgress();
    }

    function fitToWidth(){
      pdfDoc.getPage(1).then(page=>{
        fitScale = computeFitScale(page);
        scale = fitScale;
        renderDoc();
      });
    }

    // Progreso = scrollTop / (scrollHeight - clientHeight)
    function getPercent(){
      const max = container.scrollHeight - container.clientHeight;
      if (max <= 0) return 0;
      return Math.max(0, Math.min(100, (container.scrollTop / max) * 100));
    }
    function reportProgress(){
      RN({ type:'progress', percent: Math.round(getPercent()) });
    }
    function scrollToPercent(p){
      const max = container.scrollHeight - container.clientHeight;
      const y   = Math.max(0, Math.min(max, (p/100) * max));
      container.scrollTo(0, y);
      reportProgress();
    }

    // Expone función para RN
    window.__PDF_SCROLL_TO_PERCENT__ = scrollToPercent;

    // Eventos
    let t=null;
    container.addEventListener('scroll', ()=>{
      clearTimeout(t);
      t=setTimeout(reportProgress, 80); // throttle
    });

    document.getElementById('zoomIn').addEventListener('click', ()=>{ scale=Math.min(4, scale+0.15); renderDoc(); });
    document.getElementById('zoomOut').addEventListener('click', ()=>{ scale=Math.max(0.5, scale-0.15); renderDoc(); });

    // Carga
    const bytes = bytesFromBase64("${b64}");
    pdfjsLib.getDocument({ data: bytes }).promise
      .then(doc=>{ pdfDoc=doc; fitToWidth(); })
      .catch(err=>{ container.innerHTML='<div style="padding:16px;color:#f66">Error: '+err+'</div>'; });
  })();
  </script>
</body>
</html>`;
}
