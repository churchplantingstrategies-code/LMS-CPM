# QUICK REFERENCE - Copy & Paste Commands

## For Windows PowerShell (Recommended)

```powershell
# 1. Start PostgreSQL with Docker (if you have Docker Desktop installed and running)
docker-compose up -d

# Wait 10 seconds for database to start...
# Then:

# 2. Initialize database schema
npx prisma db push

# 3. Start development server
npm run dev
```

## For Windows Command Prompt (cmd.exe)

```cmd
REM 1. Start PostgreSQL with Docker
docker-compose up -d

REM Wait 10 seconds for database to start...
REM Then:

REM 2. Initialize database schema
npx prisma db push

REM 3. Start development server
npm run dev
```

## Verify Database is Running

```powershell
# Check Docker container
docker ps

# Look for: ediscipleship_db (postgres:16-alpine)
# Should show STATUS: "Up X seconds"
```

## Common Commands

```powershell
# Stop database
docker-compose down

# View database logs
docker logs ediscipleship_db

# Access database directly
docker exec -it ediscipleship_db psql -U postgres -d ediscipleship

# Reset database (CAREFUL - deletes all data)
npx prisma migrate reset

# Generate Prisma Client after schema changes
npx prisma generate

# View Prisma Studio (database GUI)
npx prisma studio
```

## Ports & URLs

- **App**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (after running `npx prisma studio`)
- **Database**: localhost:5432 (for external tools)
- **API**: http://localhost:3000/api/*

## Default Credentials for Testing

Create new account on signup page:
- Email: `test@example.com`
- Password: Any password you choose

Or login with any credentials you set up - there's no default admin account pre-created.

## File Structure

```
.
├── .env.local ..................... Your local configuration (DO NOT COMMIT)
├── .env.local.example ............. Template for .env.local
├── .env.example ................... Backup template
├── docker-compose.yml ............. PostgreSQL Docker configuration
├── GET_STARTED.md ................. This quick start guide
├── SETUP.md ....................... Detailed setup instructions
├── PAYMONGO_MIGRATION.md .......... Payment system documentation
├── QUICKSTART.bat ................. Windows batch setup script
├── prisma/
│   └── schema.prisma .............. Database schema (20+ models)
├── app/
│   ├── (admin)/admin/ ............. Admin dashboard pages
│   ├── (student)/dashboard/ ....... Student dashboard pages
│   ├── (marketing)/ ............... Public landing pages
│   └── api/ ....................... API routes
├── components/ .................... React components
├── lib/ ........................... Utilities & helper functions
├── types/ ......................... TypeScript type definitions
└── public/ ........................ Static assets
```

---

**TL;DR**: Run these 3 commands in order:
```bash
docker-compose up -d
npx prisma db push
npm run dev
```

Then visit: http://localhost:3000
