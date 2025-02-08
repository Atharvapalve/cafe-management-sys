"use client";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Mail, Phone, Edit2, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function ProfileCard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">User Profile</h2>
      <p>
        <UserIcon className="inline-block mr-2" />
        {user.name}
      </p>
      <p>
        Member since{" "}
        {new Date(user.memberSince).getFullYear().toString()}
      </p>
      <p>
        <Mail className="inline-block mr-2" />
        {user.email}
      </p>
      <p>
        <Phone className="inline-block mr-2" />
        {user.phone || "Not provided"}
      </p>
      <div>
        <h3 className="font-semibold">Preferences</h3>
        <p>
          Favorite coffee:{" "}
          {user.preferences?.favoriteCoffee || "Not set"}
        </p>
        <p>
          Preferred milk:{" "}
          {user.preferences?.preferredMilk || "Not set"}
        </p>
        <p>Rewards tier: {user.preferences?.rewardsTier}</p>
      </div>
      <Button>
        <Edit2 className="mr-2" />
        Edit Profile
      </Button>
      <Button onClick={() => console.log("Logout")}>
        <LogOut className="mr-2" />
        Logout
      </Button>
    </div>
  );
}