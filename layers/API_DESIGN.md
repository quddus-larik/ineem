## API DESIGN FOR BACKEND 

1. **Version: v1**
2. **Base Route: (/api/v1)**
3. **Upload Route (/pdf/upload) - POST (get docs and store in `uploads` for now, It will be stored in storage `supabase` )**
4. **Policies Check Route (/ingest) - POST (Ingest master policies from supabase DB)**
5. **Audit Policies Route (/audit) - POST (Audit new Contract against ingested policies)**
