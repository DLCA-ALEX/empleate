// src/screens/DetailScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { buildPdfHtmlFromBase64 } from '@/utils/pdfHtml';
import { saveProgress, loadProgress } from '@/services/reading';

/* =========================
   Slider JS (sin nativo)
   ========================= */
type PSliderProps = {
  value: number; // 0..100
  onSlidingComplete?: (v: number) => void;
  onChange?: (v: number) => void;
  height?: number;
  trackColor?: string;
  filledColor?: string;
  thumbColor?: string;
};

function ProgressSlider({
  value,
  onSlidingComplete,
  onChange,
  height = 28,
  trackColor = 'rgba(255,255,255,0.35)',
  filledColor = '#ffffff',
  thumbColor = '#ffffff',
}: PSliderProps) {
  const [internal, setInternal] = useState(value);
  const widthRef = useRef(1);

  useEffect(() => {
    // si cambia value externo (p.ej. por WebView), sincroniza
    setInternal(value);
  }, [value]);

  const pct = Math.max(0, Math.min(100, internal));

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = Math.max(1, e.nativeEvent.layout.width);
  };

  const setFromX = (x: number, final = false) => {
    const w = widthRef.current;
    const p = Math.max(0, Math.min(100, (x / w) * 100));
    setInternal(p);
    onChange?.(p);
    if (final) onSlidingComplete?.(Math.round(p));
  };

  return (
    <Pressable
      onLayout={onLayout}
      onPress={(e) => setFromX(e.nativeEvent.locationX, true)}
      onPressIn={(e) => setFromX(e.nativeEvent.locationX)}
      onPressOut={(e) => setFromX(e.nativeEvent.locationX, true)}
      onLongPress={(e) => setFromX(e.nativeEvent.locationX)}
      delayLongPress={0}
      style={{ height, justifyContent: 'center' }}
    >
      {/* track */}
      <View style={{ height: 6, borderRadius: 999, backgroundColor: trackColor }} />
      {/* filled */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: `${100 - pct}%`,
          height: 6,
          borderRadius: 999,
          backgroundColor: filledColor,
        }}
      />
      {/* thumb */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: `calc(${pct}% - 8px)`,
          width: 16,
          height: 16,
          borderRadius: 999,
          backgroundColor: thumbColor,
        }}
      />
    </Pressable>
  );
}

/* =========================
   Types y utils locales
   ========================= */
type Content = {
  id: string;
  title: string;
  description?: string;
  author?: string;
  thumbnailUrl?: string;
  fileUrl?: string;       // PDF preferido
  externalUrl?: string;   // alternativa (imagen/link)
  type?: string;
};
type RouteParams = { content?: Content; id?: string };

function isLikelyPdf(url: string) {
  return !!url && (/\.pdf(\?|#|$)/i.test(url) || /format=pdf/i.test(url));
}
function isLikelyImage(url: string) {
  return !!url && /\.(png|jpe?g|gif|webp|avif)(\?|#|$)/i.test(url);
}
function isNgrokHost(u: string) {
  try { return /\.ngrok-.*\.app$/i.test(new URL(u).hostname); } catch { return false; }
}
function addNgrokBypass(u: string) {
  try {
    const url = new URL(u);
    if (isNgrokHost(u) && !url.searchParams.has('ngrok-skip-browser-warning')) {
      url.searchParams.set('ngrok-skip-browser-warning', 'true');
    }
    return url.toString();
  } catch { return u; }
}

/* =========================
   Pantalla
   ========================= */
export default function DetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute();
  const { content } = (route.params as RouteParams) || {};

  const [viewerUri, setViewerUri] = useState<string | undefined>();
  const [viewerHtml, setViewerHtml] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [viewerTried, setViewerTried] = useState<'pdf-html' | 'raw' | 'gview' | 'drive' | null>(null);

  // progreso
  const [initialPct, setInitialPct] = useState(0);
  const [pct, setPct] = useState(0);
  const webRef = useRef<WebView>(null);

  const targetUrl = useMemo(() => {
    if (!content) return '';
    return content.fileUrl ?? content.externalUrl ?? content.thumbnailUrl ?? '';
  }, [content]);

  const type: 'PDF' | 'IMAGE' | 'LINK' | 'NONE' = useMemo(() => {
    if (!targetUrl) return 'NONE';
    if (isLikelyPdf(targetUrl)) return 'PDF';
    if (isLikelyImage(targetUrl)) return 'IMAGE';
    return 'LINK';
  }, [targetUrl]);

  // cargar progreso guardado
  useEffect(() => {
    (async () => {
      if (!content?.id) return;
      const p = await loadProgress(String(content.id));
      setInitialPct(p);
      setPct(p);
    })();
  }, [content?.id]);

  // Descarga PDF -> base64 y arma html con pdf.js + progreso inicial
  const loadPdfIntoHtml = async (url: string) => {
    try {
      const res = await FileSystem.downloadAsync(
        addNgrokBypass(url),
        FileSystem.cacheDirectory + 'tmp.pdf',
        isNgrokHost(url) ? { headers: { 'ngrok-skip-browser-warning': 'true' } } : undefined
      );
      const b64 = await FileSystem.readAsStringAsync(res.uri, { encoding: FileSystem.EncodingType.Base64 });
      const html = buildPdfHtmlFromBase64(b64, initialPct); // <- pasa el progreso inicial
      setViewerHtml(html);
      setViewerTried('pdf-html');
    } catch (e) {
      setLastError('No se pudo cargar el PDF.');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        if (!content || !targetUrl) {
          setLastError('Este contenido no tiene archivo ni enlace.');
          return;
        }
        if (type === 'PDF') {
          await loadPdfIntoHtml(targetUrl);
        } else {
          setViewerUri(addNgrokBypass(targetUrl));
          setViewerTried('raw');
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, targetUrl, type, initialPct]);

  const openExternally = async () => {
    try { await Linking.openURL(addNgrokBypass(targetUrl)); }
    catch { Alert.alert('No se pudo abrir en el navegador'); }
  };

  const Header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#1E4DD8' }}>
      <TouchableOpacity onPress={() => nav.goBack()}>
        <Text style={{ color: 'white', fontSize: 18 }}>←</Text>
      </TouchableOpacity>
      <Text numberOfLines={1} style={{ color: 'white', fontWeight: '700', marginLeft: 12, flex: 1 }}>
        {content?.title ?? 'Detalle'}
      </Text>
      <TouchableOpacity onPress={openExternally}>
        <Text style={{ color: 'white', marginLeft: 12 }}>🌐</Text>
      </TouchableOpacity>
    </View>
  );

  // recibe mensajes del visor (progreso)
  const onWebMessage = async (ev: any) => {
    try {
      const msg = JSON.parse(ev?.nativeEvent?.data);
      if (msg?.type === 'progress') {
        const next = Number(msg.percent) || 0;
        setPct(next);
        if (content?.id) saveProgress(String(content.id), next);
      }
    } catch {}
  };

  // usuario mueve el slider → manda a HTML
  const onSliderComplete = (value: number) => {
    setPct(value);
    if (content?.id) saveProgress(String(content.id), value);
    webRef.current?.injectJavaScript?.(
      `window.__PDF_SCROLL_TO_PERCENT__ && window.__PDF_SCROLL_TO_PERCENT__(${Math.round(value)}); true;`
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {Header}

      {loading && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8 }}>Cargando…</Text>
        </View>
      )}

      {/* PDF con pdf.js */}
      {!loading && type === 'PDF' && !!viewerHtml && (
        <WebView
          ref={webRef}
          originWhitelist={['*']}
          source={{ html: viewerHtml }}
          onMessage={onWebMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
            </View>
          )}
        />
      )}

      {/* Imagen / Link */}
      {!loading && type !== 'PDF' && !!viewerUri && (
        isLikelyImage(viewerUri) ? (
          <Image
            source={{ uri: viewerUri }}
            style={{ width: '100%', height: '100%', resizeMode: 'contain', backgroundColor: 'black' }}
          />
        ) : (
          <WebView
            source={{ uri: viewerUri }}
            startInLoadingState
            renderLoading={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
              </View>
            )}
          />
        )
      )}

      {/* Fallback */}
      {!loading && ((type === 'PDF' && !viewerHtml) || (!viewerUri && type !== 'PDF')) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ textAlign: 'center', marginBottom: 12 }}>
            No se pudo mostrar el recurso dentro de la app.
          </Text>
          <TouchableOpacity
            onPress={openExternally}
            style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#1E4DD8', borderRadius: 8 }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>Abrir en el navegador</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Slider de progreso */}
      {!loading && type === 'PDF' && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: 'rgba(17,17,17,0.6)',
          }}
        >
          <ProgressSlider
            value={pct}
            onChange={(v) => setPct(v)}
            onSlidingComplete={onSliderComplete}
          />
          <Text style={{ color: '#fff', textAlign: 'center', marginTop: 2 }}>
            {Math.round(pct)}%
          </Text>
        </View>
      )}
    </View>
  );
}
