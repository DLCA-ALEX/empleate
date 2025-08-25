import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, Alert, Image, Linking, ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { buildPdfHtmlFromBase64 } from '@/utils/pdfHtml';

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

export default function DetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute();
  const { content } = (route.params as RouteParams) || {};

  const [viewerUri, setViewerUri] = useState<string | undefined>(); // para imágenes/links o html inlined
  const [viewerHtml, setViewerHtml] = useState<string | undefined>(); // html con pdf.js
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [viewerTried, setViewerTried] = useState<'pdf-html' | 'raw' | 'gview' | 'drive' | null>(null);

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

  const isHttps = useMemo(() => /^https:\/\//i.test(targetUrl), [targetUrl]);

  // Descarga PDF -> base64 (con header para ngrok) y arma html con pdf.js
  const loadPdfIntoHtml = async (url: string) => {
    try {
      const res = await FileSystem.downloadAsync(
        addNgrokBypass(url),
        FileSystem.cacheDirectory + 'tmp.pdf',
        isNgrokHost(url) ? { headers: { 'ngrok-skip-browser-warning': 'true' } } : undefined
      );
      // Lee como base64
      const b64 = await FileSystem.readAsStringAsync(res.uri, { encoding: FileSystem.EncodingType.Base64 });
      const html = buildPdfHtmlFromBase64(b64);
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
          // imagen o link normal
          setViewerUri(addNgrokBypass(targetUrl));
          setViewerTried('raw');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [content, targetUrl, type]);

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

  // const DebugBar = (
  //   <View style={{ padding: 8, backgroundColor: '#EEF2FF', borderBottomWidth: 1, borderColor: '#E5E7EB' }}>
  //     <ScrollView horizontal contentContainerStyle={{ alignItems: 'center' }}>
  //       <Text style={{ marginRight: 12 }}>Tipo: <Text style={{ fontWeight: '700' }}>{type}</Text></Text>
  //       <Text style={{ marginRight: 12 }}>HTTPS: {String(isHttps)}</Text>
  //       <Text style={{ marginRight: 12 }}>Viewer: {viewerTried ?? '-'}</Text>
  //       <TouchableOpacity onPress={openExternally}>
  //         <Text style={{ color: '#1E4DD8' }}>Abrir fuera</Text>
  //       </TouchableOpacity>
  //     </ScrollView>
  //     <Text numberOfLines={2} style={{ color: '#475569', marginTop: 4 }}>
  //       {addNgrokBypass(targetUrl) || '— sin URL —'}
  //     </Text>
  //     {!!lastError && <Text style={{ color: '#DC2626', marginTop: 4 }}>⚠️ {lastError}</Text>}
  //   </View>
  // );

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {Header}
      {/* {DebugBar} */}

      {loading && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8 }}>Cargando…</Text>
        </View>
      )}

      {/* PDF con pdf.js embebido */}
      {!loading && type === 'PDF' && !!viewerHtml && (
        <WebView
          originWhitelist={['*']}
          source={{ html: viewerHtml }}
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
    </View>
  );
}
