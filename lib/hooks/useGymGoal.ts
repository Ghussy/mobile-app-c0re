import { useAuth } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export function useGymGoal() {
  const { gymGoal, updateGymGoal } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const setGymGoal = async (goal: number) => {
    try {
      setIsLoading(true);

      // Update Supabase first
      const result = await supabase.functions.invoke("set_goal", {
        body: { goal },
      });

      if (result.error) {
        throw result.error;
      }

      // Then update local state
      await updateGymGoal(goal);
      return result;
    } catch (error) {
      console.error("Error setting gym goal:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { gymGoal, setGymGoal, isLoading };
}
