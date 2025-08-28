// export type LibroWP = {
//   id: number | string;
//   titulo: string;
//   autor?: string;
//   portada?: string;
//   archivo_pdf?: string;     // si luego lo agregan
//   enlace_externo?: string;  // si luego lo agregan
// };

// export const WP_API_BASE =
//   'https://4cd90d052bf3.ngrok-free.app/biblioteca-plan/wp-json/biblioteca/v1';

// // ORIGIN público que debe usarse para recursos (imágenes, pdfs)
// export const PUBLIC_ORIGIN = new URL(WP_API_BASE).origin; // 👉 https://4cd90d052bf3.ngrok-free.app

// async function http<T>(path: string): Promise<T> {
//   const res = await fetch(`${WP_API_BASE}${path}`);
//   if (!res.ok) throw new Error(`HTTP ${res.status}`);
//   return res.json() as Promise<T>;
// }

// export const wpApi = {
//   listLibros: () => http<LibroWP[]>('/libros'),
//   // getLibro: (id: number|string) => http<LibroWP>(`/libros/${id}`),
// };
// src/services/wpApi.ts
// src/services/wpApi.ts
// src/services/wpApi.ts
// src/services/wpApi.ts
export type LibroWP = {
  id: number | string;
  titulo: string;
  autor?: string;
  portada?: string;
  archivo_pdf?: string;
  enlace_externo?: string;
};

// -------------------- Constantes base --------------------
// Raíz real del WP (nota el /biblioteca-plan)
export const WP_SITE_ROOT =
  'https://ef0ea382b821.ngrok-free.app/biblioteca-plan';

// Namespaces existentes
export const WP_API_BIBLIOTECA = `${WP_SITE_ROOT}/wp-json/biblioteca/v1`;
export const WP_API_JWT        = `${WP_SITE_ROOT}/wp-json/jwt-auth/v1`;
export const WP_API_MYAPI      = `${WP_SITE_ROOT}/wp-json/my-api/v1`;

// ✅ NUEVO/ARREGLADO: WP Core v2 SOBRE LA MISMA RAÍZ
export const WP_API_V2         = `${WP_SITE_ROOT}/wp-json/wp/v2`;

// Para recursos absolutos (imágenes/PDF) y construir URLs absolutas
export const PUBLIC_ORIGIN = WP_SITE_ROOT;

// -------------------- Helper HTTP (con logs) --------------------
async function http<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set('ngrok-skip-browser-warning', 'true');
  // No forzamos JSON en GETs, pero no afecta si queda
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  console.log('[http] url=', url, 'status=', res.status, 'raw body=', text);

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);

  return JSON.parse(text) as T;
}

// -------------------- API Pública existente --------------------
export const wpApi = {
  // Biblioteca pública (ya existente)
  listLibros: () => http<LibroWP[]>(`${WP_API_BIBLIOTECA}/libros`),

  // ---------- Auth (usuario/clave) ----------
  async loginPassword(username: string, password: string) {
    type Resp = { token: string; user_display_name?: string; user_email?: string };
    return http<Resp>(`${WP_API_JWT}/token`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // ---------- Auth (Google -> JWT WP) ----------
  async loginGoogle(id_token: string) {
    type Resp = { token: string; user_display_name?: string; user_email?: string };
    return http<Resp>(`${WP_API_MYAPI}/google-login`, {
      method: 'POST',
      body: JSON.stringify({ id_token }),
    });
  },

  // ---------- Favoritos (requiere Bearer) ----------
  async getFavorites(token: string) {
    return http<LibroWP[]>(`${WP_API_MYAPI}/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// -------------------- Helpers de URLs --------------------
export function abs(u?: string): string | undefined {
  if (!u) return undefined;
  try { new URL(u); return u; } catch {}
  try { return new URL(u, PUBLIC_ORIGIN).toString(); } catch { return u; }
}

// -------------------- NUEVO: Listado por área (WP Core v2) --------------------
/**
 * Lista libros (CPT 'libros') filtrando por el campo 'area_contenido'.
 * Acepta CSV como '2,3', '6', '4', '5'
 *   Empleo y Empleabilidad -> '2,3'
 *   Desarrollo Personal     -> '6'
 *   Emprendimiento          -> '4'
 *   Participación Juvenil   -> '5'
 *
 * Ejemplo de uso:
 *   const raw = await listByArea('2,3');
 *   const libros: LibroWP[] = raw.map(mapWpV2LibroToLibroWP);
 */
export function listByArea(areaCsv: string) {
  const url = `${WP_API_V2}/libros?area_contenido=${areaCsv}`;
  return http<any[]>(url);
}

// -------------------- NUEVO: Mapper WP v2 -> tu shape LibroWP --------------------
export function mapWpV2LibroToLibroWP(node: any): LibroWP {
  const pdf =
    typeof node?.acf?.archivo_pdf === 'string' && node.acf.archivo_pdf
      ? node.acf.archivo_pdf
      : undefined;

  return {
    id: node?.id,
    titulo: node?.title?.rendered ?? '',
    autor: node?.acf?.autor ?? undefined,
    portada: node?.acf?.portada ?? undefined,
    archivo_pdf: pdf,
    enlace_externo: undefined,
  };
}