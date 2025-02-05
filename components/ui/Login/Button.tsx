import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

interface button{
    title: string
    color?: string
    onClick: ()=> void
}

const Button: React.FC<button> = ({title, color, onClick}) =>{
    <TouchableOpacity>
        <Text>{title}</Text>
    </TouchableOpacity>
}



export default Button;