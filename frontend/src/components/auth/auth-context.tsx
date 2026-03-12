
"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    subscription_tier?: string;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const profileFetchRef = useRef<Promise<void> | null>(null);

    const fetchProfile = (userId: string) => {
        // Deduplicate: if a fetch is already in-flight, reuse it
        if (profileFetchRef.current) return profileFetchRef.current;

        const promise = (async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, subscription_tier')
                    .eq('id', userId)
                    .single();

                if (!error && data) {
                    setProfile(data);
                }
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                profileFetchRef.current = null;
            }
        })();

        profileFetchRef.current = promise;
        return promise;
    };

    useEffect(() => {
        // Check active sessions and sets the user
        const getSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
            } catch (error) {
                console.error("[auth] Error getting session:", error);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.debug(`[auth] onAuthStateChange: ${event}`);

            // Token refresh only updates the JWT — user didn't change.
            // Updating session is enough; skip setUser/fetchProfile to avoid
            // lock contention and unnecessary downstream re-renders.
            if (event === 'TOKEN_REFRESHED') {
                setSession(session);
                return;
            }

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                // Fire-and-forget: never await inside onAuthStateChange
                // to prevent blocking the Supabase auth lock.
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, profile, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
