import { useAuth } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export function useRealName() {
  const { realName, updateRealName } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const setRealName = async (name: string) => {
    try {
      setIsLoading(true);

      // Update Supabase first
      const result = await supabase.functions.invoke("set_name", {
        body: { real_name: name },
      });

      if (result.error) {
        throw result.error;
      }

      // Then update local state
      await updateRealName(name);
      return result;
    } catch (error) {
      console.error("Error setting name:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { realName, setRealName, isLoading };
}
