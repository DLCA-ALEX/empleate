import { PUBLIC_ORIGIN } from '@/services/wpApi';

export type LibroWP = {
  id: number | string;
  titulo: string;
  autor?: string;
  portada?: string;
  archivo_pdf?: string;     // 👈 nombre real del campo
  enlace_externo?: string;  // si existiera
};

export type Content = {
  id: string;
  title: string;
  description?: string;
  author?: string;
  thumbnailUrl?: string;
  fileUrl?: string;       // PDF/local
  externalUrl?: string;   // permalink o imagen
  type?: 'PDF' | 'IMAGE' | 'LINK';
  updatedAt?: string;
};

function withNgrokBypass(u?: string): string | undefined {
  if (!u) return undefined;
  try {
    const url = new URL(u);
    if (/\.ngrok-.*\.app$/i.test(url.hostname)) {
      if (!url.searchParams.has('ngrok-skip-browser-warning')) {
        url.searchParams.set('ngrok-skip-browser-warning', 'true');
      }
    }
    return url.toString();
  } catch {
    return u;
  }
}

function normalizeUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  try {
    const base = new URL(PUBLIC_ORIGIN);
    const url = new URL(u, base);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      url.protocol = base.protocol;
      url.host = base.host;
    }
    return withNgrokBypass(url.toString());
  } catch {
    return withNgrokBypass(u);
  }
}

function detectType(url?: string): Content['type'] {
  if (!url) return 'LINK';
  if (/\.pdf(\?|#|$)/i.test(url)) return 'PDF';
  if (/\.(png|jpe?g|gif|webp|avif)(\?|#|$)/i.test(url)) return 'IMAGE';
  return 'LINK';
}

export function mapLibroToContent(x: LibroWP): Content {
  const portada = normalizeUrl(x.portada);
  const fileUrl = normalizeUrl(x.archivo_pdf);     // 👈 usa el campo correcto
  const externalUrl = normalizeUrl(x.enlace_externo) ?? portada;

  const t = detectType(fileUrl ?? externalUrl);

  return {
    id: String(x.id),
    title: x.titulo,
    description: x.autor ?? '',
    author: x.autor,
    thumbnailUrl: portada,
    fileUrl,
    externalUrl,
    type: t,
    updatedAt: new Date().toISOString(),
  };
}
