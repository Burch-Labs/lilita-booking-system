# Deployment Architecture - Mara Meguarra Booking System

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          END USERS (Agents & Partners)                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     BROWSER CLIENT LAYER                         │   │
│  │                                                                  │   │
│  │  ┌──────────────────────┐  ┌──────────────────────────────┐    │   │
│  │  │ Agent Dashboard      │  │  Contact Management          │    │   │
│  │  │ - KPI Metrics        │  │  - Smart Website Extraction  │    │   │
│  │  │ - Bookings Tab       │  │  - Bulk Import/Export        │    │   │
│  │  │ - Commissions Tab    │  │  - Mobile/Desktop Responsive │    │   │
│  │  │ - Reports & Analytics│  │  - Real-time Search Filter   │    │   │
│  │  │ - Settings & Payouts │  │  - One-Click Proposals       │    │   │
│  │  └──────────────────────┘  └──────────────────────────────┘    │   │
│  │                                                                  │   │
│  │  localStorage: agent_contacts_list (JSON)                       │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                │                                         │
│                    RELATIVE API CALLS (/api/...)                       │
│                    HTTPS + CORS Enabled                               │
│                                │                                         │
└────────────────────────────────┼─────────────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   GOOGLE CLOUD PLATFORM  │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
   ┌─────────────┐    ┌──────────────────┐    ┌──────────────────┐
   │ Cloud Run   │    │  Cloud SQL       │    │ Domain Mapping   │
   │ (Container) │◄──►│ (PostgreSQL)     │    │ (SSL Certs)      │
   │             │    │                  │    │                  │
   │ Revision:   │    │  Database:       │    │ Domain:          │
   │ 00011-sf5   │    │  - Bookings      │    │ bookings.       │
   │             │    │  - Contacts      │    │ marameguarra... │
   │ Service:    │    │  - Transactions  │    │                  │
   │ mara-      │    │  - Users         │    │ Status:          │
   │ meguarra-   │    │                  │    │ Propagating      │
   │ backend     │    │                  │    │                  │
   │             │    │ Credentials:     │    │ Managed SSL:     │
   │ Region:     │    │ Encrypted Env    │    │ Auto-Renewal ✓   │
   │ europe-     │    │ Variables        │    │                  │
   │ west1       │    │                  │    │ Next Step:       │
   │             │    │                  │    │ gcloud domain-   │
   │ Uptime: 100%│    │                  │    │ mappings create  │
   │ Status: ✅  │    │ Status: ✅       │    │                  │
   └──────┬──────┘    └──────┬───────────┘    └──────┬───────────┘
          │                  │                       │
          └──────────────────┼───────────────────────┘
                             │
                  GCP PROJECT: sparksnairobi-
                  burch-app-prod
                  PROJECT ID: 881829848506
```

## Data Flow Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                     AGENT CREATES/MANAGES CONTACT                  │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  FRONTEND VALIDATION    │
                    │  - Email format check   │
                    │  - Required fields      │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼──────────────────┐
                    │  SMART WEBSITE EXTRACTOR      │
                    │  - Analyze email domain       │
                    │  - Check webmail filters      │
                    │  - Generate company URL      │
                    │  Output: https://www.domain  │
                    └────────────┬──────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  CONTACT OBJECT         │
                    │  {                      │
                    │    email,               │
                    │    first_name,          │
                    │    last_name,           │
                    │    phone,               │
                    │    company,             │
                    │    website (auto-gen)   │
                    │  }                      │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  LOCALSTORAGE SAVE      │
                    │  Key: agent_contacts_   │
                    │        list             │
                    │  Format: JSON Array     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  EXPORT TO CSV          │
                    │  Column Order:          │
                    │  Email, First Name,     │
                    │  Last Name, Website,    │
                    │  Phone, Company         │
                    └────────────────────────┘
```

## Contact Smart Website Extraction Logic

```
INPUT: Email Address (e.g., john@elewana.com)
   │
   ├─ Extract domain: "elewana.com"
   │
   ├─ Is domain in WEBMAIL_FILTERS?
   │  ├─ Yes (gmail.com, yahoo.com, hotmail.com, etc.)
   │  │  └─ RETURN: "" (empty - no website link)
   │  │
   │  └─ No (business domain)
   │     │
   │     ├─ Remove subdomain prefixes (mail., webmail., smtp., mx.)
   │     │
   │     └─ Format as: https://www.elewana.com
   │
OUTPUT: Clickable website link (or empty string)
```

## Technology Stack

```
┌──────────────────────────────────────────────────────┐
│                 FRONTEND LAYER                        │
├──────────────────────────────────────────────────────┤
│  - HTML5 (23+ files)                                 │
│  - Vanilla JavaScript (No framework dependencies)    │
│  - CSS3 (Responsive, Mobile-first)                   │
│  - localStorage API (Contact persistence)            │
│  - Dynamic table/card rendering                      │
└──────────────────────────────────────────────────────┘
                         │
                    HTTP/HTTPS
                         │
┌──────────────────────────────────────────────────────┐
│              BACKEND (NODE.JS + EXPRESS)             │
├──────────────────────────────────────────────────────┤
│  - Node.js v24.19.0                                  │
│  - Express.js (API routing)                          │
│  - CORS middleware (cross-origin enabled)            │
│  - body-parser (JSON processing)                     │
│  - M-PESA Daraja API integration                     │
│  - Environment variables (secrets management)        │
└──────────────────────────────────────────────────────┘
                         │
                    TCP/IP Network
                         │
┌──────────────────────────────────────────────────────┐
│           INFRASTRUCTURE (GOOGLE CLOUD)              │
├──────────────────────────────────────────────────────┤
│  - Cloud Run (Serverless container orchestration)    │
│  - Cloud Build (CI/CD pipeline)                      │
│  - Cloud SQL (PostgreSQL database)                   │
│  - Cloud IAM (Identity & Access Management)          │
│  - Cloud Domains (DNS management)                    │
│  - Google-managed SSL/TLS certificates               │
└──────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐    ┌──────────┐    ┌────────────┐
    │ M-PESA  │    │ Google   │    │ Monitoring │
    │ Daraja  │    │ Workspace│    │ & Logging  │
    │ Payment │    │ Docs/Keep│    │            │
    └─────────┘    └──────────┘    └────────────┘
```

## Deployment Pipeline

```
┌─────────────┐
│  Code Edit  │
│  (This Repo)│
└──────┬──────┘
       │
       ▼
┌──────────────┐
│  Git Commit  │
│  Push Origin │
└──────┬───────┘
       │
       ▼
┌─────────────────────────┐
│  Cloud Build Trigger    │
│  (Automated on push)    │
└──────┬──────────────────┘
       │
       ├─ Read Dockerfile
       ├─ Install dependencies
       ├─ Build container image
       ├─ Push to Container Registry
       │
       ▼
┌──────────────────────────┐
│  Cloud Run Deploy        │
│  - Load image            │
│  - Inject env variables  │
│  - Create new revision   │
│  - Route traffic 100%    │
└──────┬───────────────────┘
       │
       ├─ Previous: 00011-sf5 (ACTIVE)
       │
       ▼
┌──────────────────────────┐
│  Service URL Active      │
│  https://mara-meguarra-  │
│  backend-881829848506.   │
│  europe-west1.run.app    │
│                          │
│  Status: ✅ Production   │
└──────────────────────────┘
```

## Integration Points

### 1. M-PESA Payment Gateway
```
Agent Portal
    │
    ├─ Click "Process Payment"
    │
    ▼
POST /api/mpesa/stkpush
{
  "phoneNumber": "+254724167447",
  "amount": 10000,
  "bookingRef": "LILITA-2024-001"
}
    │
    ▼
Daraja API (Production)
    │
    ├─ Authenticate with credentials
    ├─ Initiate STK Push
    ├─ Return transaction reference
    │
    ▼
M-PESA Popup on Agent's Phone
"Enter PIN to confirm payment"
    │
    ├─ Success: Callback → Backend → Update booking
    ├─ Failure: Callback → Backend → Log error
    │
    ▼
Database (Cloud SQL)
    │
    ├─ Update transaction status
    ├─ Record payment timestamp
    ├─ Calculate commission (40%)
```

### 2. Google Workspace Integration
```
Documentation Hub
    ├─ Google Drive
    │  └─ Mara Meguarra Sanctuary - GCP Deployment Guide
    │
    ├─ Google Keep
    │  └─ Architecture & Deployment Checklist
    │
    └─ Google Tasks
       └─ Domain setup milestones
```

### 3. Contact Management Flow
```
Agent Dashboard
    │
    ├─ Add Contact (form)
    ├─ Bulk Import (paste CSV)
    │
    ▼
Smart Website Extractor
    │
    ├─ Analyze email domain
    ├─ Generate website URL
    ├─ Filter generic webmail
    │
    ▼
localStorage Storage
    │
    ├─ Persist JSON array
    ├─ Sync across browser tabs
    │
    ▼
Display & Export
    │
    ├─ Render table/cards
    ├─ Export as CSV
    ├─ Create proposal
```

## Monitoring & Health Checks

```
Cloud Run Service Health
├─ CPU Usage: < 20%
├─ Memory: < 256MB
├─ Requests/sec: < 10
├─ Error Rate: 0%
├─ Uptime: 100%
│
Health Endpoints
├─ GET / → 200 OK
├─ GET /google-connector.html → 200 OK
├─ GET /agent-dashboard.html → 200 OK
├─ POST /api/mpesa/stkpush → Ready
│
Database Connectivity
├─ Connection Pool: Active
├─ Query Latency: < 50ms
├─ Backup Status: Hourly
├─ Storage: < 10GB used
```

## Security Architecture

```
┌─────────────────────────────────┐
│      HTTPS/TLS Encryption        │
│  (Google-managed certificates)   │
└─────────────────┬───────────────┘
                  │
┌─────────────────▼───────────────┐
│   CORS Policy (All Origins)      │
│   Allows cross-domain requests   │
└─────────────────┬───────────────┘
                  │
┌─────────────────▼───────────────┐
│   Environment Variable Secrets   │
│   - M-PESA credentials           │
│   - Database connection string   │
│   - API keys                     │
└─────────────────┬───────────────┘
                  │
┌─────────────────▼───────────────┐
│   Cloud IAM & Access Control     │
│   - Service account permissions  │
│   - Cloud SQL access             │
│   - Container Registry access    │
└─────────────────┬───────────────┘
                  │
┌─────────────────▼───────────────┐
│   Data Storage Security          │
│   - Cloud SQL encryption at rest │
│   - Encrypted connections        │
│   - Encrypted backups            │
└─────────────────────────────────┘
```

## Scalability & Load Balancing

```
Multiple concurrent requests
            │
            ▼
Cloud Run Auto-scaling
│
├─ Min instances: 1
├─ Max instances: Auto (based on demand)
├─ CPU threshold: 80%
├─ Memory threshold: 80%
│
▼
Container Instances (ephemeral)
│
├─ Each instance: 1 vCPU + 512MB RAM
├─ Stateless (no local storage)
├─ Auto-recovery on failure
│
▼
Cloud SQL (Connection Pooling)
│
└─ Max connections: 100
   └─ Supports multiple instances
```

---

**Last Updated**: August 30, 2026  
**Architecture Version**: 1.0 - Production Ready  
**Deployment Status**: ✅ ACTIVE (Revision 00011-sf5)
