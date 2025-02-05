import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View>
        <Text style={style.text}>
            LOGO
        </Text>
    </View>
  );
}

const style = StyleSheet.create({
    text: {
        fontSize: 100
    }
})