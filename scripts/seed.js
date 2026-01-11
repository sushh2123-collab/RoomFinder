/*
Server-side seeding script for Supabase (use with care)
Usage:
  1) Create a .env file at project root with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
  2) npm run seed

This script will:
 - create a few auth users (owners + a regular user) using the service role key
 - create profile rows (role = owner/user)
 - insert rooms for owners
 - insert room_images rows

Notes:
 - This requires the Supabase service_role key (keep it secret). Do NOT commit .env with secrets.
 - The script sets email_confirm to true so users won't need to confirm emails.
*/

;(async () => {
  try {
    const env = process.env
    const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL || env.SUPABASE_URL
    const SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.')
      console.error('Create a .env file and set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then run `npm run seed`')
      process.exit(1)
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } })

    // sample users/owners
    const users = [
      { email: 'asha.owner@example.com', password: 'Password123!', role: 'owner', full_name: 'Asha Singh' },
      { email: 'rohit.owner@example.com', password: 'Password123!', role: 'owner', full_name: 'Rohit Sharma' },
      { email: 'priya.user@example.com', password: 'Password123!', role: 'user', full_name: 'Priya Verma' },
    ]

    const created = []

    for (const u of users) {
      console.log(`Creating auth user: ${u.email}`)
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
      })
      if (error) {
        // if user already exists, fetch it
        if (error.status === 409) {
          console.warn(`User ${u.email} already exists, fetching id`) 
          const { data: existing } = await supabase.rpc('get_user_by_email', { _email: u.email }).catch(() => ({ data: null }))
          // fallback to listing auth.users
          let id = null
          if (existing && existing.id) id = existing.id
          else {
            const { data: list } = await supabase.from('users_temp').select('id').limit(1).catch(() => ({ data: null }))
            // not a standard approach; we'll fall back to query auth.users
            const { data: authList } = await supabase.rpc('get_auth_user_by_email', { _email: u.email }).catch(() => ({ data: null }))
            // Ultimately, fetch from auth.users directly
            const { data: authUsers } = await supabase
              .from('auth.users')
              .select('id,email')
              .eq('email', u.email)
              .limit(1)
              .single()
              .catch(() => ({ data: null }))
            id = authUsers?.id
          }

          if (!id) {
            console.error(`Could not obtain id for existing user ${u.email}. Please ensure the user exists in auth.users`) 
            continue
          }

          created.push({ id, ...u })
          continue
        }

        console.error('createUser error', error)
        continue
      }

      const id = data.user?.id || data.id
      if (!id) {
        console.error('Unexpected: no id returned for user', u.email, data)
        continue
      }

      created.push({ id, ...u })
    }

    // If createUser above didn't work for existing accounts, attempt to fetch by email for any remaining
    for (const u of users) {
      if (!created.find(c => c.email === u.email)) {
        const { data: found } = await supabase
          .from('auth.users')
          .select('id,email')
          .eq('email', u.email)
          .limit(1)
          .single()
          .catch(() => ({ data: null }))
        if (found?.id) created.push({ id: found.id, ...u })
      }
    }

    // insert profiles
    for (const c of created) {
      console.log(`Inserting profile for ${c.email} (${c.id}) as ${c.role}`)
      const { error } = await supabase.from('profiles').upsert({ id: c.id, role: c.role, full_name: c.full_name }, { onConflict: 'id' })
      if (error) console.error('profiles upsert error', error)
    }

    // create rooms for the two owners
    const rooms = [
      {
        owner_email: 'asha.owner@example.com',
        title: 'Cozy 1 BHK near Central Park',
        location: 'Mumbai, Andheri East',
        rent: 12000,
        property_type: '1 BHK',
        tenant_preference: 'bachelor',
        contact_number: '9123456780',
        images: ['https://picsum.photos/seed/room1/800/600']
      },
      {
        owner_email: 'asha.owner@example.com',
        title: 'Spacious 2 BHK with balcony',
        location: 'Mumbai, Bandra West',
        rent: 25000,
        property_type: '2 BHK',
        tenant_preference: 'family',
        contact_number: '9123456781',
        images: ['https://picsum.photos/seed/room2/800/600']
      },
      {
        owner_email: 'rohit.owner@example.com',
        title: 'Budget 1BHK, great for bachelors',
        location: 'Delhi, Lajpat Nagar',
        rent: 8000,
        property_type: '1 BHK',
        tenant_preference: 'bachelor',
        contact_number: '9876543210',
        images: ['https://picsum.photos/seed/room3/800/600']
      }
    ]

    for (const r of rooms) {
      const owner = created.find(c => c.email === r.owner_email)
      if (!owner) {
        console.warn('No owner found for room', r)
        continue
      }

      const roomId = crypto.randomUUID()
      console.log(`Inserting room '${r.title}' for owner ${owner.email}`)
      const { error: roomError } = await supabase.from('rooms').insert({
        id: roomId,
        owner_id: owner.id,
        title: r.title,
        location: r.location,
        rent: r.rent,
        property_type: r.property_type,
        tenant_preference: r.tenant_preference,
        contact_number: r.contact_number
      })
      if (roomError) {
        console.error('rooms insert error', roomError)
        continue
      }

      // insert images into room_images
      for (const img of r.images) {
        const { error: imgError } = await supabase.from('room_images').insert({ id: crypto.randomUUID(), room_id: roomId, image_url: img })
        if (imgError) console.error('room_images insert error', imgError)
      }
    }

    console.log('Seeding finished. Summary:')
    console.table(created.map(c => ({ id: c.id, email: c.email, role: c.role })))
    console.log('Check your Supabase project to confirm the data.')
  } catch (err) {
    console.error('Unexpected error', err)
    process.exit(1)
  }
})()
