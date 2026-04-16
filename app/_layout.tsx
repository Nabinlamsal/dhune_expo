import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { NotificationProvider } from "@/contexts/NotificationContext";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </NotificationProvider>
    </QueryClientProvider>
  );
}
