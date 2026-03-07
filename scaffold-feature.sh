#!/usr/bin/env bash
# Usage: ./scaffold-feature.sh <feature-name>
# Example: ./scaffold-feature.sh invoices

set -e

FEATURE="$1"

if [ -z "$FEATURE" ]; then
  echo "Error: feature name is required."
  echo "Usage: ./scaffold-feature.sh <feature-name>"
  exit 1
fi

FEATURE_DIR="src/features/$FEATURE"

if [ -d "$FEATURE_DIR" ]; then
  echo "Error: feature '$FEATURE' already exists at $FEATURE_DIR"
  exit 1
fi

echo "Scaffolding feature: $FEATURE"

# Create folders
mkdir -p "$FEATURE_DIR/components"
mkdir -p "$FEATURE_DIR/composables"
mkdir -p "$FEATURE_DIR/pages"
mkdir -p "$FEATURE_DIR/services"
mkdir -p "$FEATURE_DIR/store"
mkdir -p "$FEATURE_DIR/types"
mkdir -p "$FEATURE_DIR/utils"

# Create index.ts
cat > "$FEATURE_DIR/index.ts" << EOF
// $FEATURE feature exports
EOF

echo "Done! Created:"
find "$FEATURE_DIR" | sort
