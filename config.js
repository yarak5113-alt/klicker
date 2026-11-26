// Supabase-Zugangsdaten (Dashboard → Project Settings → API).
// Der "anon"/"publishable" Key darf öffentlich sein: Schreiben ist in der
// Datenbank nur über die Funktion click() erlaubt (siehe supabase.sql).
window.KLICKER_CONFIG = {
  SUPABASE_URL: '',       // z. B. 'https://abcdefgh.supabase.co'
  SUPABASE_ANON_KEY: '',  // z. B. 'eyJhbGciOi...' oder 'sb_publishable_...'
};
