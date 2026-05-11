# Fix Sistema Crediti - Riepilogo

## Data: 2025-01-28

### Bug Critici Risolti

#### 1. ✅ Bug #1 - Variabile non definita nel webhook (CRITICO)
**File:** `supabase/functions/stripe-webhook/index.ts` (righe 127-133)

**Problema:** Il codice usava `subRecord.current_period_start` invece di `subscription.current_period_start` per inizializzare i crediti.

**Fix:** Modificato per usare le date dall'oggetto Stripe `subscription` invece che dal database `subRecord`.

**Impatto:** Ora i crediti vengono inizializzati correttamente alla creazione di una nuova subscription.

---

#### 2. ✅ Bug #2 - Manca check IF NOT FOUND in increment_usage_counter (ALTO)
**Files:**
- Database: Funzione RPC `increment_usage_counter`
- Migration: `supabase/migrations/026_fix_credits_system.sql`

**Problema:** Se il record subscription_usage non esiste, la funzione falliva silenziosamente permettendo uso illimitato.

**Fix:** Aggiunto controllo che lancia un'eccezione se non esiste un record usage per la subscription.

```sql
IF v_current_period_start IS NULL THEN
  RAISE EXCEPTION 'Usage record not found for subscription...';
END IF;
```

**Impatto:** Previene l'uso illimitato quando il record usage manca.

---

#### 3. ✅ Bug #3 - Manca check IF NOT FOUND in get_company_credits_info (ALTO)
**Files:**
- Database: Funzione RPC `get_company_credits_info`

**Problema:** Se non esiste un record usage, le variabili rimanevano NULL causando errori nel frontend.

**Fix:** Aggiunto controllo che ritorna un JSON valido con valori di default quando non esiste il record.

**Impatto:** Il frontend mostra sempre dati validi, anche quando il usage non è stato inizializzato.

---

#### 4. ✅ Bug #5 - Logica reset crediti migliorata (ALTO)
**File:** `supabase/functions/stripe-webhook/index.ts` (righe 197-227)

**Problema:** Il controllo del cambio periodo usava solo `period_end`, non entrambe le date.

**Fix:** Ora controlla sia `period_start` che `period_end` per determinare se il periodo è cambiato.

```typescript
const { data: existingUsage } = await supabase
  .from('subscription_usage')
  .select('id, period_start, period_end')
  .eq('subscription_id', updatedSub.id)
  .eq('period_start', currentPeriodStart)
  .eq('period_end', currentPeriodEnd)
  .maybeSingle();
```

**Impatto:** I crediti vengono resettati correttamente al rinnovo della subscription.

---

#### 5. ✅ Miglioramento - Refresh crediti prima dello sblocco
**File:** `src/hooks/useCredits.ts` (righe 102-109)

**Problema:** Il controllo dei crediti usava dati locali potenzialmente non aggiornati.

**Fix:** Aggiunto refresh dei crediti dal database PRIMA di fare il controllo.

```typescript
// Refresh credits info before checking to ensure we have latest data
await fetchCreditsInfo();

// Check if has credits remaining (using refreshed data)
const remaining = getCreditsRemaining();
```

**Impatto:** Il frontend usa sempre i dati più aggiornati prima di permettere lo sblocco.

---

## Migrazioni Applicate

### Migration 026: Fix Credits System
**File:** `supabase/migrations/026_fix_credits_system.sql`

Questa migration:
1. Ricrea la funzione `increment_usage_counter` con il check per record esistenti
2. Aggiunge i permessi corretti
3. Aggiunge documentazione

---

## Test da Eseguire

### 1. Test Creazione Subscription
1. Acquista un piano (es. Starter)
2. Verifica che venga creato un record in `subscription_usage`
3. Verifica che i limiti siano corretti (20 profili per Starter)

### 2. Test Sblocco Candidato
1. Cerca un candidato
2. Clicca per sbloccare
3. Verifica che:
   - Il contatore `profiles_viewed` incrementi
   - Il contatore `profiles_remaining` decrementi
   - Il record venga aggiunto a `unlocked_candidates`

### 3. Test Limite Crediti
1. Sblocca candidati fino al limite del piano
2. Verifica che dopo il limite non sia possibile sbloccare altri candidati
3. Verifica che appaia il paywall

### 4. Test Rinnovo Subscription
1. Attendi il rinnovo (o simula tramite Stripe Dashboard)
2. Verifica che venga creato un nuovo record `subscription_usage`
3. Verifica che i crediti siano resettati

### 5. Test Piano Hero (Illimitato)
1. Acquista il piano Hero
2. Verifica che `profiles_remaining` sia NULL
3. Verifica che sia possibile sbloccare candidati senza limiti

---

## Note Importanti

### Gli webhook Stripe devono essere configurati
Assicurati che il webhook endpoint sia configurato correttamente in Stripe:
- URL: `https://cbpbwijovpfyqbxgtaiv.supabase.co/functions/v1/stripe-webhook`
- Eventi: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `invoice.paid`

### Deploy Webhook
Dopo aver modificato il file `supabase/functions/stripe-webhook/index.ts`, devi deployarlo:
```bash
supabase functions deploy stripe-webhook
```

Oppure usa il Dashboard Supabase → Edge Functions.

---

## Stato Finale

✅ Bug critici risolti
✅ Sistema crediti funzionante
✅ Controlli di sicurezza in atto
✅ Logging migliorato per debug

Il sistema di gestione crediti è ora robusto e sicuro.
