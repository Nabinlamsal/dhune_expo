import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function SignupScreen() {
    const [accountType, setAccountType] = useState<"user" | "business">("user");

    const [name, setName] = useState("");
    const [owner, setOwner] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const [documentFile, setDocumentFile] = useState<any>(null);

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({});
        if (!result.canceled) {
            setDocumentFile(result.assets[0]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {/* Back Button */}
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={22} color="#040947" />
                    <Text style={styles.backText}>Back</Text>
                </Pressable>

                {/* Title */}
                <Text style={styles.title}>Create Account</Text>

                {/* Account Type */}
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

                {/* USER SIGNUP */}
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
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Create a strong password"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>
                    </>
                )}

                {/* BUSINESS SIGNUP */}
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
                                <Ionicons name="document-outline" size={18} color="#333" />
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
                            <TextInput
                                style={styles.input}
                                placeholder="Create a strong password"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>
                    </>
                )}

                {/* Submit */}
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Create Account</Text>
                </Pressable>

                {/* Login link */}
                <Pressable
                    style={styles.loginLink}
                    onPress={() => router.replace("/(auth)/login")}
                >
                    <Text style={styles.loginText}>
                        Already have an account? <Text style={styles.loginHighlight}>Login</Text>
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },

    scroll: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },

    backButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 10,
    },

    backText: {
        marginLeft: 6,
        fontSize: 16,
        color: "#040947",
        fontWeight: "500",
    },

    title: {
        fontSize: 30,
        fontWeight: "700",
        color: "#040947",
        marginBottom: 20,
    },

    typeSelector: {
        flexDirection: "row",
        marginBottom: 20,
    },

    typeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        alignItems: "center",
        marginRight: 10,
    },

    activeType: {
        backgroundColor: "#ebbc01",
    },

    typeText: {
        fontWeight: "600",
        color: "#333",
    },

    activeTypeText: {
        color: "#040947",
    },

    field: {
        marginBottom: 14,
    },

    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#040947",
        marginBottom: 6,
    },

    input: {
        backgroundColor: "white",
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ddd",
    },

    uploadButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        borderRadius: 10,
        backgroundColor: "#e5e7eb",
    },

    uploadText: {
        marginLeft: 8,
        fontWeight: "500",
    },

    button: {
        backgroundColor: "#040947",
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },

    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },

    loginLink: {
        marginTop: 18,
        alignItems: "center",
    },

    loginText: {
        fontSize: 15,
        color: "#555",
    },

    loginHighlight: {
        color: "#040947",
        fontWeight: "600",
    },
});