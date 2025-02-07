import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

function createAccount() {}

export default function SignUp() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                Don’t have an account?{" "}
                <TouchableOpacity onPress={createAccount}>
                    <Text style={styles.linkText}>Sign up</Text>
                </TouchableOpacity>
                .
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        paddingHorizontal: 16,
    },
    text: {
        fontSize: 14,
        color: "white",
        flexWrap: "wrap",
    },
    linkText: {
        color: "#1a73e8",
        fontSize: 14,
        textDecorationLine: "underline",
    },
});
