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
                    <Text style={styles.brandText}>Dhune.np</Text>
                </View>
            }
            footer={
                <Pressable
                    style={styles.loginLink}
                    onPress={() => router.replace("/(auth)/login")}
                >
                    <Text style={styles.loginText}>
                        Already have an account? <Text style={styles.loginHighlight}>Login</Text>
                    </Text>
                </Pressable>
            }
        >
            <View style={styles.typeSelector}>
                <Pressable
                    style={[
                        styles.typeButton,
                        accountType === "user" && styles.activeType,
                    ]}
                    onPress={() => setAccountType("user")}
                >
                    <Text
                        style={[
                            styles.typeText,
                            accountType === "user" && styles.activeTypeText,
                        ]}
                    >
                        Normal User
                    </Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.typeButton,
                        accountType === "business" && styles.activeType,
                    ]}
                    onPress={() => setAccountType("business")}
                >
                    <Text
                        style={[
                            styles.typeText,
                            accountType === "business" && styles.activeTypeText,
                        ]}
                    >
                        Business
                    </Text>
                </Pressable>
            </View>

            {accountType === "user" && (
                <>
                    <View style={styles.field}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Example: Ram Sharma"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Phone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+977 98XXXXXXXX"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="example@email.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Password</Text>
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
                        <Text style={styles.label}>Business Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Everest Hospital Pvt Ltd"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Owner Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Owner's legal name"
                            value={owner}
                            onChangeText={setOwner}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Business Type</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Hotel, Hospital, Hostel"
                            value={businessType}
                            onChangeText={setBusinessType}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Registration Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Official registration number"
                            value={registrationNumber}
                            onChangeText={setRegistrationNumber}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Registration Document</Text>
                        <Pressable style={styles.uploadButton} onPress={pickDocument}>
                            <Ionicons name="document-outline" size={18} color="#0b2457" />
                            <Text style={styles.uploadText}>
                                {documentFile
                                    ? documentFile.name
                                    : "Upload registration document"}
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="business@email.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Phone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+977 98XXXXXXXX"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Password</Text>
                        <PasswordInput
                            placeholder="Create a strong password"
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                </>
            )}

            <Pressable style={styles.button} onPress={handleSignup}>
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
        color: "#ebbc01",
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
        borderColor: "#dbe7ff",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fbff",
    },
    activeType: {
        backgroundColor: "#ebbc01",
        borderColor: "#ebbc01",
    },
    typeText: {
        fontWeight: "700",
        color: "#334155",
    },
    activeTypeText: {
        color: "#0b2457",
    },
    field: {
        marginBottom: 14,
    },
    label: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0b2457",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "white",
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#dbe7ff",
        color: "#0f172a",
    },
    uploadButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        borderRadius: 12,
        backgroundColor: "#f8fbff",
        borderWidth: 1,
        borderColor: "#dbe7ff",
    },
    uploadText: {
        marginLeft: 8,
        fontWeight: "600",
        color: "#334155",
    },
    button: {
        backgroundColor: "#040947",
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
        color: "#64748b",
    },
    loginHighlight: {
        color: "#0b2457",
        fontWeight: "700",
    },
});
