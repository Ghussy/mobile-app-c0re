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

function signIn() {}

function signInDiscord() {}

export default function HomeScreen() {
  return (
    <ImageBackground
      source={require("../../assets/images/background.webp")}
      style={styles.backgroundContainer}
    >
      <Logo />
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
  formContainer: {
    backgroundColor: "black",
    flex: 1,
    opacity: 0.7,
    width: width,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsLayout: {
    marginTop: 59,
  },
  inputContainer: {
    paddingLeft: 10,
    marginVertical: 10,
  },
  inputHolder: {
    flexDirection: "row",
    backgroundColor: "white",
    opacity: 0.3,
    borderRadius: 3,
    fontSize: 15,
    alignContent: "center",
    marginVertical: 10,
  },
  image: {
    height: 40,
    width: 40,
  },
  infoText: {
    color: "white",
    fontSize: 13,
  },
});
