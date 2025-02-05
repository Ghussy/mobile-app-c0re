import { Image, StyleSheet, Platform, View } from 'react-native';
import Logo from '@/components/ui/Login/Logo'


export default function HomeScreen() {
  return (
    <View style={styles.backgroundContainer}>
      <Logo/>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    backgroundColor: "gray",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
