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
      <View style={styles.formContainer}>
        <View>
          <Text style={styles.infoText}>Enter your login information</Text>
        </View>
        <View>
          <View style={styles.inputHolder}>
            <Image
              source={require("../../../mobile-app-c0re/assets/images/mail.png")}
              style={styles.image}
            />
            <TextInput
              placeholder="Email"
              style={styles.inputContainer}
            ></TextInput>
          </View>

          <View style={styles.inputHolder}>
            <Image
              source={require("../../../mobile-app-c0re/assets/images/padlock.png")}
              style={styles.image}
            />
            <TextInput
              placeholder="Password"
              style={styles.inputContainer}
            ></TextInput>
          </View>
        </View>
        <View style={styles.buttonsLayout}>
          <Button title="login" onClick={signIn}></Button>
          <Text style={styles.infoText}>Or</Text>
          <DiscordButton />
          <SignUp />
        </View>
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
