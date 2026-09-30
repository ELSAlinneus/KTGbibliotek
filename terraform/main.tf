terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.8.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "6.8.0"
    }
  }
}

provider "google" {
  project = "ktgbibliotek"
}

provider "google-beta" {
  project = "ktgbibliotek"
}

resource "google_firebaserules_ruleset" "firestore" {
  project = "ktgbibliotek"
  source {
    files {
      name    = "firestore.rules"
      content = file("${path.module}/firestore.rules")
    }
  }
}

resource "google_firebaserules_release" "firestore" {
  name         = "cloud.firestore"
  ruleset_name = "projects/ktgbibliotek/rulesets/${google_firebaserules_ruleset.firestore.name}"
  project      = "ktgbibliotek"
}

resource "google_firebase_hosting_site" "default" {
  provider = google-beta
  project  = "ktgbibliotek"
  site_id  = "ktgbibliotek"
}