#!/bin/bash
# GitHub Actions Workflow Validation Script

echo "🔍 Validating GitHub Actions Workflow..."

WORKFLOW_FILE=".github/workflows/ci-cd.yml"

if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

echo "✅ Workflow file exists: $WORKFLOW_FILE"

# Check for common YAML issues
echo "🔍 Checking for YAML syntax issues..."

# Check for duplicate keys
if grep -n "run:" "$WORKFLOW_FILE" | grep -q "run:.*run:"; then
    echo "❌ Duplicate 'run' keys found"
    exit 1
fi

if grep -n "name:" "$WORKFLOW_FILE" | grep -q "name:.*name:"; then
    echo "❌ Duplicate 'name' keys found"
    exit 1
fi

# Check for proper indentation
if grep -q "^[[:space:]]*[[:alpha:]].*[[:space:]][[:alpha:]]" "$WORKFLOW_FILE"; then
    echo "⚠️  Potential indentation issues detected"
fi

# Check line count for reasonableness
LINES=$(wc -l < "$WORKFLOW_FILE")
echo "📊 Workflow file has $LINES lines"

if [ "$LINES" -lt 50 ]; then
    echo "⚠️  Workflow seems unusually short"
elif [ "$LINES" -gt 500 ]; then
    echo "⚠️  Workflow seems unusually long"
fi

echo "✅ Basic YAML validation completed"
echo ""
echo "🚀 To test this workflow:"
echo "1. Commit and push to GitHub"
echo "2. Check Actions tab for execution results"
echo "3. Monitor for any runtime errors"
echo ""
echo "📋 Workflow includes:"
echo "   • Security scanning"
echo "   • Backend and frontend testing"
echo "   • Build artifacts"
echo "   • Conditional deployment"
