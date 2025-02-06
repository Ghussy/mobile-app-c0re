import {
  Image,
  StyleSheet,
  Platform,
  View,
  ImageBackground,
  TextInput,
  Text,
  Dimensions,
} from "react-native";

import Logo from "@/components/ui/Login/Logo";
import Button from "@/components/ui/Login/Button";
import DiscordButton from "@/components/ui/Login/DiscordButton";
import SignUp from "@/components/ui/Login/SignUp";
const { width } = Dimensions.get("window");


export default function HomeScreen() {
  return (
    <ImageBackground
      source={require("../../assets/images/background.webp")}
      style={styles.backgroundContainer}
    >
      <Logo />
      <View style={styles.buttonsLayout}>
        <DiscordButton />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    backgroundColor: "gray",
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsLayout: {
    marginTop: 59,
  },
});
