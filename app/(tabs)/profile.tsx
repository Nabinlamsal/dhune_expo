import { useLogout } from "@/hooks/auth/useLogout";
import { useMyProfile } from "@/hooks/users/useMyProfile";
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

type ScreenProfile = {
    displayName: string;
    role: ProfileRole;
    joinedAt: string;
    stats: ProfileStat[];
    details: ProfileDetail[];
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

function formatBoolean(value: boolean): string {
    return value ? "Yes" : "No";
}

function formatStatus(value?: string | null): string {
    if (!value) return "-";
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
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
    const { data, isLoading, isError, refetch, isFetching } = useMyProfile();
    const logout = useLogout();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const profile = useMemo(() => {
        if (!data) return null;

        const role = data.Role as ProfileRole;
        const details: ProfileDetail[] = [
            { label: "Email", value: data.Email || "-" },
            { label: "Phone", value: data.Phone || "-" },
            { label: "Active", value: formatBoolean(data.IsActive) },
            { label: "Verified", value: formatBoolean(data.IsVerified) },
        ];

        if (data.BusinessProfile) {
            details.push(
                { label: "Owner", value: data.BusinessProfile.OwnerName || "-" },
                { label: "Business Type", value: data.BusinessProfile.BusinessType || "-" },
                { label: "Registration No.", value: data.BusinessProfile.RegistrationNumber || "-" },
                { label: "Approval", value: formatStatus(data.BusinessProfile.ApprovalStatus) },
            );
        }

        if (data.VendorProfile) {
            details.push(
                { label: "Owner", value: data.VendorProfile.OwnerName || "-" },
                { label: "Address", value: data.VendorProfile.Address || "-" },
                { label: "Registration No.", value: data.VendorProfile.RegistrationNumber || "-" },
                { label: "Approval", value: formatStatus(data.VendorProfile.ApprovalStatus) },
            );
        }

        return {
            displayName: data.DisplayName || "Profile",
            role,
            joinedAt: data.CreatedAt,
            stats: [
                { label: "Role", value: data.Role || "-" },
                { label: "Status", value: data.IsActive ? "Active" : "Inactive" },
                { label: "Docs", value: String(data.Documents?.length ?? 0) },
            ],
            details,
        } satisfies ScreenProfile;
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
                {isLoading ? (
                    <View style={styles.stateCard}>
                        <Text style={styles.stateTitle}>Loading profile...</Text>
                    </View>
                ) : null}

                {isError ? (
                    <View style={styles.stateCard}>
                        <Text style={styles.stateTitle}>Could not load profile</Text>
                        <Pressable
                            style={({ pressed }) => [styles.retryBtn, pressed && styles.logoutBtnPressed]}
                            onPress={() => refetch()}
                        >
                            <Text style={styles.retryText}>{isFetching ? "Retrying..." : "Try again"}</Text>
                        </Pressable>
                    </View>
                ) : null}

                {profile ? (
                    <>
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
                    </>
                ) : null}
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
        gap: 12,
    },
    stateCard: {
        backgroundColor: "#040947",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#eceff3",
        padding: 16,
        alignItems: "center",
        gap: 10,
    },
    stateTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
    },
    retryBtn: {
        minWidth: 110,
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#d1d5db",
        alignItems: "center",
        justifyContent: "center",
    },
    headerCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 16,
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
        backgroundColor: "#ffcccb",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#d1d5db",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 6,
    },
    logoutBtnPressed: {
        backgroundColor: "#ffcccb",
    },
    logoutText: {
        fontSize: 14,
        color: "#1f2937",
        fontWeight: "600",
    },
    retryText: {
        fontSize: 14,
        color: "#1f2937",
        fontWeight: "600",
    },
});
