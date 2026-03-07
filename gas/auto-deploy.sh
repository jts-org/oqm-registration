clasp push &&
clasp version "auto-deploy"
VERSION=$(clasp versions | tail -1 | awk '{print $1}')
clasp deploy --versionNumber $VERSION
URL=$(clasp deployments | tail -1 | awk '{print "https://script.google.com/macros/s/" $2 "/exec"}')
echo "VITE_GAS_BASE_URL=$URL" > ../web/.env.local