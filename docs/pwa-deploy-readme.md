# Deploy & Test Instructies Vive le Vélo PWA

## Vercel Deployment

1. **Koppel GitHub**: Importeer deze repository in Vercel als een Next.js project.
2. **Environment Variables**:
   In het Vercel dashboard voor dit project voeg je onder Settings > Environment Variables volgende waarden toe:
   - `NEXT_PUBLIC_SUPABASE_URL`: (Jullie project url)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Jullie publieke sleutel)
   - `NEXT_PUBLIC_SENTRY_DSN`: (Optioneel indien gebruikt)
3. **Custom Domain**:
   Voeg `techpack.vivelevelo.be` toe in Vercel en pas de DNS-records aan in jullie domeinbeheerder zoals aangegeven op het Vercel dashboard.

## Rollback & Noodprocedures

Mocht de live versie breken:
1. In Vercel, ga naar de tab 'Deployments'.
2. Zoek de laatste succesvolle deployment voordat de fout ontstond.
3. Klik op de puntjes en kies **'Promote to Production'** of **'Rollback'**. Binnen de 5 seconden draait iedereen weer op de oude versie.
4. Om te zorgen dat browsers de gecachete *offline-versie* hard updaten, kun je in `sw.js` de constante `CACHE_NAME` ophogen (bijv. naar `vlv-static-v2`).

## FAQ: Icoon Toont Niet of "Install App" Ontbreekt in Chrome
- Check of `manifest.json` validerend en live is via `/manifest.json`. 
- Zorg ervoor dat Chrome via Applicatie-tabblad onder "Manifest" niet jankt op ontbrekende iconen.
- HTTPS is verplicht! Indien lokaal of op staging geen SSL aanwezig is, verbiedt Chrome installatie.
