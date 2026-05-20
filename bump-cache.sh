#!/usr/bin/env bash
# Prints the current Squarespace HEADER injection block — with all jsDelivr URLs
# pinned to the latest git commit SHA. Bypasses jsDelivr @main cache lag.
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
<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[{"@type":["MedicalClinic","LocalBusiness"],"@id":"https://www.neurobelleklinikk.com/#clinic","name":"Neurobelle Klinikk","url":"https://www.neurobelleklinikk.com","telephone":"+47 458 17 755","email":"post@neurobelleklinikk.com","priceRange":"300-12000 NOK","address":{"@type":"PostalAddress","streetAddress":"Arbeidersamfunnets plass 1","addressLocality":"Oslo","postalCode":"0181","addressCountry":"NO"},"geo":{"@type":"GeoCoordinates","latitude":59.9165,"longitude":10.7497},"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"09:00","closes":"18:00"}],"medicalSpecialty":["Neurology","PrimaryCare","Dermatology"],"areaServed":{"@type":"City","name":"Oslo"}},{"@type":"Physician","@id":"https://www.neurobelleklinikk.com/#dr-ardavan-karimi","name":"Dr. Ardavan Karimi","medicalSpecialty":["Neurology","Dermatology"],"worksFor":{"@id":"https://www.neurobelleklinikk.com/#clinic"},"identifier":"HPR-9258116"},{"@type":"Physician","@id":"https://www.neurobelleklinikk.com/#dr-giti-sabalani","name":"Dr. Giti Sabalani","medicalSpecialty":"PrimaryCare","worksFor":{"@id":"https://www.neurobelleklinikk.com/#clinic"},"identifier":"HPR-9385126"},{"@type":"Physician","@id":"https://www.neurobelleklinikk.com/#dr-kaviyan-karimi","name":"Dr. Kaviyan Karimi","medicalSpecialty":["PrimaryCare","Dermatology"],"worksFor":{"@id":"https://www.neurobelleklinikk.com/#clinic"},"identifier":"HPR-10173026"}]}
</script>
EOF

# Print a stderr note (won't pollute stdout if you're piping to pbcopy)
>&2 echo ""
>&2 echo "✓ Header block generated, pinned to commit ${SHA}"
>&2 echo "  Paste in Squarespace → Settings → Advanced → Code Injection → HEADER"
