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

# GCP Settings
gcp_project             = PROJECT_ID
dataflow_staging_bucket = "saf-dataflow"
audio_uploads_bucket    = "saf-audio"
flextemplate_bucket     = "saf-flextemplate"
function_bucket         = "saf-function-source"
dataset_id              = "saf"
table_id                = "transcripts"
saf_topic               = "saf_topic"
dataflow_name           = "saf"
dataflow_region         = "us-central1"
image_name              = "saf"
function_name           = "safLongRunJobFunc"
function_region         = "us-central1"
function_description    = "SAF Cloud Function"