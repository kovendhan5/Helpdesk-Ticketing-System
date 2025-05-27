variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "db_name" {
  description = "The name of the database"
  type        = string
  default     = "helpdesk_db"
}

variable "db_user" {
  description = "The database user"
  type        = string
  default     = "helpdesk_user"
}

variable "db_password" {
  description = "The database password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "ssh_public_key" {
  description = "SSH public key for VM access"
  type        = string
}
