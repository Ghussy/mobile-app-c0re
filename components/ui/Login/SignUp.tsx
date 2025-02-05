import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

function createAccount() {}

export default function SignUp() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                If you don’t have an account, please sign up{" "}
                <TouchableOpacity onPress={createAccount}>
                    <Text style={styles.linkText}>here</Text>
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
        color: "#000",
        flexWrap: "wrap",
    },
    linkText: {
        color: "#1a73e8",
        fontSize: 14,
        textDecorationLine: "underline",
    },
});
