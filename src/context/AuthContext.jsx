"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

const AuthContext = createContext({
  user: null,
  profile: null,
  role: "student",
  isAdmin: false,
  isLoading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(
    async (currentUser) => {
      if (!currentUser) {
        setProfile(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching student profile:", error);
          return;
        }

        if (data) {
          setProfile(data);
        } else {
          // Fallback minimal profile if trigger delay
          const meta = currentUser.user_metadata || {};
          setProfile({
            id: currentUser.id,
            email: currentUser.email,
            full_name: meta.full_name || "Campus Student",
            username: meta.username || currentUser.email?.split("@")[0] || "student",
            department: meta.department || "Computer Science & Engg",
            semester: meta.semester || "Semester 1",
            avatar_url: meta.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
            role: "student",
          });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isMounted) {
          const currentUser = session?.user || null;
          setUser(currentUser);
          if (currentUser) {
            await fetchProfile(currentUser);
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const isDesignatedAdmin = user?.email?.toLowerCase() === "mizpam54@gmail.com";
  const role = profile?.role || (isDesignatedAdmin ? "admin" : "student");
  const isAdmin = role === "admin" || isDesignatedAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isLoading,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
