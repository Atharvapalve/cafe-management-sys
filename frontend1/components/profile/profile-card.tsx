"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, Edit2, LogOut, Coffee, Droplet, Award, Save } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { updateProfile } from "@/lib/api";

interface EditableUser {
  name: string
  email: string
  phone?: string
  preferences: {
    favoriteCoffee?: string
    preferredMilk?: string
    rewardsTier: string
  }
}

export function ProfileCard() {
  const { user, logout, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<EditableUser | null>(null)

  if (!user) {
    return null
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditedUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
      preferences: {
        favoriteCoffee: user.preferences?.favoriteCoffee,
        preferredMilk: user.preferences?.preferredMilk,
        rewardsTier: user.preferences?.rewardsTier || "Bronze",
      },
    })
  }

  const handleSave = async () => {
    if (editedUser) {
      try {
        const updatedUserData = await updateProfile(editedUser); // Call the API
        updateUser(updatedUserData); // Update local state
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to save profile:", error);
      }
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedUser((prev) => {
      if (!prev) return null
      if (name.startsWith("preferences.")) {
        const prefName = name.split(".")[1]
        return { ...prev, preferences: { ...prev.preferences, [prefName]: value } }
      }
      return { ...prev, [name]: value }
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-coffee-light shadow-lg">
      <CardHeader className="bg-coffee-medium text-coffee-light p-6">
        <CardTitle className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          {isEditing ? "Edit Profile" : "User Profile"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-coffee-dark">Name</label>
              {isEditing ? (
                <Input
                  name="name"
                  value={editedUser?.name || ""}
                  onChange={handleInputChange}
                  className="border-coffee-medium"
                />
              ) : (
                <div className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-coffee-accent" />
                  {user.name}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-coffee-dark">Email</label>
              {isEditing ? (
                <Input
                  name="email"
                  value={editedUser?.email || ""}
                  onChange={handleInputChange}
                  className="border-coffee-medium"
                />
              ) : (
                <div className="flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5 text-coffee-accent" />
                  {user.email}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-coffee-dark">Phone</label>
              {isEditing ? (
                <Input
                  name="phone"
                  value={editedUser?.phone || ""}
                  onChange={handleInputChange}
                  className="border-coffee-medium"
                />
              ) : (
                <div className="flex items-center gap-2 text-lg">
                  <Phone className="h-5 w-5 text-coffee-accent" />
                  {user.phone || "Not provided"}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-lg text-coffee-dark">Preferences</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-coffee-accent" />
                  {isEditing ? (
                    <Input
                      name="preferences.favoriteCoffee"
                      value={editedUser?.preferences.favoriteCoffee || ""}
                      onChange={handleInputChange}
                      placeholder="Favorite coffee"
                      className="border-coffee-medium"
                    />
                  ) : (
                    <span>Favorite coffee: {user.preferences?.favoriteCoffee || "Not set"}</span>
                  )}
                </li>
                <li className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-coffee-accent" />
                  {isEditing ? (
                    <Input
                      name="preferences.preferredMilk"
                      value={editedUser?.preferences.preferredMilk || ""}
                      onChange={handleInputChange}
                      placeholder="Preferred milk"
                      className="border-coffee-medium"
                    />
                  ) : (
                    <span>Preferred milk: {user.preferences?.preferredMilk || "Not set"}</span>
                  )}
                </li>
                <li className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-coffee-accent" />
                  <span>Rewards tier: {user.preferences?.rewardsTier}</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-lg text-coffee-dark">Account Info</h4>
              <p className="text-sm text-coffee-medium">
                Member since: {user.memberSince ? new Date(user.memberSince).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 pt-4 border-t border-coffee-medium">
          {isEditing ? (
            <Button onClick={handleSave} className="bg-coffee-accent text-coffee-light hover:bg-coffee-dark">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          ) : (
            <Button onClick={handleEdit} className="bg-coffee-accent text-coffee-light hover:bg-coffee-dark">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
          <Button onClick={logout} variant="destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

