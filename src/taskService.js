// taskService.ts
import { supabase } from './supabaseClient.js'

export const getTasks = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('User not logged in')
    return []
  }

  const { data, error } = await supabase
    .from('TASK')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  return data
}