// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ovolawtfsrsfvhanzhfv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92b2xhd3Rmc3JzZnZoYW56aGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MzkzOTgsImV4cCI6MjA2MzIxNTM5OH0.G1XfZH-F9nnfFyUDfLLSCAPamyROwrzttNlnBDRxES4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


