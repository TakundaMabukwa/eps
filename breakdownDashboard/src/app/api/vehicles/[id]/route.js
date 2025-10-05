import { NextResponse } from 'next/server'
// import { auth, db } from '@/lib/server-db'
// import { verifyAuth } from '@/utils/verify-auth'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// *****************************
// update vehicle
// *****************************
export async function PUT(request, { params }) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session) {
    return NextResponse.json({ error: 'You are not authorized' }, { status: 401 })
  }

  const { id } = params
  const body = await request.json()
  if (!id) return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })

  try {
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('client_id')
      .eq('id', session.user.id)
      .single()
    if (profileError) throw profileError
    const clientId = userProfile.client_id

    const { data, error } = await supabase
      .from('vehicles')
      .update(body)
      .eq('id', id)
      .eq('company', clientId)
      .select()
      .single()
    if (error) throw error

    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'
    await supabase.from('user_activities').insert({
      user_id: session.user.id,
      activity: 'Updated Vehicle',
      timestamp: new Date().toISOString(),
      ip: ip === '::1' ? 'localhost' : ip,
    })

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update vehicle with id: ${id}` },
      { status: 500 }
    )
  }
}

// *****************************
// delete vehicle
// *****************************
export async function DELETE(request, { params }) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session) {
    return NextResponse.json({ error: 'Not a valid user' }, { status: 401 })
  }

  const { id } = params
  if (!id) return NextResponse.json({ error: 'Missing client ID' }, { status: 400 })

  try {
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('client_id')
      .eq('id', session.user.id)
      .single()
    if (profileError) throw profileError
    const clientId = userProfile.client_id

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
      .eq('company', clientId)
    if (error) throw error

    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'
    await supabase.from('user_activities').insert({
      user_id: session.user.id,
      activity: 'Deleted Vehicle',
      timestamp: new Date().toISOString(),
      ip: ip === '::1' ? 'localhost' : ip,
    })

    return NextResponse.json(id, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong...' },
      { status: 500 }
    )
  }
}
