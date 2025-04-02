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
    <Card className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-[#BCAAA4]">
      <CardHeader className="bg-[#EFEBE9]/80 backdrop-blur-sm rounded-t-xl border-b border-[#BCAAA4]">
        <CardTitle className="text-3xl font-bold flex items-center gap-2 text-[#5D4037]">
          <User className="h-8 w-8" />
          {isEditing ? "Edit Profile" : "User Profile"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5D4037]">Name</label>
              {isEditing ? (
                <Input
                  name="name"
                  value={editedUser?.name || ""}
                  onChange={handleInputChange}
                  className="border-[#BCAAA4]"
                />
              ) : (
                <div className="flex items-center gap-2 text-lg text-[#8D6E63]">
                  <User className="h-5 w-5 text-[#5D4037]" />
                  {user.name}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5D4037]">Email</label>
              {isEditing ? (
                <Input
                  name="email"
                  value={editedUser?.email || ""}
                  onChange={handleInputChange}
                  className="border-[#BCAAA4]"
                />
              ) : (
                <div className="flex items-center gap-2 text-lg text-[#8D6E63]">
                  <Mail className="h-5 w-5 text-[#5D4037]" />
                  {user.email}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#5D4037]">Phone</label>
              {isEditing ? (
                <Input
                  name="phone"
                  value={editedUser?.phone || ""}
                  onChange={handleInputChange}
                  className="border-[#BCAAA4]"
                />
              ) : (
                <div className="flex items-center gap-2 text-lg text-[#8D6E63]">
                  <Phone className="h-5 w-5 text-[#5D4037]" />
                  {user.phone || "Not provided"}
                </div>
              )}
            </div>
          </div>
         
        </div>
        <div className="flex justify-end space-x-4 pt-4 border-t border-[#BCAAA4]">
          {isEditing ? (
            <Button onClick={handleSave} className="bg-[#5D4037] text-white hover:bg-[#8D6E63]">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          ) : (
            <Button onClick={handleEdit} className="bg-[#5D4037] text-white hover:bg-[#8D6E63]">
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

