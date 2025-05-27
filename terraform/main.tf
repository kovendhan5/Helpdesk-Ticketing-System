terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.20.0"
    }
  }
}

provider "google" {
  credentials = file("credentials.json")
  project     = var.project_id
  region      = var.region
}

# VPC Network
resource "google_compute_network" "helpdesk_vpc" {
  name                    = "helpdesk-vpc"
  auto_create_subnetworks = false
}

# Subnet
resource "google_compute_subnetwork" "helpdesk_subnet" {
  name          = "helpdesk-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.helpdesk_vpc.id
}

# Firewall rules
resource "google_compute_firewall" "allow_http_https" {
  name    = "allow-http-https"
  network = google_compute_network.helpdesk_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["web-server"]
}

resource "google_compute_firewall" "allow_ssh" {
  name    = "allow-ssh"
  network = google_compute_network.helpdesk_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["web-server"]
}

resource "google_compute_firewall" "allow_backend" {
  name    = "allow-backend"
  network = google_compute_network.helpdesk_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["3001"]
  }

  source_ranges = ["10.0.1.0/24"]
  target_tags   = ["web-server"]
}

# Cloud SQL Instance
resource "google_sql_database_instance" "helpdesk_db" {
  name             = "helpdesk-db-instance"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier = "db-f1-micro"
    
    ip_configuration {
      ipv4_enabled    = true
      private_network = google_compute_network.helpdesk_vpc.id
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }

    backup_configuration {
      enabled    = true
      start_time = "03:00"
    }

    database_flags {
      name  = "log_checkpoints"
      value = "on"
    }
  }

  deletion_protection = false
}

# Database
resource "google_sql_database" "helpdesk_database" {
  name     = var.db_name
  instance = google_sql_database_instance.helpdesk_db.name
}

# Database user
resource "google_sql_user" "helpdesk_user" {
  name     = var.db_user
  instance = google_sql_database_instance.helpdesk_db.name
  password = var.db_password
}

# Service Account for Compute Engine
resource "google_service_account" "helpdesk_sa" {
  account_id   = "helpdesk-service-account"
  display_name = "Helpdesk Service Account"
  description  = "Service account for helpdesk application"
}

# IAM bindings for service account
resource "google_project_iam_member" "helpdesk_sa_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.helpdesk_sa.email}"
}

resource "google_project_iam_member" "helpdesk_sa_compute_viewer" {
  project = var.project_id
  role    = "roles/compute.viewer"
  member  = "serviceAccount:${google_service_account.helpdesk_sa.email}"
}

# Compute Engine instance
resource "google_compute_instance" "helpdesk_vm" {
  name         = "helpdesk-vm"
  machine_type = "e2-medium"
  zone         = "${var.region}-a"

  tags = ["web-server"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 20
      type  = "pd-standard"
    }
  }

  network_interface {
    network    = google_compute_network.helpdesk_vpc.name
    subnetwork = google_compute_subnetwork.helpdesk_subnet.name
    
    access_config {
      // Ephemeral public IP
    }
  }

  service_account {
    email  = google_service_account.helpdesk_sa.email
    scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/sqlservice.admin"
    ]
  }

  metadata = {
    ssh-keys = "ubuntu:${var.ssh_public_key}"
  }

  metadata_startup_script = <<-EOT
    #!/bin/bash
    
    # Update system
    apt-get update
    apt-get upgrade -y
    
    # Install Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    apt-get install -y nodejs
    
    # Install PM2 globally
    npm install -g pm2
    
    # Install NGINX
    apt-get install -y nginx
    
    # Install Git
    apt-get install -y git
    
    # Create app directory
    mkdir -p /opt/helpdesk
    chown ubuntu:ubuntu /opt/helpdesk
    
    # Configure NGINX (basic setup, will be updated by deployment)
    cat > /etc/nginx/sites-available/helpdesk << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
        index index.html index.htm;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
    
    # Enable the site
    ln -sf /etc/nginx/sites-available/helpdesk /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Create basic index.html
    mkdir -p /var/www/html
    cat > /var/www/html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Helpdesk Ticketing System</title>
</head>
<body>
    <h1>Helpdesk Ticketing System</h1>
    <p>Deployment in progress...</p>
</body>
</html>
EOF
    
    # Start and enable services
    systemctl enable nginx
    systemctl start nginx
    
    # Create environment file for backend
    cat > /opt/helpdesk/.env << EOF
NODE_ENV=production
PORT=3001
DB_HOST=${google_sql_database_instance.helpdesk_db.ip_address.0.ip_address}
DB_PORT=5432
DB_NAME=${var.db_name}
DB_USER=${var.db_user}
DB_PASSWORD=${var.db_password}
JWT_SECRET=${var.jwt_secret}
EOF
    
    chown ubuntu:ubuntu /opt/helpdesk/.env
    chmod 600 /opt/helpdesk/.env
    
    # Setup log directory
    mkdir -p /var/log/helpdesk
    chown ubuntu:ubuntu /var/log/helpdesk
    
    echo "VM setup completed" > /var/log/helpdesk/setup.log
  EOT

  depends_on = [
    google_sql_database_instance.helpdesk_db,
    google_sql_database.helpdesk_database,
    google_sql_user.helpdesk_user
  ]
}

# Static IP for the instance (optional)
resource "google_compute_address" "helpdesk_ip" {
  name   = "helpdesk-static-ip"
  region = var.region
}
