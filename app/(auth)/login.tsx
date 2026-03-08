import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";


export default function LoginScreen() {
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View>
                    <Image
                        source={require("../../assets/logo.png")}
                        style={{ width: 90, height: 90, padding: 10 }}
                    />
                </View>
                <View style={styles.card}>
                    <Text style={styles.logo}>Dhune.np</Text>
                    <Text style={styles.subtitle}>Login to your account</Text>

                    <View style={styles.form}>
                        <View style={styles.field}>
                            <Text style={styles.label}>Email</Text>
                            <Input placeholder="example@gmail.com" />
                        </View>

                        <View style={styles.field}>
                            <View style={styles.passwordRow}>
                                <Text style={styles.label}>Password</Text>
                                <Text style={styles.forgot}>Forgot?</Text>
                            </View>
                            <Input placeholder="Password" secureTextEntry />
                        </View>

                        <Button title="Login" />

                        <Button title="Login with Google" variant="secondary" />

                        <Text style={styles.signupText}>
                            Don’t have an account?
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    card: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "white",
        borderRadius: 12,
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },

    logo: {
        fontSize: 28,
        fontWeight: "700",
        color: "#eab308",
        marginBottom: 6,
    },

    subtitle: {
        fontSize: 16,
        color: "#040947",
        marginBottom: 24,
    },

    form: {
        gap: 16,
    },

    field: {
        gap: 6,
    },

    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
    },

    passwordRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    forgot: {
        fontSize: 13,
        color: "#040947",
    },

    signupText: {
        textAlign: "center",
        marginTop: 16,
        color: "#6b7280",
    },
});