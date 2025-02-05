import { Image, StyleSheet, Platform, View } from 'react-native';
import Logo from '@/components/ui/Login/Logo'
import Button from '@/components/ui/Login/Button'
import DiscordButton from '@/components/ui/Login/DiscordButton'
import SignUp from '@/components/ui/Login/SignUp'




function signIn(){

}

function signInDiscord(){

}

export default function HomeScreen() {
  return (
    <View style={styles.backgroundContainer}>
      <Logo/>
      <View>
        
      </View>
      <Button title='login' onClick={signIn}></Button>
      <DiscordButton/>
      <SignUp/>
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
