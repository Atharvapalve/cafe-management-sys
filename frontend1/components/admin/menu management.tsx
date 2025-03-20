"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { addMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/api"

export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  rewardPoints: number;
  image?: string;
}

export function MenuManagement({ items }: { items: MenuItem[] }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(items);
  // New item state for adding an item
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "", rewardPoints: "" });
  const [newImage, setNewImage] = useState<File | null>(null);
  
  // State for tracking which item is in editing mode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<MenuItem>>({});
  const [editingImage, setEditingImage] = useState<File | null>(null);

  const handleAddItem = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("price", newItem.price);
      formData.append("category", newItem.category);
      formData.append("rewardPoints", newItem.rewardPoints);
      if (newImage) {
        formData.append("image", newImage);
      }
      const addedItem = await addMenuItem(formData);      // Refresh menu items
      setMenuItems((prev) => [...prev, addedItem]);
      // Reset the input fields
      setNewItem({ name: "", price: "", category: "", rewardPoints: "" });
      setNewImage(null);
    }catch (error) {
      console.error("Failed to add menu item:", error)
    }
  }
   // --- START EDITING ---
   const startEditing = (item: MenuItem) => {
    setEditingId(item._id);
    setEditingData(item);
    setEditingImage(null);
  };

  // --- CANCEL EDITING --- 
  const cancelEditing = () => {
    setEditingId(null);
    setEditingData({});
    setEditingImage(null);
  };


  const handleUpdateItem = async (id: string, updatedItem: Partial<MenuItem>) => {
    try {
      const formData = new FormData();
      if (updatedItem.name) formData.append("name", updatedItem.name);
      if (updatedItem.price !== undefined) formData.append("price", updatedItem.price.toString());
      if (updatedItem.category) formData.append("category", updatedItem.category);
      if (updatedItem.rewardPoints !== undefined) {
        formData.append("rewardPoints", updatedItem.rewardPoints.toString());
      }
      if (editingImage) {
        formData.append("image", editingImage);
      }
      console.log("Updating menu item with ID:", id);
      console.log("FormData contents:",  Array.from(formData.entries())); // Log data being sent
      const response = await updateMenuItem(id, formData);
      setMenuItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, ...updatedItem, image: response.image } : item))
      );
      cancelEditing();
      console.log("Update response:", response);
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
    onChange={(e) => setNewImage(e.target.files ? e.target.files[0] : null)}
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
            <TableHead>Image</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuItems.map((item) => (
            <TableRow key={item._id}>
              <TableCell>
                {editingId === item._id ? (
                  <Input
                    value={editingData.name || ""}
                    onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                  />
                ) : (
                  item.name
                )}
              </TableCell>
              <TableCell>
                {editingId === item._id ? (
                  <Input
                    type="number"
                    value={editingData.price || ""}
                    onChange={(e) =>
                      setEditingData({ ...editingData, price: parseFloat(e.target.value) })
                    }
                  />
                ) : (
                  item.price
                )}
              </TableCell>
              <TableCell>
                {editingId === item._id ? (
                  <Input
                    value={editingData.category || ""}
                    onChange={(e) => setEditingData({ ...editingData, category: e.target.value })}
                  />
                ) : (
                  item.category
                )}
              </TableCell>
              <TableCell>
                {editingId === item._id ? (
                  <Input
                    type="number"
                    value={editingData.rewardPoints || ""}
                    onChange={(e) =>
                      setEditingData({ ...editingData, rewardPoints: parseInt(e.target.value, 10) })
                    }
                  />
                ) : (
                  item.rewardPoints
                )}
              </TableCell>
              <TableCell>
                {editingId === item._id ? (
                  <>
                    {item.image ? (
                      <img
                        src={item.image.startsWith("http") ? item.image : `http://localhost:5000${item.image}`}
                        alt={item.name}
                        width={50}
                      />
                    ) : (
                      "No Image"
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditingImage(e.target.files ? e.target.files[0] : null)}
                    />
                  </>
                ) : (
                  item.image ? (
                    <img
                      src={item.image.startsWith("http") ? item.image : `http://localhost:5000${item.image}`}
                      alt={item.name}
                      width={50}
                    />
                  ) : (
                    "No Image"
                  )
                )}
              </TableCell>
              <TableCell>
                {editingId === item._id ? (
                  <>
                    <Button onClick={() => handleUpdateItem(item._id, editingData)}>Save</Button>
                    <Button variant="destructive" onClick={cancelEditing}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => startEditing(item)}>Edit</Button>
                    <Button variant="destructive" onClick={() => handleDeleteItem(item._id)}>Delete</Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

}

