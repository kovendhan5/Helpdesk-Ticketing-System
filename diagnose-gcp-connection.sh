#!/bin/bash

echo "========================================"
echo "🔧 GCP VM CONNECTION DIAGNOSTICS"
echo "========================================"
echo

# GCP VM Details
GCP_VM_IP="34.55.113.9"
GCP_VM_USER="kovendhan2535"

echo "📋 Testing Connection to GCP VM"
echo "Target: $GCP_VM_USER@$GCP_VM_IP"
echo "Time: $(date)"
echo

# Test 1: Ping the VM
echo "🧪 Test 1: Network Connectivity (Ping)"
echo "----------------------------------------"
if ping -c 3 -W 5 "$GCP_VM_IP" > /dev/null 2>&1; then
    echo "✅ VM is reachable via ping"
else
    echo "❌ VM is NOT reachable via ping"
    echo "💡 Possible issues:"
    echo "   - VM is stopped"
    echo "   - VM IP has changed"
    echo "   - Network routing issues"
fi
echo

# Test 2: Check SSH port
echo "🧪 Test 2: SSH Port Connectivity"
echo "----------------------------------------"
if timeout 10 bash -c "</dev/tcp/$GCP_VM_IP/22" 2>/dev/null; then
    echo "✅ SSH port 22 is open"
else
    echo "❌ SSH port 22 is closed or filtered"
    echo "💡 Possible issues:"
    echo "   - GCP firewall blocking SSH"
    echo "   - SSH service not running"
    echo "   - VM is stopped"
fi
echo

# Test 3: Try SSH connection
echo "🧪 Test 3: SSH Authentication Test"
echo "----------------------------------------"
echo "Attempting SSH connection..."
ssh -o ConnectTimeout=10 -o BatchMode=yes -o StrictHostKeyChecking=no "$GCP_VM_USER@$GCP_VM_IP" "echo 'SSH connection successful!'; hostname; whoami; date" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ SSH connection successful"
else
    echo "❌ SSH connection failed"
    echo "💡 Possible issues:"
    echo "   - SSH key not added to VM"
    echo "   - Wrong username"
    echo "   - SSH service not running"
fi
echo

# Test 4: Check other common ports
echo "🧪 Test 4: Other Service Ports"
echo "----------------------------------------"
for port in 80 443 3001 8080; do
    echo -n "Port $port: "
    if timeout 5 bash -c "</dev/tcp/$GCP_VM_IP/$port" 2>/dev/null; then
        echo "✅ Open"
    else
        echo "❌ Closed"
    fi
done
echo

echo "📋 Troubleshooting Steps"
echo "----------------------------------------"
echo "1. Check GCP VM Status:"
echo "   - Go to GCP Console → Compute Engine → VM instances"
echo "   - Verify the VM is RUNNING"
echo "   - Check the external IP address"
echo
echo "2. Check GCP Firewall:"
echo "   - Go to VPC Network → Firewall"
echo "   - Ensure 'default-allow-ssh' rule exists and is enabled"
echo "   - Target: 0.0.0.0/0, Port: 22"
echo
echo "3. Update VM IP in workflow if changed:"
echo "   - Check if VM external IP is still: $GCP_VM_IP"
echo "   - Update .github/workflows/deploy-production.yml if needed"
echo
echo "4. SSH to VM manually to test:"
echo "   ssh -i gcp_helpdesk_key_new $GCP_VM_USER@$GCP_VM_IP"
echo

echo "========================================"
echo "🔧 Diagnostics completed!"
echo "========================================"
