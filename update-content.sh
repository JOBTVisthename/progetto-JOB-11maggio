#!/usr/bin/env bash
# update-content.sh
# Aggiorna i contenuti del sito JOB TV:
#  - Utenti = 160k
#  - Rimuove "Tempo medio di risposta" dal portale
#  - Nuove descrizioni piani (Starter / Builder / Hero)
#  - Prezzi: 200, 500, 1000 + IVA (IVA sempre 22%)
#
# USO:
#   1) Copia questo file nella ROOT del repo JOB-11maggio
#   2) chmod +x update-content.sh
#   3) ./update-content.sh
#   4) git add -A && git commit -m "update content + pricing" && git push
#
set -euo pipefail

echo "==> Cerco i file da aggiornare..."

# Trova tutti i file sorgente
FILES=$(find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" -o -name "*.html" \) 2>/dev/null || true)

if [ -z "$FILES" ]; then
  echo "ERRORE: nessun file trovato in src/. Sei nella root del repo?"
  exit 1
fi

# 1) Utenti -> 160k (gestisce varianti comuni)
echo "==> Aggiorno conteggio utenti a 160k..."
for f in $FILES; do
  sed -i.bak -E \
    -e 's/[0-9]+(\.[0-9]+)?[[:space:]]*[kK]\+?[[:space:]]*(utenti|users)/160k+ \2/g' \
    -e 's/[0-9]{1,3}(\.[0-9]{3})+[[:space:]]*(utenti|users)/160.000 \2/g' \
    "$f" || true
done

# 2) Rimuovi "Tempo medio di risposta" (riga intera o blocco JSX semplice)
echo "==> Rimuovo 'Tempo medio di risposta'..."
for f in $FILES; do
  # rimuove righe che contengono la dicitura
  sed -i.bak '/[Tt]empo medio di risposta/d' "$f" || true
done

# 3) Aggiorna piani e prezzi (Starter / Builder / Hero)
echo "==> Aggiorno descrizioni piani e prezzi (+IVA 22%)..."
for f in $FILES; do
  sed -i.bak -E \
    -e 's/€[[:space:]]*199([^0-9]|$)/€ 200 + IVA\1/g' \
    -e 's/€[[:space:]]*499([^0-9]|$)/€ 500 + IVA\1/g' \
    -e 's/€[[:space:]]*999([^0-9]|$)/€ 1000 + IVA\1/g' \
    -e 's/€[[:space:]]*200([^0-9+]|$)/€ 200 + IVA\1/g' \
    -e 's/€[[:space:]]*500([^0-9+]|$)/€ 500 + IVA\1/g' \
    -e 's/€[[:space:]]*1000([^0-9+]|$)/€ 1000 + IVA\1/g' \
    "$f" || true
done

# 4) Pulizia file .bak
find src -name "*.bak" -delete 2>/dev/null || true

echo ""
echo "✅ Modifiche applicate."
echo ""
echo "ATTENZIONE: i testi descrittivi dei piani (Starter / Builder / Hero)"
echo "vanno rivisti a mano nel file della pagina pricing, perché ogni progetto"
echo "ha una struttura diversa. Apri:"
echo "   src/pages/Pricing*.tsx   oppure   src/routes/pricing*.tsx"
echo "e incolla i testi che ti ho fornito."
echo ""
echo "Poi lancia:"
echo "   git add -A && git commit -m 'update: 160k utenti, prezzi +IVA, piani' && git push"
