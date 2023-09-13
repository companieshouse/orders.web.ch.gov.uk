# ------------------------------------------------------------------------------
# Environment
# ------------------------------------------------------------------------------
variable "environment" {
  type        = string
  description = "The environment name, defined in envrionments vars."
}
variable "aws_region" {
  default     = "eu-west-2"
  type        = string
  description = "The AWS region for deployment."
}
variable "aws_profile" {
  default     = "development-eu-west-2"
  type        = string
  description = "The AWS profile to use for deployment."
}

# ------------------------------------------------------------------------------
# Docker Container
# ------------------------------------------------------------------------------
variable "docker_registry" {
  type        = string
  description = "The FQDN of the Docker registry."
}

# ------------------------------------------------------------------------------
# Service performance and scaling configs
# ------------------------------------------------------------------------------
variable "desired_task_count" {
  type        = number
  description = "The desired ECS task count for this service"
  default     = 1 # defaulted low for dev environments, override for production
}
variable "required_cpus" {
  type        = number
  description = "The required cpu resource for this service. 1024 here is 1 vCPU"
  default     = 128 # defaulted low for dev environments, override for production
}
variable "required_memory" {
  type        = number
  description = "The required memory for this service"
  default     = 256 # defaulted low for node service in dev environments, override for production
}

# ------------------------------------------------------------------------------
# Service environment variable configs
# ------------------------------------------------------------------------------
variable "orders_web_version" {
  type        = string
  description = "The version of the orders web container to run."
}

variable "basket_item_limit" {
  type = number
}

variable "cookie_name" {
  type = string
}

variable "default_session_expiration" {
  type = number
}

variable "dispatch_days" {
  type = number
}

variable "human_log" {
  type = number
}

variable "log_level" {
  type = string
}

variable "tz" {
  type = string
}

variable "dynamic_lp_certificate_orders_enabled" {
  type = bool
}

variable "dynamic_llp_certificate_orders_enabled" {
  type = bool
}

variable "retry_checkout_number" {
  type = number
}

variable "retry_checkout_delay" {
  type = number
}

variable "liquidated_company_certificates_enabled" {
  type = bool
}

variable "administrator_company_certificates_enabled" {
  type = bool
}

variable "piwik_site_id" {
  description = "The site ID to use when connecting to piwik_url"
  type        = string
}

variable "piwik_url" {
  description = "The URL to use to connect to Piwik / Matomo"
  type        = string
}
