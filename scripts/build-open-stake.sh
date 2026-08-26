#!/usr/bin/env bash
set -euo pipefail

readonly OPEN_STAKE_REPOSITORY="https://github.com/tanh1c/stake-originals-clone.git"
readonly OPEN_STAKE_COMMIT="7f7065832cae8c898494ca7398f23d4a33a05c17"
readonly OPEN_STAKE_BASE="/maktub-sdk-demo/open-stake/"
readonly OPEN_STAKE_WORK_DIR="${RUNNER_TEMP:-/tmp}/open-stake-source"
readonly OPEN_STAKE_NPM_CACHE="${RUNNER_TEMP:-/tmp}/open-stake-npm-cache"

case "${OPEN_STAKE_WORK_DIR}" in
  */open-stake-source) ;;
  *)
    echo "Unexpected build directory: ${OPEN_STAKE_WORK_DIR}" >&2
    exit 1
    ;;
esac

rm -rf "${OPEN_STAKE_WORK_DIR}"
git clone --filter=blob:none --no-checkout "${OPEN_STAKE_REPOSITORY}" "${OPEN_STAKE_WORK_DIR}"
git -C "${OPEN_STAKE_WORK_DIR}" checkout --detach "${OPEN_STAKE_COMMIT}"

cd "${OPEN_STAKE_WORK_DIR}"

# Hash routing keeps every game reachable when the app is hosted in a Pages subdirectory.
sed -i 's/{ BrowserRouter }/{ HashRouter }/' src/main.jsx
sed -i 's/<BrowserRouter>/<HashRouter>/g; s#</BrowserRouter>#</HashRouter>#g' src/main.jsx

# Give the public demo a disposable local Byte Coin balance.
sed -i 's/const INITIAL_BALANCE = 1000\.00/const INITIAL_BALANCE = 10000.00/' src/context/WalletContext.jsx
sed -i 's/stake_wallet_balance/open_stake_bc_wallet_balance/' src/context/WalletContext.jsx
sed -i "s/useState('USD')/useState('BC')/" src/context/WalletContext.jsx
find src -type f \( -name '*.js' -o -name '*.jsx' \) -exec sed -i 's/₿/BC /g; s/>Stake</>Open Stake</g' {} +
sed -i 's/Reset to BC 1,000.00/Reset to 10,000 BC/' src/components/Header.jsx
sed -i 's/Stake Casino Games Clone - Crash, Dice, Mines and more/Open Stake test demo - Crash, Plinko, Mines and Dino/' index.html
sed -i 's/<title>Stake - Casino Games<\/title>/<title>Open Stake - BC Test Demo<\/title>/' index.html

npm ci --no-audit --no-fund --cache "${OPEN_STAKE_NPM_CACHE}"
npm run build -- --base="${OPEN_STAKE_BASE}"

# Vite rewrites bundled assets, but literal public-directory URLs need the Pages prefix.
find dist -type f \( -name '*.js' -o -name '*.css' -o -name '*.html' \) -exec perl -0pi -e '
  s#/maktub-sdk-demo/open-stake/#__OPEN_STAKE_BASE__#g;
  s#/images/#__OPEN_STAKE_BASE__images/#g;
  s#/dino-assets/#__OPEN_STAKE_BASE__dino-assets/#g;
  s#/plinko-outcomes\.json#__OPEN_STAKE_BASE__plinko-outcomes.json#g;
  s#__OPEN_STAKE_BASE__#/maktub-sdk-demo/open-stake/#g;
' {} +

mkdir -p "${GITHUB_WORKSPACE:?}/_site/open-stake"
cp -a dist/. "${GITHUB_WORKSPACE}/_site/open-stake/"

# Fail the deployment if a root-relative game asset slipped through.
if grep -RPq --include='*.js' --include='*.css' --include='*.html' \
  '(?<!/maktub-sdk-demo/open-stake)/(images|dino-assets)/|(?<!/maktub-sdk-demo/open-stake)/plinko-outcomes\.json' dist; then
  echo "Open Stake contains unresolved root-relative asset URLs" >&2
  exit 1
fi
