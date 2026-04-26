import ScreenHeader from "@/components/ui/ScreenHeader";
import { useLogout } from "@/hooks/auth/useLogout";
import { useMyProfile } from "@/hooks/users/useMyProfile";
import { MyProfile } from "@/types/users/my-profile";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

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
    avatarUrl: string | null;
    stats: ProfileStat[];
    details: ProfileDetail[];
};

type OptionRowProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
};

function formatDate(isoDate?: string | null): string {
    if (!isoDate) return "-";
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

function extractProfileImage(profile: MyProfile): string | null {
    const record = profile as MyProfile & Record<string, unknown>;
    const candidates = [
        record.ProfileImageUrl,
        record.ProfileImage,
        record.AvatarUrl,
        record.avatar_url,
        record.profile_image,
        record.image_url,
        record.ImageUrl,
        record.Image,
    ];

    for (const candidate of candidates) {
        if (typeof candidate === "string" && candidate.trim()) {
            return candidate;
        }
    }

    return null;
}

function DetailRow({ label, value }: ProfileDetail) {
    return (
        <View style={styles.detailRow}>
            <View style={styles.detailDot} />
            <View style={styles.detailCopy}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
            </View>
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

function OptionRow({ icon, title, subtitle, onPress }: OptionRowProps) {
    return (
        <Pressable
            style={({ pressed }) => [styles.optionRow, pressed && styles.optionRowPressed]}
            onPress={onPress}
        >
            <View style={styles.optionIcon}>
                <Ionicons name={icon} size={18} color="#0b2457" />
            </View>
            <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>{title}</Text>
                <Text style={styles.optionSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#64748b" />
        </Pressable>
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
            { label: "Joined", value: formatDate(data.CreatedAt) },
            { label: "Verification", value: formatBoolean(data.IsVerified) },
        ];

        if (data.BusinessProfile) {
            details.push(
                { label: "Owner", value: data.BusinessProfile.OwnerName || "-" },
                { label: "Business Type", value: data.BusinessProfile.BusinessType || "-" },
                { label: "Registration", value: data.BusinessProfile.RegistrationNumber || "-" },
                { label: "Approval", value: formatStatus(data.BusinessProfile.ApprovalStatus) },
            );
        }

        return {
            displayName: data.DisplayName || "Profile",
            role,
            joinedAt: data.CreatedAt,
            avatarUrl: extractProfileImage(data),
            stats: [
                { label: "Role", value: data.Role || "-" },
                { label: "Status", value: data.IsActive ? "Active" : "Inactive" },
                { label: "Docs", value: String(data.Documents?.length ?? 0) },
            ],
            details,
        } satisfies ScreenProfile;
    }, [data]);

    const handleLogout = () => {
        Alert.alert(
            "Log out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsLoggingOut(true);
                            await logout();
                            router.replace("/(auth)/login");
                        } catch {
                            Alert.alert("Logout failed", "Please try again.");
                        } finally {
                            setIsLoggingOut(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <ScreenHeader
                    title="Profile"
                    subtitle="Account details, updates, and privacy settings."
                />

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
                                {profile.avatarUrl ? (
                                    <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
                                ) : (
                                    <Ionicons name="person-outline" size={36} color="#0b2457" />
                                )}
                            </View>
                            <Text style={styles.name}>{profile.displayName}</Text>
                            <View style={styles.rolePill}>
                                <Text style={styles.role}>{profile.role}</Text>
                            </View>
                            <Text style={styles.joined}>Joined {formatDate(profile.joinedAt)}</Text>
                        </View>


                        <View style={styles.detailsCard}>
                            <Text style={styles.detailsTitle}>Account Overview</Text>
                            {profile.details.map((item, index) => (
                                <DetailRow key={`${item.label}-${index}`} label={item.label} value={item.value} />
                            ))}
                        </View>

                        <View style={styles.optionsCard}>
                            <OptionRow
                                icon="create-outline"
                                title="Update Profile Details"
                                subtitle="Edit name, phone number, and profile picture."
                                onPress={() => router.push("/profile/edit")}
                            />
                            <OptionRow
                                icon="settings-outline"
                                title="Settings & Privacy"
                                subtitle="Security and accessibility controls."
                                onPress={() => router.push("/profile/settings")}
                            />
                        </View>

                        <Pressable
                            style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
                            onPress={handleLogout}
                        >
                            <Ionicons name="log-out-outline" size={17} color="#ffffff" />
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
        paddingVertical: 16,
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
        width: 82,
        height: 82,
        borderRadius: 41,
        borderWidth: 1,
        borderColor: "#bbd8ee",
        backgroundColor: "#f8fcff",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        marginBottom: 8,
    },
    avatarImage: {
        width: "100%",
        height: "100%",
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
        padding: 14,
    },
    detailsTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: "#0b2457",
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        paddingVertical: 8,
    },
    detailDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#93c5fd",
        marginTop: 6,
    },
    detailCopy: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 11,
        color: "#5b6b86",
        fontWeight: "700",
        marginBottom: 2,
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },
    detailValue: {
        fontSize: 15,
        color: "#0f172a",
        fontWeight: "500",
    },
    optionsCard: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#dbe7ff",
        overflow: "hidden",
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#edf2ff",
    },
    optionRowPressed: {
        opacity: 0.86,
    },
    optionIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#eff6ff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#dbe7ff",
    },
    optionCopy: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0f172a",
    },
    optionSubtitle: {
        marginTop: 2,
        fontSize: 11,
        color: "#5b6b86",
        fontWeight: "500",
    },
    logoutBtn: {
        height: 46,
        backgroundColor: "#991b1b",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#7f1d1d",
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
        color: "#ffffff",
        fontWeight: "700",
    },
    retryText: {
        fontSize: 13,
        color: "#1d4ed8",
        fontWeight: "600",
    },
});
