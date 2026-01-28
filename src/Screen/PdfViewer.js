// PdfViewer.js
import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import WebView from 'react-native-webview';
import FlagSecure from 'react-native-flag-secure';

const PdfViewer = ({ route }) => {
  const { pdfUrl } = route.params || {};

  useEffect(() => {
    if (Platform.OS === 'android') {
      FlagSecure.activate();
      return () => FlagSecure.deactivate();
    }
  }, []);

  if (!pdfUrl) {
    return null;
  }

  // 🔐 Google viewer (prevents direct download)
  const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
    pdfUrl
  )}`;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <WebView
        source={{ uri: viewerUrl }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        cacheEnabled={false}
        allowsLinkPreview={false}
        allowFileAccess={false}
        allowUniversalAccessFromFileURLs={false}
        mixedContentMode="never"
        injectedJavaScript={`
          document.addEventListener('contextmenu', e => e.preventDefault());
          document.addEventListener('selectstart', e => e.preventDefault());
          document.addEventListener('copy', e => e.preventDefault());
          true;
        `}
      />
    </View>
  );
};

export default PdfViewer;
