import { useAppTheme } from "@/contexts/ThemeContext";
import { useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

type LeafletMapMode = "picker" | "readonly";

type LeafletMapViewProps = {
    latitude: number;
    longitude: number;
    mode?: LeafletMapMode;
    height?: number;
    zoom?: number;
    style?: ViewStyle;
    onLocationChange?: (location: { latitude: number; longitude: number }) => void;
};

const isValidCoordinate = (latitude: number, longitude: number) =>
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

const buildLeafletHtml = ({
    latitude,
    longitude,
    mode,
    zoom,
}: {
    latitude: number;
    longitude: number;
    mode: LeafletMapMode;
    zoom: number;
}) => {
    const canEdit = mode === "picker";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background: #e5e7eb;
    }
    .leaflet-control-attribution {
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const start = [${latitude}, ${longitude}];
    const editable = ${canEdit ? "true" : "false"};
    const map = L.map("map", {
      zoomControl: true,
      attributionControl: true
    }).setView(start, ${zoom});

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const marker = L.marker(start, { draggable: editable }).addTo(map);

    function sendLocation(latlng) {
      if (!editable || !window.ReactNativeWebView) return;
      window.ReactNativeWebView.postMessage(JSON.stringify({
        latitude: latlng.lat,
        longitude: latlng.lng
      }));
    }

    if (editable) {
      map.on("click", function(event) {
        marker.setLatLng(event.latlng);
        sendLocation(event.latlng);
      });

      marker.on("dragend", function(event) {
        sendLocation(event.target.getLatLng());
      });
    }

    setTimeout(function() {
      map.invalidateSize();
    }, 250);
  </script>
</body>
</html>`;
};

export default function LeafletMapView({
    latitude,
    longitude,
    mode = "readonly",
    height = 220,
    zoom = 15,
    style,
    onLocationChange,
}: LeafletMapViewProps) {
    const { theme } = useAppTheme();
    const html = useMemo(
        () => buildLeafletHtml({ latitude, longitude, mode, zoom }),
        [latitude, longitude, mode, zoom]
    );

    if (!isValidCoordinate(latitude, longitude)) {
        return null;
    }

    const handleMessage = (event: WebViewMessageEvent) => {
        if (mode !== "picker" || !onLocationChange) return;

        try {
            const payload = JSON.parse(event.nativeEvent.data) as {
                latitude?: unknown;
                longitude?: unknown;
            };
            if (
                typeof payload.latitude !== "number" ||
                typeof payload.longitude !== "number" ||
                !isValidCoordinate(payload.latitude, payload.longitude)
            ) {
                return;
            }

            onLocationChange({
                latitude: payload.latitude,
                longitude: payload.longitude,
            });
        } catch {
            // Ignore malformed WebView messages.
        }
    };

    return (
        <View
            style={[
                styles.wrap,
                {
                    height,
                    backgroundColor: theme.surfaceMuted,
                    borderColor: theme.border,
                },
                style,
            ]}
        >
            <WebView
                key={`${mode}-${latitude.toFixed(6)}-${longitude.toFixed(6)}-${zoom}`}
                originWhitelist={["*"]}
                source={{ html }}
                style={styles.webview}
                onMessage={handleMessage}
                javaScriptEnabled
                domStorageEnabled
                scrollEnabled={false}
                nestedScrollEnabled
                geolocationEnabled={false}
                setSupportMultipleWindows={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        width: "100%",
        borderRadius: 12,
        borderWidth: 1,
        overflow: "hidden",
    },
    webview: {
        flex: 1,
        backgroundColor: "transparent",
    },
});
