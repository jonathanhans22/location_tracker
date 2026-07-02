import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rwpykupyieqioiyhcnpz.supabase.co'; // Hasil salinan baris pertama
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cHlrdXB5aWVxaW9peWhjbnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTk2MDgsImV4cCI6MjA5ODQ5NTYwOH0.Bz4XSBH-qzaAAyO2PuIhGsN5KhPk5fGx86yL0KB62_M-zQeG'; // Hasil salinan teks panjang di baris kedua

export const supabase = createClient(supabaseUrl, supabaseKey);