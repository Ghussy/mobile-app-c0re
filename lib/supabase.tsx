import { AppState } from "react-native";
import { createContext, useContext, useState, useEffect } from "react";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, User } from "@supabase/supabase-js";
import { makeRedirectUri } from "expo-auth-session";
import { getQueryParams } from "expo-auth-session/build/QueryParams";
import { openAuthSessionAsync } from "expo-web-browser";

// Auth configuration
const AUTH_REDIRECT = __DEV__
  ? "com.c0re.app://auth/callback"
  : makeRedirectUri({ path: "(tabs)/leaderboard" });

// Storage keys
const ASYNC_STORAGE_GYM_GOAL_KEY = "@gym_goal";
const ASYNC_STORAGE_REAL_NAME_KEY = "@real_name";

interface AuthContextType {
  user: User | undefined;
  gymGoal: number | undefined;
  realName: string | undefined;
  isInitialized: boolean;
  updateGymGoal: (goal: number) => void;
  updateRealName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  gymGoal: undefined,
  realName: undefined,
  isInitialized: false,
  updateGymGoal: () => {},
  updateRealName: () => {},
});

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [gymGoal, setGymGoal] = useState<number | undefined>(undefined);
  const [realName, setRealName] = useState<string | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);

  const updateGymGoal = async (goal: number) => {
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_GYM_GOAL_KEY, goal.toString());
      setGymGoal(goal);
    } catch (error) {
      console.error("Error updating gym goal:", error);
      throw error;
    }
  };

  const updateRealName = async (name: string) => {
    try {
      await AsyncStorage.setItem(ASYNC_STORAGE_REAL_NAME_KEY, name);
      setRealName(name);
    } catch (error) {
      console.error("Error updating real name:", error);
      throw error;
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        // Get session and stored data
        const [
          {
            data: { session },
          },
          storedGoal,
          storedName,
        ] = await Promise.all([
          supabase.auth.getSession(),
          AsyncStorage.getItem(ASYNC_STORAGE_GYM_GOAL_KEY),
          AsyncStorage.getItem(ASYNC_STORAGE_REAL_NAME_KEY),
        ]);

        if (isMounted) {
          if (session?.user) setUser(session.user);
          if (storedGoal) setGymGoal(parseInt(storedGoal, 10));
          if (storedName) setRealName(storedName);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error during initialization:", error);
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!isInitialized) {
    return null; // or loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        gymGoal,
        realName,
        isInitialized,
        updateGymGoal,
        updateRealName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Create Supabase client
export const supabase = createClient(
  __DEV__
    ? "http://192.168.0.160:54321"
    : process.env.EXPO_PUBLIC_SUPABASE_URL!,
  __DEV__
    ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    : process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Discord OAuth sign-in
export async function signInWithDiscord() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: AUTH_REDIRECT,
      skipBrowserRedirect: true,
      scopes: "identify email guilds",
    },
  });

  if (error) throw error;

  const authResult = await openAuthSessionAsync(data.url, AUTH_REDIRECT, {
    showInRecents: true,
    preferEphemeralSession: true,
  });

  if (authResult.type === "cancel") return;
  if (authResult.type !== "success" || !authResult.url) return;

  const { params, errorCode } = getQueryParams(authResult.url);
  if (errorCode) throw new Error(errorCode);

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: params.access_token,
    refresh_token: params.refresh_token,
  });

  if (sessionError) throw sessionError;
}

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
