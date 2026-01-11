"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useTheme } from "next-themes"

interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  onConfirm: () => void
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const { theme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[425px] ${theme == "light" ? "bg-white" : "bg-black"}`}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {variant === "destructive" && (
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
            )}
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
            {cancelLabel}
          </Button>
          <Button className={`${theme == "light" ? "bg-black text-white hover:bg-black" : "bg-white text-black hover:bg-white"} cursor-pointer`} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
