#!/bin/bash

# 🔍 GitHub Actions CI/CD Verification Script
# This script verifies that all components are ready for automated deployment

echo "🔍 GitHub Actions CI/CD Verification"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SUCCESS=0
WARNINGS=0
ERRORS=0

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 exists"
        ((SUCCESS++))
    else
        echo -e "${RED}❌${NC} $1 missing"
        ((ERRORS++))
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 directory exists"
        ((SUCCESS++))
    else
        echo -e "${RED}❌${NC} $1 directory missing"
        ((ERRORS++))
    fi
}

check_git_ignore() {
    if grep -q "$1" .gitignore 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $1 properly gitignored"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠️${NC} $1 not found in .gitignore"
        ((WARNINGS++))
    fi
}

echo ""
echo "📁 Checking CI/CD Pipeline Files..."
check_file ".github/workflows/ci-cd.yml"
check_file "GITHUB-ACTIONS-SETUP.md"

echo ""
echo "🧪 Checking Package Files..."
check_file "backend/package.json"
check_file "frontend/package.json"
check_file "frontend/src/App.test.js"

echo ""
echo "🔐 Checking Security Configuration..."
check_file ".gitignore"
check_file ".env.example"
check_git_ignore "*.env"
check_git_ignore "terraform.tfvars"
check_git_ignore "credentials.json"
check_git_ignore "helpdesk-key*"

echo ""
echo "📦 Checking Application Structure..."
check_directory "backend/src"
check_directory "frontend/src"
check_directory "terraform"

echo ""
echo "🔧 Checking Backend Scripts..."
if grep -q "setup-db-secure" backend/package.json; then
    echo -e "${GREEN}✅${NC} Backend has secure setup script"
    ((SUCCESS++))
else
    echo -e "${RED}❌${NC} Backend missing secure setup script"
    ((ERRORS++))
fi

if grep -q "test.*exit 0" backend/package.json; then
    echo -e "${GREEN}✅${NC} Backend test script configured"
    ((SUCCESS++))
else
    echo -e "${RED}❌${NC} Backend test script not configured"
    ((ERRORS++))
fi

echo ""
echo "🌐 Checking Frontend Configuration..."
if grep -q "test.*--watchAll=false" frontend/package.json; then
    echo -e "${GREEN}✅${NC} Frontend test script configured for CI"
    ((SUCCESS++))
else
    echo -e "${RED}❌${NC} Frontend test script not configured for CI"
    ((ERRORS++))
fi

if grep -q "build" frontend/package.json; then
    echo -e "${GREEN}✅${NC} Frontend build script available"
    ((SUCCESS++))
else
    echo -e "${RED}❌${NC} Frontend build script missing"
    ((ERRORS++))
fi

echo ""
echo "🗄️ Checking Terraform Infrastructure..."
check_file "terraform/main.tf"
check_file "terraform/outputs.tf"
check_file "terraform/variables.tf"

echo ""
echo "📊 Verification Summary"
echo "======================"
echo -e "✅ Successful checks: ${GREEN}$SUCCESS${NC}"
echo -e "⚠️ Warnings: ${YELLOW}$WARNINGS${NC}"
echo -e "❌ Errors: ${RED}$ERRORS${NC}"

echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🚀 Ready for GitHub Actions CI/CD!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Commit and push all changes to GitHub"
    echo "2. Add required secrets to GitHub repository"
    echo "3. Test the automated deployment pipeline"
    echo ""
    echo "Required GitHub Secrets:"
    echo "- SSH_PRIVATE_KEY"
    echo "- VM_IP"
    echo "- SLACK_WEBHOOK (optional)"
    exit 0
else
    echo -e "${RED}❌ Issues found. Please fix errors before proceeding.${NC}"
    exit 1
fi
