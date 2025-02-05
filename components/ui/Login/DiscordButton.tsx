import { View, TouchableOpacity, Text, StyleSheet, Image } from "react-native";

function signIn(){

}

export default function Button(){
    return (
        <View>
            <TouchableOpacity style={styles.button} onPress={signIn}>
                <Image source={require("../../../assets/images/discord-white-icon.webp")} style={styles.image}/>
                <Text style={styles.text}>Sign In with Discord</Text>
            </TouchableOpacity>
        </View>

    )

}

const styles = StyleSheet.create({
    button: {
        borderRadius: 15,
        borderWidth: 4,
        borderColor: "black",
        backgroundColor: "#5865F2",
        flexDirection: "row",
        alignItems: "center",
        opacity: .9,

    },
    text: {
        fontSize: 25,
        color: "white",
        marginHorizontal: 10
    },
    image: {
        height: 50,
        width: 60,
        marginLeft: 5
    }
})