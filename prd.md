
# App Overview 
We are making a MICE & Corporate Event Management App for GoldenLotus Company which will be called "GoldenLotusApp".
This will be a complete professional App
---

# Userbase
- **Executive**: The golden lotus team themselves
- **Partner**: The clients or companies whose event will be handled by GoldenLotus
- **Member**: The Employees or members of the Partners (corporates)
- **Vendor**: The vendors e.g hotels etc

---

# Development Approach
- Frontend-first development
- Backend integration after frontend completion
- Frontend built to be pluggable with backend 
- For building Front end use Mock data
- Executive Panel then Member Panel and then Partner Panel

---

# Tech Stack
- Nextjs 15 (Front and Backend)
- React 18
- Tailwind 3
- Shadcn/ui (Design System)

---

# Authentication
- Email-based OTP via Brevo
- Special OTP: 7274 (admin access only)
- Professional loading screen with security animations (4 seconds)
- Features: Shield, Lock, Zap icons showing security steps
- Intellsys.ai branding with animated elements

---

# Modules (MVP - Executive Panel)
Currently building the Executive Panel with:
- Partner Management (Add, Edit, View partners)
- Event Management (Add, Edit, View events per partner)
- Members Management (Registration, CSV upload/download, profile management)
- Executive Profile Management
- Partner Profile Management
- Event Profile Management

---

# Application Architecture

## Main User Panels

The application has **4 main user panels**, each for different user types:

1. **Executive Panel** (`/executive`) - For GoldenLotus team (internal)
2. **Partner Panel** (`/partner`) - For client companies/partners
3. **Member Panel** (`/member`) - For employees/attendees of events
4. **Vendor Panel** (`/vendor`) - For hotels, caterers, transportation providers, etc.

---

## Executive Panel Structure

The **Executive Panel** contains **3 independent portals** for managing different aspects:

1. **Executive Portal** (`/executive/executive_portal`) - Manage partners and executive profile
2. **Partner Portal** (`/executive/partner_portal/[id]`) - Manage specific partner's events
3. **Event Portal** (`/executive/event_portal/[eventId]`) - Manage specific event details

Each portal operates independently with its own sidebar navigation and authentication checks.

---

# Executive Panel (Current Development Focus)

## 1. Login
**Route:** `/executive/login`

**Authentication Flow:**
- User enters email: `mailtoqari@gmail.com`
- User enters OTP: `7274` (secret admin OTP)
- On successful login → Professional loading animation (4 seconds) → Redirect to Executive Portal

**Data Model: Executives**

| Field       | Type      | Constraints       | Notes                              |
|-------------|-----------|-------------------|------------------------------------|
| id          | UUID      | PK                | Primary Key                        |
| name        | String    | Required          | Executive name                     |
| phone       | String    | Required          | Phone number (10 digits)           |
| email       | String    | Required, Unique  | Login email                        |
| status      | String    | Required          | For soft delete (active/inactive)  |
| created_at  | Timestamp | Required          | Record creation timestamp          |
| updated_at  | Timestamp | Required          | Record last update timestamp       |

---

## 2. Executive Portal
**Route Base:** `/executive/executive_portal`

Independent portal for managing partners and executive profile.

**Sidebar Navigation:**
- Partner Management
- Executive Profile

### 2.1 Partner Management
**Route:** `/executive/executive_portal/partners`

**Features:**
- Displays list of partners in card view with search functionality
- Actions: Add Partner, Edit Partner, View Partner Details
- Each partner card shows: Company Name, Logo, Primary POC, Industry, Status
- Clicking on partner card → Opens Partner Portal

**Data Model: Partners**

| Field         | Type      | Constraints       | Notes                                           |
|---------------|-----------|-------------------|-------------------------------------------------|
| id            | UUID      | PK                | Primary Key                                     |
| company_name  | String    | Required          | Company name                                    |
| address_lane  | String    | Optional          | Street address                                  |
| city          | String    | Optional          | City                                            |
| state         | String    | Optional          | State/Province                                  |
| country       | String    | Optional          | Country                                         |
| pincode       | String    | Optional          | Postal/ZIP code                                 |
| industry_type | String    | Optional          | Industry category                               |
| company_size  | String    | Optional          | Small/Medium/Large/Enterprise                   |
| logo_url      | String    | Optional          | Company logo URL                                |
| website       | String    | Optional          | Company website                                 |
| pocs          | Array     | Optional          | Array of POC objects (name, phone-10 digits, email, designation, isPrimary). Multiple POCs, one must be primary. |
| status        | String    | Required          | For soft delete (active/inactive)               |
| created_at    | Timestamp | Required          | Record creation timestamp                       |
| updated_at    | Timestamp | Required          | Record last update timestamp                    |

### 2.2 Executive Profile
**Route:** `/executive/executive_portal/profile`

**Features:**
- Edit executive profile details (name, email, phone)
- Phone numbers standardized to 10 digits
- Save changes functionality

---

## 3. Partner Portal
**Route Base:** `/executive/partner_portal/[id]`

Independent portal for managing a specific partner's information and events.

**Sidebar Navigation:**
- Event Management
- Partner Profile

### 3.1 Event Management
**Route:** `/executive/partner_portal/[id]/events`

**Features:**
- Displays list of events in card view for the selected partner
- Actions: Add Event, Edit Event, View Event Details
- Each event card shows: Event Name, Logo, Date Range, Type, Status
- Clicking on event card → Opens Event Portal
- Search functionality to filter events

**Data Model: Events**

| Field              | Type      | Constraints       | Notes                                        |
|--------------------|-----------|-------------------|----------------------------------------------|
| id                 | UUID      | PK                | Primary Key                                  |
| partner_id         | UUID      | FK, Required      | Foreign Key to Partners table                |
| event_name         | String    | Required          | Name of the event                            |
| event_type         | String    | Optional          | Conference/Meeting/Exhibition/Incentive      |
| description        | String    | Optional          | Event description                            |
| logo_url           | String    | Optional          | Event logo/banner URL                        |
| start_date         | Date      | Required          | Event start date                             |
| end_date           | Date      | Required          | Event end date                               |
| status             | String    | Required          | Draft/Active/Completed/Cancelled             |
| created_at         | Timestamp | Required          | Record creation timestamp                    |
| updated_at         | Timestamp | Required          | Record last update timestamp                 |

### 3.2 Partner Profile
**Route:** `/executive/partner_portal/[id]/profile`

**Features:**
- Full editable form for partner details
- Sections:
  - Company Information (Name, Industry, Size, Website, Logo)
  - Address (Street, City, State, Country, Pincode)
  - Points of Contact (Multiple POCs with add/remove functionality)
  - Each POC: Name, Phone (10 digits), Email, Designation
  - Primary POC selection (radio buttons)
- Save changes functionality
- References Partners data model (defined in Executive Portal section)

---

## 4. Event Portal
**Route Base:** `/executive/event_portal/[eventId]`

Independent portal for managing a specific event's details and operations.

**Sidebar Navigation:**
- Overview (Coming Soon)
- Members
- Crew (Coming Soon)
- Stay (Coming Soon)
- Itinerary (Coming Soon)
- Travel (Coming Soon)
- Meals (Coming Soon)
- Event Profile

### 4.1 Overview (Coming Soon)
**Route:** `/executive/event_portal/[eventId]/overview`

**Planned Features:**
- Event statistics dashboard
- Quick actions panel
- Key metrics and analytics

---

### 4.2 Members Management (Fully Functional)
**Route:** `/executive/event_portal/[eventId]/members`

Complete registration and member management system.

**Features:**
- **Add Member**: Employee ID, Name, Email, Phone (10 digits)
- **Member List Table**: Display all members in rows
- **Search**: Filter members by name, email, or employee ID
- **Edit Member**: Click any row to open edit dialog
- **CSV Operations**:
  - Download Template: Pre-formatted CSV template
  - Upload Data: Bulk import members via CSV
- **Registration Link**: Generate and copy registration link for members

**Data Model: Members**

| Field       | Type      | Constraints  | Notes                              |
|-------------|-----------|--------------|-------------------------------------|
| id          | UUID      | PK           | Primary Key                         |
| event_id    | UUID      | FK, Required | Foreign Key to Events table         |
| employee_id | String    | Required     | Employee/Member ID                  |
| name        | String    | Required     | Member name                         |
| email       | String    | Required     | Member email                        |
| phone       | String    | Required     | Phone number (10 digits)            |
| status      | String    | Required     | active/inactive (soft delete)       |
| created_at  | Timestamp | Required     | Record creation timestamp           |
| updated_at  | Timestamp | Required     | Record last update timestamp        |

---

### 4.3 Crew (Coming Soon)
**Route:** `/executive/event_portal/[eventId]/crew`

**Planned Features:**
- Event crew and staff management
- Role assignments
- Team coordination

---

### 4.4 Stay (Coming Soon - Next to Implement)
**Route:** `/executive/event_portal/[eventId]/stay`

**Planned Features:**
- Accommodation and hotel management
- Room assignments
- Hotel booking coordination

---

### 4.5 Itinerary (Coming Soon)
**Route:** `/executive/event_portal/[eventId]/itinerary`

**Planned Features:**
- Event schedules and activities
- Timeline management
- Activity coordination

---

### 4.6 Travel (Coming Soon)
**Route:** `/executive/event_portal/[eventId]/travel`

**Planned Features:**
- Flight and transportation management
- Travel bookings
- Logistics coordination

---

### 4.7 Meals (Coming Soon)
**Route:** `/executive/event_portal/[eventId]/meals`

**Planned Features:**
- Meal preferences and catering
- Dietary requirements
- Catering schedules

---

### 4.8 Event Profile
**Route:** `/executive/event_portal/[eventId]/profile`

**Features:**
- Edit event details
- Fields: Event Name, Event Type, Description, Logo URL, Start Date, End Date
- Displays associated partner information (read-only)
- Save changes functionality
- References the Events data model (defined in Partner Portal - Event Management section)

---

## Additional Notes

### Phone Number Standardization
- All phone numbers across the application are standardized to 10 digits
- Applied to: Executives, Partner POCs, Members
- Input fields have maxLength validation and placeholder guidance

### Soft Delete Pattern
- All entities use `status` field for soft delete
- Active records: `status = "active"`
- Deleted records: `status = "inactive"`
- Inactive records are filtered from UI but retained in database

### Primary POC Logic
- Each partner must have at least one POC
- Exactly one POC must be marked as primary (`isPrimary = true`)
- Primary POC is displayed prominently on partner cards
- Can change primary POC selection via radio buttons

---

## Current Implementation Status

✅ **Completed:**
- Authentication with loading animation
- Executive Portal (Partner Management, Executive Profile)
- Partner Portal (Event Management, Partner Profile)
- Event Portal (Members Management, Event Profile)
- Multiple POCs with primary selection
- Phone number standardization (10 digits)
- Search functionality
- Soft delete implementation
- CSV upload/download for members
- Registration link generation

🚧 **In Progress:**
- Stay Management (Next feature to implement)

📋 **Planned:**
- Crew Management
- Itinerary Management
- Travel Management
- Meals Management
- Member Portal (for members to view their information)
- Vendor Management
