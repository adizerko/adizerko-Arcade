const SUPABASE_URL = 'https://vevvqucgqtvnyubppiol.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZldnZxdWNncXR2bnl1YnBwaW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzM3NjUsImV4cCI6MjA4ODgwOTc2NX0.23MJQnnfknAzBOuKUku-ZgDFowunSSd8uDy_9hM0cHE';

let supabaseClient = null;

try {
    if (!window.supabase) {
        throw new Error("Библиотека Supabase.js не загружена в index.html");
    }
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (err) {
    alert("Ошибка инициализации Supabase: " + err.message);
}

export const supabase = supabaseClient;