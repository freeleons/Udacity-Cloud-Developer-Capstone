import { apiEndpoint } from '../config'
import { GroceryList } from '../types/GroceryList';
import { CreateGroceryListRequest } from '../types/CreateGroceryListRequest';
import Axios from 'axios'
import { UpdateGroceryListRequest } from '../types/UpdateGroceryListRequest';

export async function getGroceryLists(idToken: string): Promise<GroceryList[]> {
  console.log('Fetching GroceryList')

  const response = await Axios.get(`${apiEndpoint}/GroceryList`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('GroceryList:', response.data)
  return response.data.items
}

export async function createGroceryList(
  idToken: string,
  newGroceryList: CreateGroceryListRequest
): Promise<GroceryList> {
  const response = await Axios.post(`${apiEndpoint}/GroceryList`,  JSON.stringify(newGroceryList), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchGroceryList(
  idToken: string,
  GroceryListId: string,
  updatedGroceryList: UpdateGroceryListRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/GroceryList/${GroceryListId}`, JSON.stringify(updatedGroceryList), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteGroceryList(
  idToken: string,
  GroceryListId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/GroceryList/${GroceryListId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  GroceryListId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/GroceryList/${GroceryListId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
