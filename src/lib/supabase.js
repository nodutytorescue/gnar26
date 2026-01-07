import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yyezbkfnjwlbwovrhbgd.supabase.co'
const supabaseKey = 'sb_publishable_6AiiJdQcskHCepUHl79MVg__VnPV8tA'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Generate a simple user ID for now (will replace with real auth later)
export const getUserId = () => {
  let userId = localStorage.getItem('gnar26_user_id')
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('gnar26_user_id', userId)
  }
  return userId
}