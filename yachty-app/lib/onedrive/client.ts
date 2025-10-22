import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'
import { ClientSecretCredential } from '@azure/identity'

// Configuration
const config = {
  clientId: process.env.ONEDRIVE_CLIENT_ID!,
  clientSecret: process.env.ONEDRIVE_CLIENT_SECRET!,
  tenantId: process.env.ONEDRIVE_TENANT_ID!,
}

// Create authenticated client
export function getOneDriveClient(): Client {
  if (!config.clientId || !config.clientSecret || !config.tenantId) {
    throw new Error('OneDrive configuration is incomplete')
  }

  const credential = new ClientSecretCredential(
    config.tenantId,
    config.clientId,
    config.clientSecret
  )

  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default'],
  })

  return Client.initWithMiddleware({
    authProvider,
  })
}

// Folder structure as per PRD:
// /Yacht Management/
//   /Clients/
//     /[Client Name]/
//       /[Boat Name]/
//         /Receipts/
//           /YYYY-MM/
//         /Invoices/
//         /Manuals/
//         /Photos/

const ROOT_FOLDER = 'Yacht Management'

// Create folder structure for a new client/boat
export async function createClientFolderStructure(
  clientName: string,
  boatName?: string
): Promise<{
  clientFolderId: string
  boatFolderId?: string
  folders: Record<string, string>
}> {
  const client = getOneDriveClient()

  // Create root folder if it doesn't exist
  const rootFolder = await getOrCreateFolder('root', ROOT_FOLDER)

  // Create Clients folder
  const clientsFolder = await getOrCreateFolder(rootFolder.id, 'Clients')

  // Create client folder
  const clientFolder = await getOrCreateFolder(clientsFolder.id, clientName)

  const result: {
    clientFolderId: string
    boatFolderId?: string
    folders: Record<string, string>
  } = {
    clientFolderId: clientFolder.id,
    folders: {},
  }

  if (boatName) {
    // Create boat folder
    const boatFolder = await getOrCreateFolder(clientFolder.id, boatName)
    result.boatFolderId = boatFolder.id

    // Create subfolders
    const receiptsFolder = await getOrCreateFolder(boatFolder.id, 'Receipts')
    const invoicesFolder = await getOrCreateFolder(boatFolder.id, 'Invoices')
    const manualsFolder = await getOrCreateFolder(boatFolder.id, 'Manuals')
    const photosFolder = await getOrCreateFolder(boatFolder.id, 'Photos')

    result.folders = {
      receipts: receiptsFolder.id,
      invoices: invoicesFolder.id,
      manuals: manualsFolder.id,
      photos: photosFolder.id,
    }
  }

  return result
}

// Helper to get or create a folder
async function getOrCreateFolder(
  parentFolderId: string,
  folderName: string
): Promise<{ id: string; name: string }> {
  const client = getOneDriveClient()

  try {
    // Try to find existing folder
    const parentPath = parentFolderId === 'root' ? '/me/drive/root' : `/me/drive/items/${parentFolderId}`

    const children = await client
      .api(`${parentPath}/children`)
      .filter(`name eq '${folderName}' and folder ne null`)
      .get()

    if (children.value && children.value.length > 0) {
      return { id: children.value[0].id, name: children.value[0].name }
    }

    // Create new folder
    const newFolder = await client
      .api(`${parentPath}/children`)
      .post({
        name: folderName,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename',
      })

    return { id: newFolder.id, name: newFolder.name }
  } catch (error) {
    console.error(`Error creating folder ${folderName}:`, error)
    throw error
  }
}

// Upload a file
export async function uploadFile({
  folderId,
  fileName,
  fileContent,
  mimeType,
}: {
  folderId: string
  fileName: string
  fileContent: Buffer | string
  mimeType: string
}): Promise<{ id: string; url: string }> {
  const client = getOneDriveClient()

  try {
    const uploadedFile = await client
      .api(`/me/drive/items/${folderId}:/${fileName}:/content`)
      .header('Content-Type', mimeType)
      .put(fileContent)

    return {
      id: uploadedFile.id,
      url: uploadedFile.webUrl,
    }
  } catch (error) {
    console.error(`Error uploading file ${fileName}:`, error)
    throw error
  }
}

// Get file download URL
export async function getFileDownloadUrl(fileId: string): Promise<string> {
  const client = getOneDriveClient()

  try {
    const file = await client.api(`/me/drive/items/${fileId}`).get()
    return file['@microsoft.graph.downloadUrl']
  } catch (error) {
    console.error(`Error getting download URL for file ${fileId}:`, error)
    throw error
  }
}

// Download file content
export async function downloadFile(fileId: string): Promise<Buffer> {
  const client = getOneDriveClient()

  try {
    const downloadUrl = await getFileDownloadUrl(fileId)
    const response = await fetch(downloadUrl)

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error(`Error downloading file ${fileId}:`, error)
    throw error
  }
}

// Delete a file
export async function deleteFile(fileId: string): Promise<void> {
  const client = getOneDriveClient()

  try {
    await client.api(`/me/drive/items/${fileId}`).delete()
  } catch (error) {
    console.error(`Error deleting file ${fileId}:`, error)
    throw error
  }
}

// Get monthly receipts folder (create if doesn't exist)
export async function getReceiptsFolder(
  boatFolderId: string,
  year: number,
  month: number
): Promise<string> {
  const client = getOneDriveClient()
  const monthFolder = `${year}-${String(month).padStart(2, '0')}`

  // Get receipts folder
  const boatFolder = await client.api(`/me/drive/items/${boatFolderId}`).get()

  const children = await client
    .api(`/me/drive/items/${boatFolderId}/children`)
    .filter(`name eq 'Receipts' and folder ne null`)
    .get()

  let receiptsFolder
  if (children.value && children.value.length > 0) {
    receiptsFolder = children.value[0]
  } else {
    receiptsFolder = await client
      .api(`/me/drive/items/${boatFolderId}/children`)
      .post({
        name: 'Receipts',
        folder: {},
      })
  }

  // Create/get month folder
  const monthFolderObj = await getOrCreateFolder(receiptsFolder.id, monthFolder)

  return monthFolderObj.id
}
