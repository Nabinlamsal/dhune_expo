import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSignup } from "@/hooks/auth/useSignup";
import { Ionicons } from "@expo/vector-icons";
import AuthScreen from "@/components/ui/AuthScreen";
import PasswordInput from "@/components/ui/PasswordInput";
import { useAppTheme } from "@/contexts/ThemeContext";

type AccountType = "user" | "business";

const buildSignupFormData = (params: {
    accountType: AccountType;
    name: string;
    owner: string;
    businessType: string;
    registrationNumber: string;
    email: string;
    phone: string;
    password: string;
    documentFile: DocumentPicker.DocumentPickerAsset | null;
}) => {
    const formData = new FormData();

    formData.append("role", params.accountType);
    formData.append("display_name", params.name.trim());
    formData.append("email", params.email.trim());
    formData.append("phone", params.phone.trim());
    formData.append("password", params.password);

    if (params.accountType === "business") {
        formData.append("owner_name", params.owner.trim());
        formData.append("business_type", params.businessType.trim());
        formData.append("registration_number", params.registrationNumber.trim());

        if (params.documentFile) {
            formData.append("documents", {
                uri: params.documentFile.uri,
                name: params.documentFile.name,
                type: params.documentFile.mimeType ?? "application/octet-stream",
            } as any);
        }
    }

    return formData;
};

export default function SignupScreen() {
    const signup = useSignup();
    const { theme } = useAppTheme();
    const [accountType, setAccountType] = useState<AccountType>("user");
    const [name, setName] = useState("");
    const [owner, setOwner] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [documentFile, setDocumentFile] =
        useState<DocumentPicker.DocumentPickerAsset | null>(null);

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({});
        if (!result.canceled) {
            setDocumentFile(result.assets[0]);
        }
    };

    const handleSignup = async () => {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedPhone = phone.trim();

        if (!trimmedName || !trimmedEmail || !trimmedPhone || !password) {
            Alert.alert("Missing details", "Please complete all required fields.");
            return;
        }

        if (accountType === "business" && (!owner.trim() || !businessType.trim())) {
            Alert.alert("Missing details", "Please complete the business details.");
            return;
        }

        try {
            const response = await signup.mutateAsync(
                buildSignupFormData({
                    accountType,
                    name,
                    owner,
                    businessType,
                    registrationNumber,
                    email,
                    phone,
                    password,
                    documentFile,
                })
            );

            if (response.verification_required) {
                router.replace({
                    pathname: "/(auth)/verify-email" as any,
                    params: {
                        email: trimmedEmail,
                        source: "signup",
                        expiresIn: String(response.otp_expires_in_seconds ?? ""),
                    },
                });
                return;
            }

            Alert.alert("Signup complete", response.message || "Account created successfully.");
            router.replace("/(auth)/login");
        } catch {
            Alert.alert("Signup failed", "Please review your details and try again.");
        }
    };

    return (
        <AuthScreen
            title="Create Account"
            subtitle="Set up a personal or business account to request pickups, compare offers, and manage laundry operations."
            showBackButton
            onBackPress={() => router.back()}
            scrollable
            header={
                <View style={styles.brandHeader}>
                    <Image
                        source={require("../../assets/logo.png")}
                        style={styles.brandLogo}
                        resizeMode="contain"
                    />
                    <Text style={[styles.brandText, { color: theme.accent }]}>Dhune.np</Text>
                </View>
            }
            footer={
                <Pressable
                    style={styles.loginLink}
                    onPress={() => router.replace("/(auth)/login")}
                >
                    <Text style={[styles.loginText, { color: theme.textMuted }]}>
                        Already have an account? <Text style={[styles.loginHighlight, { color: theme.primary }]}>Login</Text>
                    </Text>
                </Pressable>
            }
        >
            <View style={styles.typeSelector}>
                <Pressable
                    style={[
                        styles.typeButton,
                        { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
                        accountType === "user" && { backgroundColor: theme.accent, borderColor: theme.accent },
                    ]}
                    onPress={() => setAccountType("user")}
                >
                    <Text
                        style={[
                            styles.typeText,
                            { color: theme.text },
                            accountType === "user" && { color: "#0b2457" },
                        ]}
                    >
                        Normal User
                    </Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.typeButton,
                        { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
                        accountType === "business" && { backgroundColor: theme.accent, borderColor: theme.accent },
                    ]}
                    onPress={() => setAccountType("business")}
                >
                    <Text
                        style={[
                            styles.typeText,
                            { color: theme.text },
                            accountType === "business" && { color: "#0b2457" },
                        ]}
                    >
                        Business
                    </Text>
                </Pressable>
            </View>

            {accountType === "user" && (
                <>
                    <View style={styles.field}>
                        <Text style={[styles.label, { color: theme.primary }]}>Full Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                            placeholderTextColor={theme.inputPlaceholder}
                            placeholder="Example: Ram Sharma"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.label, { color: theme.primary }]}>Phone</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                            placeholderTextColor={theme.inputPlaceholder}
                            placeholder="+977 98XXXXXXXX"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.label, { color: theme.primary }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                            placeholderTextColor={theme.inputPlaceholder}
                            placeholder="example@email.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.label, { color: theme.primary }]}>Password</Text>
                        <PasswordInput
                            placeholder="Create a strong password"
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                </>
            )}

            {accountType === "business" && (
                <>
                    <View style={styles.field}>
                        <Text style={[styles.label, { color: theme.primary }]}>Business Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                            placeholderTextColor={theme.inputPlaceholder}
                            placeholder="Everest Hospital Pvt Ltd"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.label, { color: theme.primary }]}>Owner Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                            placeholderTextColor={theme.inputPlaceholder}
                            placeholder="Owner's legal name"
                            value={owner}
                            onChangeText={setOwner}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.label, { color: theme.primary }]}>Business Type</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                            placeholderTextColor={theme.inputPlaceholder}
                            placeholder="Hotel, Hospital, Hostel"
                            value={businessType}
                            onChangeText={setBusinessType}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.label, { color: theme.primary }]}>Registration Number</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                            placeholderTextColor={theme.inputPlaceholder}
                            placeholder="Official registration number"
                            value={registrationNumber}
                            onChangeText={setRegistrationNumber}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.label, { color: theme.primary }]}>Registration Document</Text>
                        <Pressable style={[styles.uploadButton, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]} onPress={pickDocument}>
                            <Ionicons name="document-outline" size={18} color={theme.primary} />
                            <Text style={[styles.uploadText, { color: theme.text }]}>
                                {documentFile
                                    ? documentFile.name
                                    : "Upload registration document"}
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.label, { color: theme.primary }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                            placeholderTextColor={theme.inputPlaceholder}
                            placeholder="business@email.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.label, { color: theme.primary }]}>Phone</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                            placeholderTextColor={theme.inputPlaceholder}
                            placeholder="+977 98XXXXXXXX"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.label, { color: theme.primary }]}>Password</Text>
                        <PasswordInput
                            placeholder="Create a strong password"
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                </>
            )}

            <Pressable style={[styles.button, { backgroundColor: theme.mode === "dark" ? theme.primary : "#040947" }]} onPress={handleSignup}>
                <Text style={styles.buttonText}>
                    {signup.isPending ? "Creating..." : "Create Account"}
                </Text>
            </Pressable>
        </AuthScreen>
    );
}

const styles = StyleSheet.create({
    brandHeader: {
        alignItems: "center",
    },
    brandLogo: {
        width: 64,
        height: 64,
        marginBottom: 10,
    },
    brandText: {
        fontSize: 24,
        fontWeight: "800",
    },
    typeSelector: {
        flexDirection: "row",
        gap: 10,
    },
    typeButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    typeText: {
        fontWeight: "700",
    },
    field: {
        marginBottom: 14,
    },
    label: {
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 8,
    },
    input: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    uploadButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    uploadText: {
        marginLeft: 8,
        fontWeight: "600",
    },
    button: {
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 6,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "700",
    },
    loginLink: {
        marginTop: 22,
        alignItems: "center",
    },
    loginText: {
        fontSize: 15,
    },
    loginHighlight: {
        fontWeight: "700",
    },
});
