"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useMap } from "@/contexts/map-context"

export function ConfirmationDialog() {
  const { confirmationDialog, setConfirmationDialog } = useMap()

  if (!confirmationDialog) return null

  return (
    <AlertDialog open={confirmationDialog.isOpen} onOpenChange={(open) => !open && setConfirmationDialog(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmationDialog.title}</AlertDialogTitle>
          <AlertDialogDescription>{confirmationDialog.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmationDialog.onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
