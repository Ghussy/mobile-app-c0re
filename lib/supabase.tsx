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
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  gymGoal: undefined,
});

const appRedirectUrl = makeRedirectUri({ path: "(tabs)/leaderboard" });

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [gymGoal, setGymGoal] = useState<number | undefined>(undefined);

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
          if (response.error) {
            return;
          }

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
    <AuthContext.Provider value={{ user, gymGoal }}>
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

export async function setGymGoal(goal: number) {
  supabase.functions.invoke("set_goal", {
    body: JSON.stringify({ goal }),
  });
}

export async function signInWithDiscord() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: appRedirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  const authResult = await openAuthSessionAsync(data.url, appRedirectUrl, {
    showInRecents: true, // prevent browser from closing while temporarily switching to another app
  });

  if (authResult.type !== "success") {
    throw new Error(
      "authentication " + authResult.type + ": " + JSON.stringify(authResult)
    );
  }

  const queryParamsResult = getQueryParams(authResult.url);

  if (queryParamsResult.errorCode) {
    throw new Error(queryParamsResult.errorCode);
  }

  const { access_token, refresh_token } = queryParamsResult.params;
  const sessionResult = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (sessionResult.error) {
    throw sessionResult.error;
  }
}

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
