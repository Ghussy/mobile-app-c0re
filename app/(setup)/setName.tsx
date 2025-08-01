import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import Button from "@/components/ui/Button";
import { useRouter, useLocalSearchParams, Redirect } from "expo-router";
import DiscordIcon from "@/components/ui/icons/DiscordIcon";
import { observer, use$ } from "@legendapp/state/react";
import { session$ } from "@/lib/legendState/session";
import { setRealName } from "@/lib/legendState";

// observer → tracks every `.get()` / use$ inside automatically
export default observer(function SetNameScreen() {
  const [localName, setLocalName] = useState("");
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isEditing } = useLocalSearchParams<{ isEditing?: string }>();
  const user = use$(session$.user); // reactive

  if (!user) {
    console.log("No user found, redirecting to auth");
    return <Redirect href="/(auth)" />;
  }

  const discordData = user.user_metadata;
  const avatarUrl = discordData?.avatar_url;

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      setRealName(localName);

      if (isEditing) {
        router.back();
      } else {
        router.replace("/(setup)/setGoal");
      }
    } catch (error) {
      console.error("Error saving name:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.wrapper}>
        <View style={[styles.authSection, { zIndex: 2 }]}>
          <View style={styles.infoContainer}>
            <Text style={styles.title}>
              {isEditing ? "Update Your Name" : "Help others recognize you!"}
            </Text>
            <Text style={styles.description}>
              Since Discord usernames aren't always clear, please provide your
              real name.
            </Text>

            <View style={styles.userInfoWrapper}>
              {avatarUrl && !imageError ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.profileImage}
                  onError={() => setImageError(true)}
                />
              ) : (
                <View style={[styles.profileImage, styles.placeholderImage]} />
              )}
              <View style={styles.discordInfo}>
                <DiscordIcon />
                <Text style={styles.userName}>
                  {discordData?.full_name || "Discord Username"}
                </Text>
              </View>
            </View>

            <TextInput
              style={styles.input}
              onChangeText={setLocalName}
              value={localName}
              placeholder="Enter your name"
              placeholderTextColor="#A1A1AA"
            />

            <Button
              disabled={localName.length < 1 || isLoading}
              onPress={handleContinue}
              loading={isLoading}
            >
              {isEditing ? "Save Changes" : "Continue"}
            </Button>
          </View>

          <Image
            source={require("@/assets/images/bottom-flare.png")}
            style={styles.backgroundFlare}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  wrapper: {
    flex: 1,
  },
  authSection: {
    width: "100%",
    backgroundColor: "#101012",
    alignItems: "center",
    borderTopColor: "#212123",
    borderTopWidth: 3,
    height: 750,
    paddingVertical: 30,
    paddingHorizontal: 20,
    bottom: 0,
    marginTop: 120,
  },
  backgroundFlare: {
    position: "absolute",
    zIndex: -1,
    width: "150%",
    height: 340,
    bottom: 0,
  },
  infoContainer: {
    width: 325,
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 25,
    textAlign: "center",
    marginVertical: 20,
  },
  description: {
    color: "#A1A1AA",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 35,
  },
  input: {
    backgroundColor: "black",
    color: "#A1A1AA",
    borderRadius: 7,
    borderColor: "#212123",
    borderWidth: 1,
    width: "100%",
    marginTop: 30,
    height: 55,
    paddingLeft: 15,
    marginBottom: 10,
  },
  discordInfo: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    alignItems: "center",
    paddingVertical: 5,
  },
  discordIcon: {
    height: "100%",
    width: 20,
    opacity: 0.4,
    marginRight: 5,
  },
  userName: {
    color: "#A1A1AA",
    textAlign: "center",
  },
  profileImage: {
    height: 100,
    width: 100,
    borderRadius: 100,
    marginBottom: 5,
  },
  userInfoWrapper: {
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "black",
    width: "100%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 7,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  placeholderImage: {
    backgroundColor: "#27272a",
  },
});
