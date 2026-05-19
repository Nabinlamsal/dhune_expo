import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useAppTheme } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { initI18n } from "@/i18n";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

function RootNavigator() {
  const { mode } = useAppTheme();

  return (
    <NotificationProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
    </NotificationProvider>
  );
}

export default function RootLayout() {
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    initI18n()
      .catch((error) => {
        console.warn("i18n initialization failed", error);
      })
      .finally(() => {
        if (mounted) {
          setIsI18nReady(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!isI18nReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
