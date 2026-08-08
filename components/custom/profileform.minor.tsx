"use client";

import { supabase } from "@/lib/supabase/client";
import { Button, Input, Label } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Profile {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export function ProfileForm() {
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  // Fetch auth user + profile
  useEffect(() => {
    async function fetchUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserData(user);
          // Fetch from public.users table
          const { data: profile } = await supabase
            .from("users")
            .select("username, first_name, last_name, email")
            .eq("id", user.id)
            .single();
          setProfileData(profile || {});
        }
      } catch (error) {
        console.error("Fetch error:", error);
        alert({ title: "Error", description: "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleInputChange = (field: keyof Profile, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!userData) return;

    setSaving(true);
    try {
      // Upsert to public.users (matches your schema)
      const { error } = await supabase.from("users").upsert({
        id: userData.id,
        username: profileData.username,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: userData.email, // Auth email (read-only)
        updated_at: new Date().toISOString(),
      });

      if (error) {
        if (error.message.includes("duplicate key")) {
          alert("Username already taken");
        } else {
          throw error;
        }
      } else {
        alert("Profile updated!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading profile...</div>;
  if (!userData) return <div>Not signed in</div>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <div className="flex flex-col gap-1">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="alex-david90"
          value={profileData.username || ""}
          onChange={(e) => handleInputChange("username", e.target.value)}
          required
        />
        <span className="text-xs text-gray-500">
          Must be unique across all institutes
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="first-name">First Name</Label>
          <Input
            id="first-name"
            placeholder="Alex"
            value={profileData.first_name || ""}
            onChange={(e) => handleInputChange("first_name", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="last-name">Last Name</Label>
          <Input
            id="last-name"
            placeholder="David"
            value={profileData.last_name || ""}
            onChange={(e) => handleInputChange("last_name", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="alex@example.com"
          value={userData.email || profileData.email || ""}
          disabled
        />
      </div>

      <Button type="submit" isDisabled={saving} fullWidth>
        {saving ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
