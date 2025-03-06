import { useAuth } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export function useGymGoal() {
  const { gymGoal, updateGymGoal } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const setGymGoal = async (goal: number) => {
    try {
      setIsLoading(true);
      // Update local state
      updateGymGoal(goal);

      // Update server
      return await supabase.functions.invoke("set_goal", {
        body: JSON.stringify({ goal }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    gymGoal,
    setGymGoal,
    isLoading,
  };
}
