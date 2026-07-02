import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rwpykupyieqioiyhcnpz.supabase.co'; // Hasil salinan baris pertama
const supabaseKey = 'sb_publishable_jYHlhiz0HDsqKH25tZhKmA_Icc-zQeG'; // Hasil salinan teks panjang di baris kedua

export const supabase = createClient(supabaseUrl, supabaseKey);