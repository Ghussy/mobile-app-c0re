import { View, TouchableOpacity, Text, StyleSheet, Image } from "react-native";

interface button{
    title: string
    backgroundColor?: string
    onClick: ()=> void
    showImage?: boolean
}

const Button: React.FC<button> = ({title, backgroundColor, onClick, showImage}) =>{
    return (
        <View>
            <TouchableOpacity style={[styles.button, {backgroundColor}]} onPress={onClick}>
            {showImage && (<Image source={require("../../../assets/images/discord-white-icon.webp")} style={styles.image}/>)}
                <Text style={styles.text}>{title}</Text>
            </TouchableOpacity>
        </View>

    )

}

const styles = StyleSheet.create({
    button: {
        borderRadius: 15,
        borderWidth: 4,
        borderColor: "black",
        backgroundColor: "black",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center',
    },
    text: {
        fontSize: 30,
        color: "white",
        marginHorizontal: 10
    },
    image: {
        height: 60,
        width: 70,
    }
})

export default Button;