import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.textHolder}>
        <Text style={styles.text}>
            Login to
        </Text>
        <Text style={styles.text}>
            Your Account
        </Text>
    </View>
  );
}

const styles = StyleSheet.create({
    text: {
        fontSize: 50
    },
    textHolder: {
      marginTop: 20,
      justifyContent: 'center',
      alignItems: 'center'
    }
})