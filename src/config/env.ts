const env = {
  PORT: process.env.PORT || 3000,
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_KEY: process.env.SUPABASE_KEY!,
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY!,
};

export default env;
