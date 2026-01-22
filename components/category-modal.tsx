"use client"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useTheme } from "next-themes"
import { Input } from "./ui/input"
import { useState } from "react"
import { TYPE_ENUM, TYPE_TEXT_ENUM } from "@/types/transaction"
import { Label } from "./ui/label"
import { HexColorPicker } from "react-colorful";
import { Category, CreateCategoryForm } from "@/types/category"
import { addCategory } from "@/services/category"
import { useToast } from "./ui/use-toast"

interface CategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant?: "default" | "destructive"
  onConfirm: (newCategory: Category) => void
}

export function CategoryModal({
  open,
  onOpenChange,
  variant = "default",
  onConfirm,}: CategoryModalProps) {


  const { theme } = useTheme();
  const { toast } = useToast()

  const [name, setName] = useState<string>();
  const [type, setType] = useState<TYPE_TEXT_ENUM>();
  const [color, setColor] = useState("#aabbcc");

  const cleanForm = () => {
    setName(undefined);
    setType(TYPE_TEXT_ENUM.INCOME);
    setColor("#aabbcc");
  }

  const handleAddCategory = async () => {
    try {
      if(!name || !type || !color) return;
      const data: CreateCategoryForm = {name, type: type == TYPE_TEXT_ENUM.INCOME ? !!TYPE_ENUM.INCOME : !!TYPE_ENUM.OUTCOME, color};
      const category = await addCategory(data);
      toast({
        title: "Create Category",
        description: "Category created succesfully",
        variant: "default"
      })
      cleanForm();
      onConfirm?.(category);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Problem adding category.`,
        variant: "default",
      })
    }

  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[725px] ${theme == "light" ? "bg-white" : "bg-black"}`}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {variant === "destructive" && (
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
            )}
            <DialogTitle className="text-xl">Create Category</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-medium">Type *</Label>
          <Select value={(type || null) as any} onValueChange={(value) => setType(value as any)} required>
            <SelectTrigger id="category" className="!h-11 w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className={theme == "dark" ? "bg-black text-white" : "bg-white text-black"}>
              <SelectItem value={TYPE_TEXT_ENUM.INCOME}>
                Income
              </SelectItem>
              <SelectItem value={TYPE_TEXT_ENUM.OUTCOME}>
                Outcome
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">Color *</Label>
            <HexColorPicker color={color} onChange={setColor} className="!w-full"/>
        </div>
        <DialogFooter className="gap-2 sm:gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
            Cancel
          </Button>
          <Button className={`${theme == "light" ? "bg-black text-white" : "bg-white text-black"} cursor-pointer`} onClick={handleAddCategory} disabled={!color || !name || type == undefined}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
