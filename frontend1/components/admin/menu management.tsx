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
  const [image, setImage] = useState<File | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(items); 

  const handleAddItem = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("price", newItem.price);
      formData.append("category", newItem.category);
      formData.append("rewardPoints", newItem.rewardPoints);
      if (image) {
        formData.append("image", image);
      }
      await addMenuItem(formData);
      // Refresh menu items
    } catch (error) {
      console.error("Failed to add menu item:", error)
    }
  }

  const handleUpdateItem = async (id: string, updatedItem: Partial<MenuItem>) => {
    try {
      const formData = new FormData();
      if (updatedItem.name) formData.append("name", updatedItem.name);
      if (updatedItem.price) formData.append("price", updatedItem.price.toString());
      if (updatedItem.category) formData.append("category", updatedItem.category);
      if (updatedItem.rewardPoints) formData.append("rewardPoints", updatedItem.rewardPoints.toString());
      if (image) {
        formData.append("image", image);
      }
      await updateMenuItem(id, formData);
      // Refresh menu items after update
    } catch (error) {
      console.error("Failed to update menu item:", error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteMenuItem(id); // Call the API to delete the item
  
      // ✅ Update state to remove the deleted item from the UI
      setMenuItems((prevItems) => prevItems.filter(item => item._id !== id));
      
    } catch (error) {
      console.error("Failed to delete menu item:", error);
    }
  };
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
         {/* File input for image selection */}
  <Input
    type="file"
    accept="image/*"
    onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
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
          {menuItems.map((item) => (
            <TableRow key={item._id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.price}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.rewardPoints}</TableCell>
              <TableCell>
              <Button onClick={() => handleUpdateItem(item._id, item)}>Edit</Button>
<Button variant="destructive" onClick={() => handleDeleteItem(item._id)}>Delete</Button>

              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

