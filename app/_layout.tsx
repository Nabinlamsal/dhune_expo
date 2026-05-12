import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useAppTheme } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { NotificationProvider } from "@/contexts/NotificationContext";

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
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
