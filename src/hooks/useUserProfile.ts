import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { profileService, Profile } from '../services/profileService';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profileData = await profileService.getProfile();
        setProfile(profileData);
      } catch (error) {
        console.warn('Error loading user profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  return { profile, loading };
};
