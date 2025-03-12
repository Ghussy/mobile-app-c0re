import { AppState } from "react-native";
import { createContext, useContext, useState, useEffect } from "react";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, User } from "@supabase/supabase-js";
import { makeRedirectUri } from "expo-auth-session";
import { getQueryParams } from "expo-auth-session/build/QueryParams";
import { openAuthSessionAsync } from "expo-web-browser";

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

const appRedirectUrl = makeRedirectUri({ path: "(tabs)/leaderboard" });

const ASYNC_STORAGE_GYM_GOAL_KEY = "@gym_goal";
const ASYNC_STORAGE_REAL_NAME_KEY = "@real_name";

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

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export async function signInWithDiscord() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: appRedirectUrl,
      skipBrowserRedirect: true,
      scopes: "identify email",
    },
  });

  if (error) throw error;

  const authResult = await openAuthSessionAsync(data.url, appRedirectUrl, {
    showInRecents: true,
  });

  if (authResult.type !== "success") {
    throw new Error(
      `Authentication ${authResult.type}: ${JSON.stringify(authResult)}`
    );
  }

  const { params, errorCode } = getQueryParams(authResult.url);
  if (errorCode) throw new Error(errorCode);
  if (!params.access_token || !params.refresh_token) {
    throw new Error("Missing authentication tokens in response");
  }

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
