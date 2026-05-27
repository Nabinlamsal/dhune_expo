import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import KeyboardWrapper from "@/components/ui/KeyboardWrapper";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useDeleteProfileImage } from "@/hooks/users/useDeleteProfileImage";
import { useMyProfile } from "@/hooks/users/useMyProfile";
import { useUpdateMyProfile } from "@/hooks/users/useUpdateMyProfile";
import { useUploadProfileImage } from "@/hooks/users/useUploadProfileImage";
import { MyProfile } from "@/types/users/my-profile";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    AlertButton,
    ActionSheetIOS,
    Image,
    Platform,
    Pressable,
    SafeAreaView,
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
    const { theme } = useAppTheme();
    const { t } = useTranslation();
    const updateProfile = useUpdateMyProfile();
    const uploadProfileImage = useUploadProfileImage();
    const deleteProfileImage = useDeleteProfileImage();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);

    useEffect(() => {
        if (!data) return;
        setName(data.DisplayName || "");
        setPhone(normalizePhone(data.Phone || ""));
        setLocalAvatarUri(extractProfileImage(data));
    }, [data]);

    const uploadSelectedAsset = async (asset: ImagePicker.ImagePickerAsset) => {
        try {
            setLocalAvatarUri(asset.uri);

            const response = await uploadProfileImage.mutateAsync({
                image: {
                    uri: asset.uri,
                    name: asset.fileName ?? `profile-${Date.now()}.jpg`,
                    mimeType: asset.mimeType,
                },
            });

            if (response.imageUrl) {
                setLocalAvatarUri(response.imageUrl);
            }

            Alert.alert(t("profileEdit.imageUpdated"), t("profileEdit.imageUpdatedMessage"));
        } catch {
            setLocalAvatarUri(data ? extractProfileImage(data) : null);
            Alert.alert(t("profileEdit.uploadFailed"), t("profileEdit.uploadFailedMessage"));
        }
    };

    const handlePickFromGallery = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(t("profileEdit.permissionNeeded"), t("profileEdit.galleryPermissionMessage"));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.85,
            allowsEditing: true,
            aspect: [1, 1],
        });

        if (!result.canceled) {
            await uploadSelectedAsset(result.assets[0]);
        }
    };

    const handleTakePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(t("profileEdit.permissionNeeded"), t("profileEdit.cameraPermissionMessage"));
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.85,
            allowsEditing: true,
            aspect: [1, 1],
        });

        if (!result.canceled) {
            await uploadSelectedAsset(result.assets[0]);
        }
    };

    const handleDeletePhoto = async () => {
        if (!localAvatarUri) {
            Alert.alert(t("profileEdit.noPhoto"), t("profileEdit.noPhotoMessage"));
            return;
        }

        try {
            await deleteProfileImage.mutateAsync();
            setLocalAvatarUri(null);
            Alert.alert(t("profileEdit.photoDeleted"), t("profileEdit.photoDeletedMessage"));
        } catch {
            Alert.alert(t("profileEdit.deleteFailed"), t("errors.defaultTryAgain"));
        }
    };

    const openPhotoActions = () => {
        const options = [t("profileEdit.chooseFromGallery"), t("profileEdit.takePhoto")];
        const actions = [
            () => void handlePickFromGallery(),
            () => void handleTakePhoto(),
        ];

        if (localAvatarUri) {
            options.push(t("profileEdit.deletePhoto"));
            actions.push(() => void handleDeletePhoto());
        }

        options.push(t("common.cancel"));

        if (Platform.OS === "ios") {
            const cancelButtonIndex = options.length - 1;
            const destructiveButtonIndex = localAvatarUri ? options.length - 2 : undefined;

            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options,
                    cancelButtonIndex,
                    destructiveButtonIndex,
                },
                (selectedIndex) => {
                    if (selectedIndex < actions.length) {
                        actions[selectedIndex]();
                    }
                }
            );
            return;
        }

        const menu: AlertButton[] = [
            { text: t("profileEdit.chooseFromGallery"), onPress: () => void handlePickFromGallery() },
            { text: t("profileEdit.takePhoto"), onPress: () => void handleTakePhoto() },
        ];

        if (localAvatarUri) {
            menu.push({
                text: t("profileEdit.deletePhoto"),
                style: "destructive",
                onPress: () => void handleDeletePhoto(),
            } as const);
        }

        menu.push({ text: t("common.cancel"), style: "cancel" } as const);
        Alert.alert(t("profileEdit.profilePhoto"), t("profileEdit.chooseAction"), menu);
    };

    const handleSave = async () => {
        const trimmedName = name.trim();
        const normalizedPhone = normalizePhone(phone);

        if (!trimmedName) {
            Alert.alert(t("profileEdit.invalidName"), t("profileEdit.enterNameMessage"));
            return;
        }

        if (normalizedPhone.length !== 10) {
            Alert.alert(t("profileEdit.invalidPhone"), t("profileEdit.phoneLengthMessage"));
            return;
        }

        try {
            await updateProfile.mutateAsync({
                name: trimmedName,
                phone: normalizedPhone,
            });

            Alert.alert(t("profileEdit.profileUpdated"), t("profileEdit.profileUpdatedMessage"));
        } catch {
            Alert.alert(t("settings.updateFailed"), t("errors.defaultTryAgain"));
        }
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <KeyboardWrapper
                contentContainerStyle={styles.container}
                scrollViewProps={{ showsVerticalScrollIndicator: false }}
                dismissOnTap={false}
            >
                    <ScreenHeader
                        title={t("profileEdit.title")}
                        subtitle={t("profileEdit.subtitle")}
                        backHref="/(tabs)/profile"
                    />

                    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={[styles.photoCard, { borderBottomColor: theme.border }]}>
                            <Pressable
                                style={({ pressed }) => [styles.avatarWrap, pressed && styles.pressed]}
                                onPress={openPhotoActions}
                            >
                                <View style={[styles.avatar, { backgroundColor: theme.surfaceMuted, borderColor: theme.borderStrong }]}>
                                    {localAvatarUri ? (
                                        <Image source={{ uri: localAvatarUri }} style={styles.avatarImage} />
                                    ) : (
                                        <Ionicons name="person-outline" size={34} color={theme.primary} />
                                    )}
                                </View>
                                <View style={[styles.avatarBadge, { backgroundColor: theme.primary, borderColor: theme.card }]}>
                                    <Ionicons
                                        name={uploadProfileImage.isPending ? "sync" : "camera-outline"}
                                        size={13}
                                        color="#ffffff"
                                    />
                                </View>
                            </Pressable>
                            <Text style={[styles.photoTitle, { color: theme.primary }]}>
                                {t("profileEdit.profilePicture")}
                            </Text>
                            <Text style={[styles.photoSubtitle, { color: theme.textMuted }]}>
                                {uploadProfileImage.isPending
                                    ? t("profileEdit.uploadingImage")
                                    : deleteProfileImage.isPending
                                        ? t("profileEdit.deletingImage")
                                        : t("profileEdit.photoHint")}
                            </Text>
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, { color: theme.primary }]}>{t("common.name")}</Text>
                            <Input
                                placeholder={t("forms.enterName")}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, { color: theme.primary }]}>{t("common.phone")}</Text>
                            <Input
                                placeholder={t("forms.phoneShortPlaceholder")}
                                value={phone}
                                onChangeText={(value) => setPhone(normalizePhone(value))}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                            <Text style={[styles.helper, { color: theme.textMuted }]}>
                                {t("profileEdit.phoneLengthHelper")}
                            </Text>
                        </View>

                        <Button
                            title={updateProfile.isPending ? t("common.saving") : t("profileEdit.saveChanges")}
                            onPress={handleSave}
                        />
                    </View>
            </KeyboardWrapper>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    container: {
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 20,
    },
    card: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
    },
    photoCard: {
        alignItems: "center",
        paddingBottom: 16,
        marginBottom: 14,
        borderBottomWidth: 1,
    },
    avatarWrap: {
        marginBottom: 10,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 1,
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
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    photoTitle: {
        fontSize: 14,
        fontWeight: "800",
    },
    photoSubtitle: {
        marginTop: 4,
        fontSize: 11,
        fontWeight: "500",
        textAlign: "center",
        lineHeight: 17,
    },
    field: {
        marginBottom: 14,
    },
    label: {
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 6,
    },
    helper: {
        marginTop: 6,
        fontSize: 11,
        fontWeight: "500",
    },
    pressed: {
        opacity: 0.85,
    },
});
