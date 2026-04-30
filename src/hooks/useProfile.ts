import { useEffect, useState } from "react";
import profileService, { Profile } from "@/services/profile";

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    profileService.getProfile().then(setProfile).catch(() => {});
  }, []);

  return profile;
};
