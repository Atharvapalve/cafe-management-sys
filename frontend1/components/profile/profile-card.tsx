"use client";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Mail, Phone, Edit2, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function ProfileCard() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">User Profile</h2>
      <div>
        <p>{user.name}</p>
        <p>
        Member since{" "}
        {user.memberSince
          ? new Date(user.memberSince).toLocaleString()
          : "Not available"}
      </p>
        <p>{user.email}</p>
        <p>{user.phone || "Not provided"}</p>
      </div>
      <div>
        <h3 className="font-medium">Preferences</h3>
        <p>Favorite coffee: {user.preferences?.favoriteCoffee || "Not set"}</p>
        <p>Preferred milk: {user.preferences?.preferredMilk || "Not set"}</p>
        <p>Rewards tier: {user.preferences?.rewardsTier}</p>
      </div>
      <div className="flex space-x-4">
        <Button variant="secondary">
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
        <Button onClick={logout} variant="destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}