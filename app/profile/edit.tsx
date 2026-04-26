import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useMyProfile } from "@/hooks/users/useMyProfile";
import { useUpdateMyProfile } from "@/hooks/users/useUpdateMyProfile";
import { useUploadProfileImage } from "@/hooks/users/useUploadProfileImage";
import { MyProfile } from "@/types/users/my-profile";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

function normalizePhone(value: string) {
    return value.replace(/\D/g, "").slice(0, 10);
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

export default function EditProfileScreen() {
    const { data } = useMyProfile();
    const updateProfile = useUpdateMyProfile();
    const uploadProfileImage = useUploadProfileImage();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);

    useEffect(() => {
        if (!data) return;
        setName(data.DisplayName || "");
        setPhone(normalizePhone(data.Phone || ""));
        setLocalAvatarUri(extractProfileImage(data));
    }, [data]);

    const handleUploadImage = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["image/*"],
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (result.canceled) {
                return;
            }

            const asset = result.assets[0];
            setLocalAvatarUri(asset.uri);

            const response = await uploadProfileImage.mutateAsync({
                image: {
                    uri: asset.uri,
                    name: asset.name,
                    mimeType: asset.mimeType,
                },
            });

            if (response.imageUrl) {
                setLocalAvatarUri(response.imageUrl);
            }

            Alert.alert("Profile image updated", "Your profile image has been updated.");
        } catch {
            setLocalAvatarUri(data ? extractProfileImage(data) : null);
            Alert.alert("Upload failed", "Please try again with another image.");
        }
    };

    const handleSave = async () => {
        const trimmedName = name.trim();
        const normalizedPhone = normalizePhone(phone);

        if (!trimmedName) {
            Alert.alert("Invalid name", "Please enter your name.");
            return;
        }

        if (normalizedPhone.length !== 10) {
            Alert.alert("Invalid phone", "Phone number must contain exactly 10 digits.");
            return;
        }

        try {
            await updateProfile.mutateAsync({
                name: trimmedName,
                phone: normalizedPhone,
            });

            Alert.alert("Profile updated", "Your profile details have been updated.");
        } catch {
            Alert.alert("Update failed", "Please try again.");
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={styles.safe}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                    <ScreenHeader
                        title="Update Profile"
                        subtitle="Edit your account details."
                        backHref="/(tabs)/profile"
                    />

                    <View style={styles.card}>
                        <View style={styles.photoCard}>
                            <Pressable
                                style={({ pressed }) => [styles.avatarWrap, pressed && styles.pressed]}
                                onPress={handleUploadImage}
                            >
                                <View style={styles.avatar}>
                                    {localAvatarUri ? (
                                        <Image source={{ uri: localAvatarUri }} style={styles.avatarImage} />
                                    ) : (
                                        <Ionicons name="person-outline" size={34} color="#0b2457" />
                                    )}
                                </View>
                                <View style={styles.avatarBadge}>
                                    <Ionicons
                                        name={uploadProfileImage.isPending ? "sync" : "camera-outline"}
                                        size={13}
                                        color="#ffffff"
                                    />
                                </View>
                            </Pressable>
                            <Text style={styles.photoTitle}>Profile Picture</Text>
                            <Text style={styles.photoSubtitle}>
                                {uploadProfileImage.isPending
                                    ? "Uploading selected image..."
                                    : "Tap the image to change or set your profile picture."}
                            </Text>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Name</Text>
                            <Input
                                placeholder="Enter your name"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Phone</Text>
                            <Input
                                placeholder="98XXXXXXXX"
                                value={phone}
                                onChangeText={(value) => setPhone(normalizePhone(value))}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                            <Text style={styles.helper}>Phone number must be exactly 10 digits.</Text>
                        </View>

                        <Button
                            title={updateProfile.isPending ? "Saving..." : "Save Changes"}
                            onPress={handleSave}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#dbe7ff",
        padding: 14,
    },
    photoCard: {
        alignItems: "center",
        paddingBottom: 16,
        marginBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#edf2ff",
    },
    avatarWrap: {
        marginBottom: 10,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 1,
        borderColor: "#bbd8ee",
        backgroundColor: "#f8fcff",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    avatarBadge: {
        position: "absolute",
        right: 0,
        bottom: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#0b2457",
        borderWidth: 2,
        borderColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
    },
    photoTitle: {
        fontSize: 14,
        fontWeight: "800",
        color: "#0b2457",
    },
    photoSubtitle: {
        marginTop: 4,
        fontSize: 11,
        color: "#64748b",
        fontWeight: "500",
        textAlign: "center",
        lineHeight: 17,
    },
    field: {
        marginBottom: 14,
    },
    label: {
        fontSize: 12,
        color: "#0b2457",
        fontWeight: "700",
        marginBottom: 6,
    },
    helper: {
        marginTop: 6,
        fontSize: 11,
        color: "#64748b",
        fontWeight: "500",
    },
    pressed: {
        opacity: 0.85,
    },
});
