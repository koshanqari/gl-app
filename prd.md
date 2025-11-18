
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

---

# Modules
We will be starting with the MVP (Executive and Member Panel)
- Partner Management
- Event Management for each partner
- Registrations & Profile Management of members for each event
- Venue Management for each event
- Itinerary/Activity Management for each event

---

# Executive Panel (/executive)

## Authentication Flow
- Route: `/executive/login`
- User enters email: `mailtoqari@gmail.com`
- User enters OTP: `7274` (secret admin OTP)
- On successful login → Redirect to Partner Management

### Data Model: Executives

| Field       | Type      | Constraints       | Notes                              |
|-------------|-----------|-------------------|------------------------------------|
| id          | UUID      | PK                | Primary Key                        |
| name        | String    | Required          | Executive name                     |
| phone       | String    | Required          | Phone number                       |
| email       | String    | Required, Unique  | Login email                        |
| status      | String    | Required          | For soft delete (active/inactive)  |
| created_at  | Timestamp | Required          | Record creation timestamp          |
| updated_at  | Timestamp | Required          | Record last update timestamp       |

---

## Partner Management
- Route: `/executive/partners`
- Displays list of partners in card view
- Actions: Add Partner, Edit Partner, View Partner Details
- Each partner shows: Company Name, Contact Person, Email, Events Count, Status
- Profile Management - will have option to edit the executives profile (which is used to login)

### Data Model: Partners

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
| pocs          | Array     | Optional          | Array of POC objects (name, phone, email, designation) |
| status        | String    | Required          | For soft delete (active/inactive)               |
| created_at    | Timestamp | Required          | Record creation timestamp                       |
| updated_at    | Timestamp | Required          | Record last update timestamp                    |

---

## Partner Details
- Route: `/executive/partners/[id]`
- Displays partner profile details
- Allows editing of partner information
- Shows list of events associated with this partner
- Option to edit the Partner details (partners/[id])

---

## Event Management
- Route: `/executive/partners/[id]/events`
- Displays list of events in card view for the selected partner
- Actions: Add Event, Edit Event, View Event Details
- Each event shows: Event Name, Date, Status, Registration Count

### Data Model: Events

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

---

## Event Details
- Route: `/executive/partners/[id]/events/[id]`
- Displays event profile details
- Allows editing of event information
- Tabs/Sections for: Registration Management, Venue Management, Itinerary Management (for now put comming soon there only)
