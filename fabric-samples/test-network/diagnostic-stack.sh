#!/usr/bin/env bash

set +e

export PATH="$PWD/../bin:$PATH"
export FABRIC_CFG_PATH="$PWD/../config"

echo "================================="
echo " AUDIT BLOCKCHAIN SIGFAE"
echo "================================="

echo ""
echo "1. Versions"
docker --version
docker compose version
node --version
npm --version
peer version | head -5

echo ""
echo "2. Conteneurs Fabric"
docker ps --format \
'table {{.Names}}\t{{.Status}}' \
| grep -E 'NAMES|peer0\.org|orderer\.example'

echo ""
echo "3. Organisations cryptographiques"
ls organizations/peerOrganizations/

echo ""
echo "4. Vérification des canaux"

source scripts/envVar.sh

for org in 1 2 3; do
  echo ""
  echo "===== ORG${org} ====="
  setGlobals "$org"
  peer channel list
done

echo ""
echo "5. Synchronisation des registres"

for org in 1 2 3; do
  echo ""
  echo "===== ORG${org} ====="
  setGlobals "$org"
  peer channel getinfo -c sigfae
done

echo ""
echo "6. Exemple de smart contract"

if [ -d ../asset-transfer-basic/chaincode-javascript ]; then
  echo "Chaincode JavaScript disponible"
else
  echo "Chaincode JavaScript absent"
fi

echo ""
echo "AUDIT TERMINE"
