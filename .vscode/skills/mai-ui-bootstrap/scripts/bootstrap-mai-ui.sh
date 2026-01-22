#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR=$(pwd)
SKIP_AUTH=0
SKIP_NPMRC=0

usage() {
  cat <<'EOF'
Usage: bootstrap-mai-ui.sh [--project-dir PATH] [--skip-auth] [--skip-npmrc]

Prepares a project to consume the MAI UI component suite and design tokens.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-dir)
      PROJECT_DIR="$2"
      shift 2
      ;;
    --skip-auth)
      SKIP_AUTH=1
      shift
      ;;
    --skip-npmrc)
      SKIP_NPMRC=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

ensure_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: $1 not found in PATH" >&2
    exit 1
  fi
}

check_node_version() {
  local NODE_VERSION
  NODE_VERSION=$(node --version | sed 's/v//')
  local MAJOR=${NODE_VERSION%%.*}
  if (( MAJOR < 18 )); then
    echo "ERROR: Node.js 18+ required (detected $NODE_VERSION)" >&2
    exit 1
  fi
}

install_cred_provider() {
  if command -v artifacts-npm-credprovider >/dev/null 2>&1; then
    echo "Credential provider already installed"
    return
  fi
  echo "Installing Azure Artifacts credential provider..."
  npm install --global @microsoft/artifacts-npm-credprovider \
    --registry https://pkgs.dev.azure.com/artifacts-public/23934c1b-a3b5-4b70-9dd3-d1bef4cc72a0/_packaging/AzureArtifacts/npm/registry/
}

write_npmrc() {
  local npmrc="$PROJECT_DIR/.npmrc"
  mkdir -p "$PROJECT_DIR"
  touch "$npmrc"
  if grep -q '@mai-ui:registry=' "$npmrc" 2>/dev/null; then
    echo ".npmrc already configures the @mai-ui scope"
    return
  fi
  cat >>"$npmrc" <<'EOF'
@mai-ui:registry=https://pkgs.dev.azure.com/microsoftaidesign/mai-ui/_packaging/mai-ui/npm/registry/
always-auth=true
EOF
  echo "Wrote MAI UI registry settings to $npmrc"
}

refresh_auth() {
  if (( SKIP_AUTH == 1 )); then
    echo "Skipping credential refresh per flag"
    return
  fi
  echo "Refreshing Azure Artifacts credentials..."
  artifacts-npm-credprovider
}

install_packages() {
  pushd "$PROJECT_DIR" >/dev/null
  npm install @mai-ui/core-components-suite @mai-ui/design-tokens
  popd >/dev/null
}

post_install_hint() {
  cat <<'EOF'
MAI UI packages installed.
Next steps:
  - Run scripts/verify-mai-ui-install.mjs --project-dir <path> to confirm everything resolves
  - Commit .npmrc changes if allowed by repo policy
EOF
}

ensure_command node
ensure_command npm
check_node_version
install_cred_provider
if (( SKIP_NPMRC == 0 )); then
  write_npmrc
else
  echo "Skipping .npmrc edits per flag"
fi
refresh_auth
install_packages
post_install_hint
