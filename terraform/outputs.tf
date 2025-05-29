# Essential outputs only
output "vm_external_ip" {
  description = "External IP address of the VM (ephemeral)"
  value       = google_compute_instance.helpdesk_vm.network_interface.0.access_config.0.nat_ip
}

output "database_ip" {
  description = "IP address of the new database"
  value       = google_sql_database_instance.helpdesk_db_v2.public_ip_address
}

output "ssh_command" {
  description = "SSH command to connect to the VM"
  value       = "ssh -i helpdesk-key ubuntu@${google_compute_instance.helpdesk_vm.network_interface.0.access_config.0.nat_ip}"
}

output "database_connection_string" {
  description = "Database connection string for new database"
  value       = "postgresql://${var.db_user}:${var.db_password}@${google_sql_database_instance.helpdesk_db_v2.public_ip_address}:5432/${var.db_name}"
  sensitive   = true
}
