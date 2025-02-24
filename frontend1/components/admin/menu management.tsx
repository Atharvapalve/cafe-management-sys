"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { addMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/api"

interface MenuItem {
  _id: string
  name: string
  price: number
  category: string
  rewardPoints: number
}

export function MenuManagement({ items }: { items: MenuItem[] }) {
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "", rewardPoints: "" })

  const handleAddItem = async () => {
    try {
      await addMenuItem(newItem)
      // Refresh menu items
    } catch (error) {
      console.error("Failed to add menu item:", error)
    }
  }

  const handleUpdateItem = async (id: string, updatedItem: Partial<MenuItem>) => {
    try {
      await updateMenuItem(id, updatedItem)
      // Refresh menu items
    } catch (error) {
      console.error("Failed to update menu item:", error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteMenuItem(id)
      // Refresh menu items
    } catch (error) {
      console.error("Failed to delete menu item:", error)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Menu Management</h2>
      <div className="mb-4 flex space-x-2">
        <Input
          placeholder="Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <Input
          placeholder="Price"
          type="number"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
        />
        <Input
          placeholder="Category"
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
        />
        <Input
          placeholder="Reward Points"
          type="number"
          value={newItem.rewardPoints}
          onChange={(e) => setNewItem({ ...newItem, rewardPoints: e.target.value })}
        />
        <Button onClick={handleAddItem}>Add Item</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Reward Points</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item._id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.price}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.rewardPoints}</TableCell>
              <TableCell>
                <Button onClick={() => handleUpdateItem(item._id, item)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDeleteItem(item._id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

