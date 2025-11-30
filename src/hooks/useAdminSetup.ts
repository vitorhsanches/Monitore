import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminSetup = () => {
  const [setupComplete, setSetupComplete] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    setupAdminUser();
  }, []);

  const setupAdminUser = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('setup-admin');

      if (error) {
        console.error('Error setting up admin user:', error);
        setSetupError(error.message);
        return;
      }

      if (data?.success) {
        console.log('Admin setup:', data.message);
        setSetupComplete(true);
      }
    } catch (error: any) {
      console.error('Error in admin setup:', error);
      setSetupError(error.message);
    }
  };

  return { setupComplete, setupError };
};
