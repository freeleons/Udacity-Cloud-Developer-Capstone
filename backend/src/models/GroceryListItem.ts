export interface GroceryListItem {
  userId: string
  GroceryListId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
