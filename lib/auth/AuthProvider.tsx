import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { makeRedirectUri } from "expo-auth-session";
import { getQueryParams } from "expo-auth-session/build/QueryParams";
import { openAuthSessionAsync } from "expo-web-browser";
import { session$ } from "../legendState/session";

// Auth configuration
const AUTH_REDIRECT = __DEV__
  ? "com.c0re.app://auth/callback"
  : makeRedirectUri({ path: "(tabs)/leaderboard" });

const AuthContext = createContext<{ isInitialized: boolean }>({
  isInitialized: false,
});

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        //console.log("AuthProvider: session", session);

        if (isMounted) {
          session$.user.set(session?.user ?? null);
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
        session$.user.set(session?.user ?? null);
        //console.log("AuthProvider: onAuthStateChange, user", session?.user);
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
    <AuthContext.Provider value={{ isInitialized }}>
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

  console.log("AuthProvider: authResult", authResult);

  if (authResult.type === "cancel") return;
  if (authResult.type !== "success" || !authResult.url) return;

  const { params, errorCode } = getQueryParams(authResult.url);
  if (errorCode) throw new Error(errorCode);

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: params.access_token,
    refresh_token: params.refresh_token,
  });

  if (sessionError) throw sessionError;

  const { data: sessionData, error: getSessionError } =
    await supabase.auth.getSession();
  console.log("Session after setSession:", sessionData, getSessionError);
}
