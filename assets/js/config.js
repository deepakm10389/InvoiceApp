/**
 * App configuration.
 * Leave SUPABASE_URL / SUPABASE_ANON_KEY empty to run in DEMO mode (localStorage).
 * After creating a free Supabase project, paste your values below and the app
 * switches to the cloud database automatically — no other code changes needed.
 */
window.APP_CONFIG = {
  // Paste from Supabase → Project Settings → API
  SUPABASE_URL: "https://yplkfgbcwpqfszlpvyqi.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwbGtmZ2Jjd3BxZnN6bHB2eXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1Mzc0MjAsImV4cCI6MjEwNDExMzQyMH0.wMs2a-6tBKQU3Qx4dFtI-pxhmM565l9c3TX_f4-LQbU",

  // Demo login (only used when Supabase is not configured)
  DEMO_EMAIL: "demo@invoice.local",
  DEMO_PASSWORD: "demo1234",

  // Default GST rate (%)
  DEFAULT_GST_RATE: 18,

  APP_NAME: "Invoice App"
};

window.APP_CONFIG.useSupabase = function () {
  return !!(
    this.SUPABASE_URL &&
    this.SUPABASE_ANON_KEY &&
    this.SUPABASE_URL.indexOf("http") === 0
  );
};
