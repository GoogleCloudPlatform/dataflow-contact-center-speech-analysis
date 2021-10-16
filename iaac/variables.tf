/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

variable "gcp_project" {
  type        = string
  description = "GCP project name"
}

variable "dataflow_staging_bucket" {
  type        = string
  description = "Dataflow staging bucket name"
  default     = "saf-dataflow"
}

variable "audio_uploads_bucket" {
  type        = string
  description = "Audio uploads bucket name"
  default     = "saf-audio"
}

variable "flextemplate_bucket" {
  type        = string
  description = "Dataflow flextemplate bucket name"
  default     = "saf-flextemplate"
}

variable "function_bucket" {
  type        = string
  description = "Cloud Function source files"
  default     = "saf-function-source"
}

variable "dataset_id" {
  type        = string
  description = "BigQuery dataset name"
  default     = "saf"
}

variable "table_id" {
  type        = string
  description = "BigQuery table name"
  default     = "transcripts"
}
variable "saf_topic" {
  type        = string
  description = "Pub/Sub Topic name"
  default     = "saf-topic"
}

variable "image_name" {
  type        = string
  description = "Contrainer Image name"
  default     = "saf"
}

variable "dataflow_name" {
  type        = string
  description = "Dataflow Job name"
  default     = "saf"
}

variable "dataflow_region" {
  type        = string
  description = "Dataflow Region"
  default     = "us-central1"
}

variable "function_name" {
  type        = string
  description = "Cloud Function Name"
  default     = "safLongRunJobFunc"
}

variable "function_description" {
  type        = string
  description = "Cloud Function description"
  default     = "SAF Cloud Function"
}

variable "function_region" {
  type        = string
  description = "Cloud Function Region"
  default     = "us-central1"
}




