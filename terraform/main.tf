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

# Minimal VM instance - e2-micro (free tier eligible)
resource "google_compute_instance" "helpdesk_vm" {
  name         = "helpdesk-vm"
  machine_type = "e2-micro"
  zone         = "${var.region}-a"

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 10  # Minimal disk size
      type  = "pd-standard"
    }
  }

  network_interface {
    network = "default"
    access_config {}  # Ephemeral IP (no static IP to save cost)
  }

  metadata = {
    ssh-keys = "ubuntu:${var.ssh_public_key}"
  }

  tags = ["helpdesk-server"]

  # Minimal setup script
  metadata_startup_script = <<-EOT
    #!/bin/bash
    apt-get update
    apt-get install -y nodejs npm nginx git postgresql-client
    npm install -g pm2
    mkdir -p /opt/helpdesk
    chown ubuntu:ubuntu /opt/helpdesk
    systemctl enable nginx
    systemctl start nginx
  EOT
}

# Minimal firewall rule
resource "google_compute_firewall" "helpdesk_firewall" {
  name    = "helpdesk-firewall"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22", "80", "3001"]  # SSH, HTTP, Backend only
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["helpdesk-server"]
}

# New minimal Cloud SQL instance (avoiding conflict)
resource "google_sql_database_instance" "helpdesk_db_v2" {
  name             = "helpdesk-db-v2"
  database_version = "POSTGRES_15"
  region           = var.region
  deletion_protection = false

  settings {
    tier = "db-f1-micro"  # Smallest/cheapest tier
    
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all"
        value = "0.0.0.0/0"
      }
    }

    backup_configuration {
      enabled = false  # Disable to minimize cost
    }

    insights_config {
      query_insights_enabled = false
    }
  }
}

# Database
resource "google_sql_database" "helpdesk_database" {
  name     = var.db_name
  instance = google_sql_database_instance.helpdesk_db_v2.name
}

# Database user
resource "google_sql_user" "helpdesk_user" {
  name     = var.db_user
  instance = google_sql_database_instance.helpdesk_db_v2.name
  password = var.db_password
}
