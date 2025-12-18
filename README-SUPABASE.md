# Supabase Setup Guide

## Database Connection

Your Supabase database is configured with the following connection strings:

### Session Pooler (Recommended for Application)
Use this for your application runtime:
```
postgresql://postgres.vxnbafahrnsnziqvdtzr:08%2F13%2F2022GymRat82806%21@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```

### Direct Connection (For Migrations)
Use this for schema migrations with `drizzle-kit`:
```
postgresql://postgres:08%2F13%2F2022GymRat82806%21@db.vxnbafahrnsnziqvdtzr.supabase.co:5432/postgres
```

**Note:** The password is URL-encoded:
- `/` → `%2F`
- `!` → `%21`

## Setting Up the Database

You have two options to set up the database schema:

### Option 1: Using SQL Script (Recommended for First Setup)

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-setup.sql`
4. Click **Run** to execute the script
5. Verify tables were created by running:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

### Option 2: Using Drizzle Kit (For Schema Updates)

If you've already set up the database and need to push schema changes:

1. Make sure your `.env` file has `DATABASE_URL_DIRECT` set (or temporarily use direct connection)
2. Run:
   ```bash
   npm run db:push
   ```

**Important:** Use the direct connection for migrations, not the pooler.

## Environment Variables

Your `.env` file should contain:

```env
DATABASE_URL=postgresql://postgres.vxnbafahrnsnziqvdtzr:08%2F13%2F2022GymRat82806%21@aws-0-us-west-2.pooler.supabase.com:5432/postgres
DATABASE_URL_DIRECT=postgresql://postgres:08%2F13%2F2022GymRat82806%21@db.vxnbafahrnsnziqvdtzr.supabase.co:5432/postgres
PORT=5000
NODE_ENV=development
```

## Testing the Connection

To test your database connection:

```bash
# Using direct connection for testing
$env:DATABASE_URL="postgresql://postgres:08%2F13%2F2022GymRat82806%21@db.vxnbafahrnsnziqvdtzr.supabase.co:5432/postgres"
npm run db:push
```

## Database Schema

The database includes the following tables:

- **students** - Student profiles and progress tracking
- **topics** - SAT topics organized by section (math, reading, writing)
- **student_topic_progress** - Tracks student progress per topic
- **questions** - Assessment questions for each topic
- **question_attempts** - Records of student question attempts
- **daily_check_ins** - Daily student check-in data
- **chat_messages** - Chat history for the adaptive chatbot
- **video_content** - Video content linked to topics
- **users** - Legacy user table (for compatibility)

## Seeding Initial Data

After setting up the schema, you can seed initial data by:

1. Starting your development server: `npm run dev`
2. Making a POST request to: `http://localhost:5000/api/seed`

Or use curl:
```bash
curl -X POST http://localhost:5000/api/seed
```

## Production Deployment

For production deployment (Render, Railway, etc.):

1. Set the `DATABASE_URL` environment variable to the session pooler connection string
2. Make sure `NODE_ENV=production`
3. The application will automatically use the production database connection

## Troubleshooting

### Connection Issues

If you get connection errors:
- Verify the password is URL-encoded correctly
- Check that your Supabase project is active
- Ensure you're using the correct connection string (pooler vs direct)
- For migrations, always use the direct connection

### Migration Issues

If `drizzle-kit push` fails:
- Use the direct connection string (not the pooler)
- Make sure the password is URL-encoded
- Check that the database is accessible from your IP (Supabase allows all IPs by default)

