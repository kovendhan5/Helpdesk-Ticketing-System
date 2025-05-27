output "vm_external_ip" {
  description = "External IP address of the VM"
  value       = google_compute_instance.helpdesk_vm.network_interface.0.access_config.0.nat_ip
}

output "vm_internal_ip" {
  description = "Internal IP address of the VM"
  value       = google_compute_instance.helpdesk_vm.network_interface.0.network_ip
}

output "database_ip" {
  description = "IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.helpdesk_db.ip_address.0.ip_address
}

output "database_connection_name" {
  description = "Connection name of the Cloud SQL instance"
  value       = google_sql_database_instance.helpdesk_db.connection_name
}

output "static_ip" {
  description = "Static IP address"
  value       = google_compute_address.helpdesk_ip.address
}

output "vpc_network" {
  description = "VPC network name"
  value       = google_compute_network.helpdesk_vpc.name
}

output "service_account_email" {
  description = "Service account email"
  value       = google_service_account.helpdesk_sa.email
}
