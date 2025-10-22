import { createClient } from '@/lib/supabase/server'
import { boatSchema } from '@/lib/utils/validation'
import { createClientFolderStructure } from '@/lib/onedrive/client'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/boats - List all boats
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('client_id')
    const search = searchParams.get('search')

    let query = supabase
      .from('boats')
      .select(`
        *,
        clients (
          id,
          name,
          email
        )
      `)
      .order('name')

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,make.ilike.%${search}%,model.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching boats:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ boats: data })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/boats - Create new boat
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const validation = boatSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    // Get client info for OneDrive folder creation
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('name')
      .eq('id', validation.data.client_id)
      .single()

    if (clientError || !clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const clientName = (clientData as { name: string }).name

    // Create OneDrive folder structure
    let onedriveFolderId: string | null = null
    try {
      const folderStructure = await createClientFolderStructure(
        clientName,
        validation.data.name
      )
      onedriveFolderId = folderStructure.boatFolderId || null
    } catch (error) {
      console.error('Error creating OneDrive folders:', error)
      // Continue without OneDrive folder - can be created later
    }

    // Create boat
    const insertData = {
      ...validation.data,
      onedrive_folder_id: onedriveFolderId,
    }

    const { data, error } = await (supabase
      .from('boats') as any)
      .insert(insertData)
      .select(`
        *,
        clients (
          id,
          name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Error creating boat:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ boat: data }, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
