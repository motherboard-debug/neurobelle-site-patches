#!/usr/bin/env bash
# Prints the current Squarespace HEADER injection block — with all jsDelivr URLs
# pinned to the latest git commit SHA. Bypasses jsDelivr @main cache lag.
#
# JSON-LD is the canonical schema (synced from motherboard seo/schema/bump-cache.sh,
# fasit docs/klinikk-fakta.md): Physicians nested as department (valid without
# address/image), no openingHours (hours vary by doctor/day — never hardcode),
# no Dermatology. Do NOT edit the schema here without updating the canonical file.
#
# NB: GA4 gtag snippet and og:image meta in the live header are NOT emitted by
# this script — when pasting, replace only the matching css/js lines and the
# ld+json block; leave GA4 and og-tags untouched.
#
# Usage:
#   ./bump-cache.sh                 # prints to stdout
#   ./bump-cache.sh | pbcopy        # copies to macOS clipboard
#   ./bump-cache.sh > header.html   # saves to file
#
# After running: paste the output into Squarespace → Settings → Advanced
# → Code Injection → HEADER, replacing what's there. Save.

set -e

cd "$(dirname "$0")"

SHA=$(git rev-parse --short HEAD)
REPO="motherboard-debug/neurobelle-site-patches"

cat <<EOF
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/${REPO}@${SHA}/dist/booking.css">
<script src="https://cdn.jsdelivr.net/gh/${REPO}@${SHA}/dist/booking.js" defer></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/${REPO}@${SHA}/dist/behandlinger.css">
<script src="https://cdn.jsdelivr.net/gh/${REPO}@${SHA}/dist/behandlinger.js" defer></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/${REPO}@${SHA}/dist/site-polish.css">
<script src="https://cdn.jsdelivr.net/gh/${REPO}@${SHA}/dist/site-polish.js" defer></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/${REPO}@${SHA}/dist/seo.css">
<script src="https://cdn.jsdelivr.net/gh/${REPO}@${SHA}/dist/seo.js" defer></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/${REPO}@${SHA}/dist/site-redesign.css">
<script src="https://cdn.jsdelivr.net/gh/${REPO}@${SHA}/dist/site-redesign.js" defer></script>
<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[{"@type":"WebSite","@id":"https://www.neurobelleklinikk.com/#website","name":"Neurobelle Klinikk","url":"https://www.neurobelleklinikk.com","inLanguage":"no","publisher":{"@id":"https://www.neurobelleklinikk.com/#clinic"}},{"@type":["MedicalClinic","LocalBusiness"],"@id":"https://www.neurobelleklinikk.com/#clinic","name":"Neurobelle Klinikk","description":"Privat lege- og spesialistklinikk i Oslo sentrum. Allmennmedisin, nevrologi og estetisk medisin med kort ventetid. Bestilling via PatientSky med navn og telefon.","url":"https://www.neurobelleklinikk.com","telephone":"+47 458 17 755","email":"post@neurobelleklinikk.com","priceRange":"$$","currenciesAccepted":"NOK","address":{"@type":"PostalAddress","streetAddress":"Arbeidersamfunnets plass 1","addressLocality":"Oslo","postalCode":"0181","addressCountry":"NO"},"geo":{"@type":"GeoCoordinates","latitude":59.9165,"longitude":10.7497},"areaServed":{"@type":"City","name":"Oslo"},"medicalSpecialty":["PrimaryCare","Neurologic","PlasticSurgery"],"sameAs":["https://maps.app.goo.gl/PZiP8D976ay76Xmz7","https://www.facebook.com/people/Neurobelle-klinikk/100063642756998/","https://www.instagram.com/neurobelleklinikk/"],"department":[{"@type":"Physician","name":"Dr. Ardavan Karimi","medicalSpecialty":"Neurologic","identifier":"HPR-9258116","description":"Nevrolog og fysikalsk medisin. Klinisk leder ved Neurobelle Klinikk."},{"@type":"Physician","name":"Dr. Kaviyan Karimi","medicalSpecialty":"PrimaryCare","identifier":"HPR-10173026","description":"Allmennlege og estetisk medisin."},{"@type":"Physician","name":"Dr. Giti Sabalani","medicalSpecialty":"PrimaryCare","identifier":"HPR-9385126","description":"Allmennspesialist — kontroll og oppfølging."}]}]}
</script>
EOF

# Print a stderr note (won't pollute stdout if you're piping to pbcopy)
>&2 echo ""
>&2 echo "✓ Header block generated, pinned to commit ${SHA}"
>&2 echo "  Paste in Squarespace → Settings → Advanced → Code Injection → HEADER"
