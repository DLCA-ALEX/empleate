export type LibroWP = {
  id: number | string;
  titulo: string;
  autor?: string;
  portada?: string;
  archivo_pdf?: string;     // si luego lo agregan
  enlace_externo?: string;  // si luego lo agregan
};

export const WP_API_BASE =
  'https://4cd90d052bf3.ngrok-free.app/biblioteca-plan/wp-json/biblioteca/v1';

// ORIGIN público que debe usarse para recursos (imágenes, pdfs)
export const PUBLIC_ORIGIN = new URL(WP_API_BASE).origin; // 👉 https://4cd90d052bf3.ngrok-free.app

async function http<T>(path: string): Promise<T> {
  const res = await fetch(`${WP_API_BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const wpApi = {
  listLibros: () => http<LibroWP[]>('/libros'),
  // getLibro: (id: number|string) => http<LibroWP>(`/libros/${id}`),
};
