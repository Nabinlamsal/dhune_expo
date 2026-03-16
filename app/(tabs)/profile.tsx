import { useLogout } from "@/hooks/auth/useLogout";
import { useMe } from "@/hooks/auth/useMe";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

type ProfileRole = "user" | "business" | "vendor" | "admin";

type ProfileStat = {
    label: string;
    value: string;
};

type ProfileDetail = {
    label: string;
    value: string;
};

type MockProfile = {
    displayName: string;
    role: ProfileRole;
    joinedAt: string;
    stats: ProfileStat[];
    details: ProfileDetail[];
};

const USER_PROFILE: MockProfile = {
    displayName: "Riya Sharma",
    role: "user",
    joinedAt: "2025-06-12T09:00:00Z",
    stats: [
        { label: "Requests", value: "14" },
        { label: "Orders", value: "9" },
        { label: "Reviews", value: "6" },
    ],
    details: [
        { label: "Email", value: "riya.sharma@gmail.com" },
        { label: "Phone", value: "+977 98XXXXXXXX" },
        { label: "City", value: "Kathmandu" },
    ],
};

const BUSINESS_PROFILE: MockProfile = {
    displayName: "Everest Laundry Pvt. Ltd.",
    role: "business",
    joinedAt: "2024-10-03T09:00:00Z",
    stats: [
        { label: "Orders", value: "182" },
        { label: "Customers", value: "96" },
        { label: "Rating", value: "4.8" },
    ],
    details: [
        { label: "Owner", value: "Suman Karki" },
        { label: "Business Type", value: "Commercial Laundry" },
        { label: "Registration No.", value: "REG-24-8832" },
        { label: "Approval", value: "Approved" },
        { label: "Address", value: "Baneshwor, Kathmandu" },
        { label: "Support Email", value: "support@everestlaundry.com" },
        { label: "Contact", value: "+977 98XXXXXXXX" },
    ],
};

function formatDate(isoDate: string): string {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
        return isoDate;
    }
    return parsed.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function isBusinessLikeRole(role?: string): role is "business" | "vendor" {
    return role === "business" || role === "vendor";
}

function DetailRow({ label, value }: ProfileDetail) {
    return (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
        </View>
    );
}

function StatItem({ label, value }: ProfileStat) {
    return (
        <View style={styles.statItem}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

export default function ProfileScreen() {
    const { data } = useMe();
    const logout = useLogout();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const profile = useMemo(() => {
        const identity = (data ?? {}) as {
            display_name?: string;
            role?: string;
        };

        const base = isBusinessLikeRole(identity.role) ? BUSINESS_PROFILE : USER_PROFILE;
        const finalRole = (identity.role as ProfileRole | undefined) ?? base.role;
        const finalName = identity.display_name?.trim() ? identity.display_name : base.displayName;

        return {
            ...base,
            displayName: finalName,
            role: finalRole,
        };
    }, [data]);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
            router.replace("/(auth)/login");
        } catch {
            Alert.alert("Logout failed", "Please try again.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.headerCard}>
                    <View style={styles.avatar}>
                        <Ionicons name="person-outline" size={44} color="#9ca3af" />
                    </View>
                    <Text style={styles.name}>{profile.displayName}</Text>
                    <Text style={styles.role}>{profile.role}</Text>
                    <Text style={styles.joined}>Joined {formatDate(profile.joinedAt)}</Text>
                </View>

                <View style={styles.statsCard}>
                    {profile.stats.map((item) => (
                        <StatItem key={item.label} label={item.label} value={item.value} />
                    ))}
                </View>

                <View style={styles.detailsCard}>
                    {profile.details.map((item) => (
                        <DetailRow key={item.label} label={item.label} value={item.value} />
                    ))}
                </View>

                <Pressable
                    style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={17} color="#1f2937" />
                    <Text style={styles.logoutText}>{isLoggingOut ? "Logging out..." : "Log out"}</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f5f6fa",
    },
    container: {
        padding: 16,
        paddingBottom: 30,
    },
    headerCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#eceff3",
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 1,
        borderColor: "#d1d5db",
        backgroundColor: "#fafafa",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    name: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        textAlign: "center",
    },
    role: {
        marginTop: 2,
        fontSize: 13,
        color: "#6b7280",
        textTransform: "capitalize",
    },
    joined: {
        marginTop: 5,
        fontSize: 12,
        color: "#9ca3af",
    },
    statsCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#eceff3",
        marginBottom: 12,
        flexDirection: "row",
        paddingVertical: 14,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    statValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
    },
    statLabel: {
        marginTop: 2,
        fontSize: 11,
        color: "#64748b",
    },
    detailsCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#eceff3",
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginBottom: 12,
    },
    row: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    rowLabel: {
        fontSize: 11,
        color: "#64748b",
        marginBottom: 2,
    },
    rowValue: {
        fontSize: 15,
        color: "#111827",
        fontWeight: "500",
    },
    logoutBtn: {
        height: 46,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#d1d5db",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 6,
    },
    logoutBtnPressed: {
        backgroundColor: "#f8fafc",
    },
    logoutText: {
        fontSize: 14,
        color: "#1f2937",
        fontWeight: "600",
    },
});
