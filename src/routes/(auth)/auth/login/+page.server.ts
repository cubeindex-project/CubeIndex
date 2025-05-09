import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
  login: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error(error)
      return (error)
    } else {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user?.id)

      if (error) {
        console.error('Couldn\'t load profiles in login:', error)
      }

      const profile = profiles?.[0]

      redirect(303, `/user/${profile?.id}`)
    }
  },
};
