import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

export default function AdminBar({ show, redirectPathWithAdmin, adminEmail }) {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState(adminEmail);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!show) return null;

  const isAdmin = session?.user?.email?.toLowerCase() === adminEmail.toLowerCase();

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + redirectPathWithAdmin },
    });
    if (error) toast.error(error.message);
    else toast.success("Magic link sent. Check your email.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-6">
      {!session ? (
        <div className="rounded-3xl border p-5 max-w-lg" style={{ borderColor: "rgba(15,30,36,0.12)" }}>
          <div className="font-semibold mb-3" style={{ color: "var(--epsy-charcoal)" }}>
            Admin login
          </div>
          <Label className="mb-2 block">Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button className="mt-3 rounded-2xl" onClick={signIn}>
            Send magic link
          </Button>
        </div>
      ) : isAdmin ? (
        <div className="rounded-3xl border p-5" style={{ borderColor: "rgba(15,30,36,0.12)" }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold" style={{ color: "var(--epsy-charcoal)" }}>
                Inline edit mode
              </div>
              <div className="text-sm" style={{ color: "var(--epsy-slate-blue)" }}>
                Signed in as: {session.user.email}
              </div>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border p-5 max-w-lg" style={{ borderColor: "rgba(15,30,36,0.12)" }}>
          <div className="font-semibold mb-2" style={{ color: "var(--epsy-charcoal)" }}>
            Logged in, but not admin
          </div>
          <div className="text-sm" style={{ color: "var(--epsy-slate-blue)" }}>
            Signed in as: {session.user.email}
          </div>
        </div>
      )}
    </div>
  );
}