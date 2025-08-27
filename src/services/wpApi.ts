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
export type LibroWP = {
  id: number | string;
  titulo: string;
  autor?: string;
  portada?: string;
  archivo_pdf?: string;
  enlace_externo?: string;
};

// 👇 Tu raíz real del sitio (nota el /biblioteca-plan)
export const WP_SITE_ROOT =
  'https://ef0ea382b821.ngrok-free.app/biblioteca-plan';

// 👇 Namespace de tu API custom (si la tienes)
export const WP_API_BASE = `${WP_SITE_ROOT}/wp-json/biblioteca/v1`;

// 👇 Úsalo para /users/me y recursos públicos (imágenes, etc.)
export const PUBLIC_ORIGIN = WP_SITE_ROOT;

// Helper con logs y header para ngrok
async function http<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set('ngrok-skip-browser-warning', 'true');
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn('[wpApi] HTTP error', res.status, res.statusText, 'url=', url, 'body=', text);
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const wpApi = {
  // Biblioteca (custom)
  listLibros: () => http<LibroWP[]>(`${WP_API_BASE}/libros`),

  // Login con usuario/clave (JWT WP oficial)
  async loginPassword(username: string, password: string) {
    type Resp = { token: string; user_display_name?: string; user_email?: string };
    const url = `${WP_SITE_ROOT}/wp-json/jwt-auth/v1/token`;
    return http<Resp>(url, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Login con Google → tu endpoint custom que intercambia id_token por JWT WP
  async loginGoogle(id_token: string) {
    type Resp = { token: string; user_display_name?: string; user_email?: string };
    // Ajusta si tu ruta es distinta:
    const url = `${WP_API_BASE}/google-login`;
    return http<Resp>(url, {
      method: 'POST',
      body: JSON.stringify({ id_token }),
    });
  },
};
