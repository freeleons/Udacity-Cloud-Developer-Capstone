import {GroceryListsAccess} from "../data_access_layer/GroceryListsAccess";
import {GroceryListItem} from "../models/GroceryListItem";
import {CreateGroceryListRequest} from "../requests/CreateGroceryListRequest";
import {GroceryListUpdate} from "../models/GroceryListUpdate";

const GroceryListAccess = new GroceryListsAccess()
export async function getAllGroceryLists(userId: string): Promise<GroceryListItem[]> {
    return await GroceryListAccess.getAllGroceryLists(userId)
}

export async function createGroceryList(
    newGroceryList: CreateGroceryListRequest,
    userId: string,
    GroceryListId: string
): Promise<CreateGroceryListRequest> {
    return await GroceryListAccess.createGroceryList({
        GroceryListId: GroceryListId,
        userId: userId,
        name: newGroceryList.name,
        dueDate: newGroceryList.dueDate,
        done: false,
        attachmentUrl: '',
        createdAt: new Date().toISOString()
    })
}

export async function deleteGroceryList(
    GroceryListId: string,
    userId: string
): Promise<void> {
    return await GroceryListAccess.deleteGroceryListItem(GroceryListId, userId)
}

export async function getGeneratedUploadURL(
    GroceryListId: string, userId: string
): Promise<string> {
    return await GroceryListAccess.generateUploadUrl(GroceryListId, userId)
}

export async function persistAttachmentUrl(
    GroceryListId: string,
    userId: string,
    imageId: string
): Promise<void> {
    return await GroceryListAccess.persistAttachmentUrl(GroceryListId, userId, imageId)
}

export async function getGroceryListsForUser(
    userId: string
): Promise<GroceryListItem[]> {
    return await GroceryListAccess.getGroceryListsForUser(userId)
}

export async function updateGroceryList(
    GroceryListId: string,
    userId: string,
    GroceryListUpdate: GroceryListUpdate
): Promise<GroceryListUpdate> {
    return await GroceryListAccess.updateGroceryList(GroceryListId, userId, GroceryListUpdate)
}

