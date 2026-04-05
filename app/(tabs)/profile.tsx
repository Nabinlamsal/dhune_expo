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
            <Text style={styles.rowValue} numberOfLines={2}>
                {value}
            </Text>
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
                            <View style={styles.headerBlobOne} />
                            <View style={styles.headerBlobTwo} />
                            <View style={styles.avatar}>
                                <Ionicons name="person-outline" size={36} color="#0b2457" />
                            </View>
                            <Text style={styles.name}>{profile.displayName}</Text>
                            <View style={styles.rolePill}>
                                <Text style={styles.role}>{profile.role}</Text>
                            </View>
                            <Text style={styles.joined}>Joined {formatDate(profile.joinedAt)}</Text>
                        </View>

                        <View style={styles.statsCard}>
                            {profile.stats.map((item) => (
                                <StatItem key={item.label} label={item.label} value={item.value} />
                            ))}
                        </View>

                        <View style={styles.detailsCard}>
                            {profile.details.map((item, index) => (
                                <DetailRow key={`${item.label}-${index}`} label={item.label} value={item.value} />
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
        backgroundColor: "#edf4ff",
    },
    container: {
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 20,
        gap: 10,
    },
    stateCard: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#dbe7ff",
        padding: 14,
        alignItems: "center",
        gap: 8,
    },
    stateTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1e3a8a",
    },
    retryBtn: {
        minWidth: 110,
        height: 38,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#c5d4f5",
        backgroundColor: "#f8fbff",
        alignItems: "center",
        justifyContent: "center",
    },
    headerCard: {
        backgroundColor: "#dff5ff",
        borderRadius: 16,
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#cbe8fa",
        overflow: "hidden",
        position: "relative",
    },
    headerBlobOne: {
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: 80,
        right: -45,
        top: -45,
        backgroundColor: "#bae6fd",
    },
    headerBlobTwo: {
        position: "absolute",
        width: 120,
        height: 120,
        borderRadius: 80,
        left: -55,
        bottom: -74,
        backgroundColor: "#bfdbfe",
    },
    avatar: {
        width: 78,
        height: 78,
        borderRadius: 39,
        borderWidth: 1,
        borderColor: "#bbd8ee",
        backgroundColor: "#f8fcff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    name: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
        textAlign: "center",
    },
    rolePill: {
        marginTop: 4,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: "#0b2457",
    },
    role: {
        fontSize: 11,
        color: "#ffffff",
        fontWeight: "700",
        textTransform: "capitalize",
    },
    joined: {
        marginTop: 5,
        fontSize: 11,
        color: "#1f3a7a",
        fontWeight: "500",
    },
    statsCard: {
        backgroundColor: "transparent",
        borderRadius: 16,
        flexDirection: "row",
        gap: 8,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dbe7ff",
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    statValue: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0b2457",
    },
    statLabel: {
        marginTop: 1,
        fontSize: 10,
        color: "#5b6b86",
    },
    detailsCard: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#dbe7ff",
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    row: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#edf2ff",
    },
    rowLabel: {
        fontSize: 10,
        color: "#5b6b86",
        marginBottom: 1,
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    rowValue: {
        fontSize: 13,
        color: "#0f172a",
        fontWeight: "500",
    },
    logoutBtn: {
        height: 44,
        backgroundColor: "#ffe4e6",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#fecdd3",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 6,
    },
    logoutBtnPressed: {
        opacity: 0.85,
    },
    logoutText: {
        fontSize: 13,
        color: "#be123c",
        fontWeight: "600",
    },
    retryText: {
        fontSize: 13,
        color: "#1d4ed8",
        fontWeight: "600",
    },
});
