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
  updateGymGoal: (goal: number) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  gymGoal: undefined,
  updateGymGoal: () => {},
});

const appRedirectUrl = makeRedirectUri({ path: "(tabs)/leaderboard" });

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [gymGoal, setGymGoal] = useState<number | undefined>(undefined);

  const updateGymGoal = (goal: number) => {
    setGymGoal(goal);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user);

      supabase.functions
        .invoke("get_goal")
        .then((response) => {
          if (response.error) return;
          setGymGoal(
            typeof response.data.goal === "number"
              ? response.data.goal
              : undefined
          );
        })
        .catch(console.error);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, gymGoal, updateGymGoal }}>
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
