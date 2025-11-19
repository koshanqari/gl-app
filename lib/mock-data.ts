export const mockExecutive = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Admin",
  phone: "1234567890",
  email: "mailtoqari@gmail.com",
  status: "active",
  created_at: new Date("2024-01-01").toISOString(),
  updated_at: new Date("2024-01-01").toISOString(),
};

export const mockPartners = [
  {
    id: "partner-1",
    company_name: "Tech Innovations Inc",
    address_lane: "123 Silicon Valley Blvd",
    city: "San Francisco",
    state: "California",
    country: "USA",
    pincode: "94105",
    industry_type: "Technology",
    company_size: "Enterprise",
    logo_url: "",
    website: "https://techinnovations.com",
    pocs: [
      {
        name: "John Doe",
        phone: "4155550100",
        email: "john.doe@techinnovations.com",
        designation: "Event Manager",
        isPrimary: true,
      },
      {
        name: "Jane Smith",
        phone: "4155550101",
        email: "jane.smith@techinnovations.com",
        designation: "HR Director",
        isPrimary: false,
      },
    ],
    status: "active",
    created_at: new Date("2024-01-15").toISOString(),
    updated_at: new Date("2024-01-15").toISOString(),
  },
  {
    id: "partner-2",
    company_name: "Global Finance Corp",
    address_lane: "456 Wall Street",
    city: "New York",
    state: "New York",
    country: "USA",
    pincode: "10005",
    industry_type: "Finance",
    company_size: "Large",
    logo_url: "",
    website: "https://globalfinance.com",
    pocs: [
      {
        name: "Michael Chen",
        phone: "2125550200",
        email: "m.chen@globalfinance.com",
        designation: "Corporate Events Lead",
        isPrimary: true,
      },
    ],
    status: "active",
    created_at: new Date("2024-02-01").toISOString(),
    updated_at: new Date("2024-02-01").toISOString(),
  },
  {
    id: "partner-3",
    company_name: "Healthcare Solutions Ltd",
    address_lane: "789 Medical Center Dr",
    city: "Boston",
    state: "Massachusetts",
    country: "USA",
    pincode: "02115",
    industry_type: "Healthcare",
    company_size: "Medium",
    logo_url: "",
    website: "https://healthcaresolutions.com",
    pocs: [
      {
        name: "Sarah Johnson",
        phone: "6175550300",
        email: "s.johnson@healthcaresolutions.com",
        designation: "Conference Coordinator",
        isPrimary: true,
      },
    ],
    status: "active",
    created_at: new Date("2024-02-15").toISOString(),
    updated_at: new Date("2024-02-15").toISOString(),
  },
  {
    id: "partner-4",
    company_name: "Eco Energy Group",
    address_lane: "321 Green Park Lane",
    city: "Seattle",
    state: "Washington",
    country: "USA",
    pincode: "98101",
    industry_type: "Energy",
    company_size: "Medium",
    logo_url: "",
    website: "https://ecoenergy.com",
    pocs: [
      {
        name: "David Park",
        phone: "2065550400",
        email: "d.park@ecoenergy.com",
        designation: "Events Manager",
        isPrimary: true,
      },
    ],
    status: "active",
    created_at: new Date("2024-03-01").toISOString(),
    updated_at: new Date("2024-03-01").toISOString(),
  },
  {
    id: "partner-5",
    company_name: "Retail Masters International",
    address_lane: "555 Commerce Plaza",
    city: "Chicago",
    state: "Illinois",
    country: "USA",
    pincode: "60601",
    industry_type: "Retail",
    company_size: "Enterprise",
    logo_url: "",
    website: "https://retailmasters.com",
    pocs: [
      {
        name: "Emily Rodriguez",
        phone: "3125550500",
        email: "e.rodriguez@retailmasters.com",
        designation: "Corporate Relations",
        isPrimary: true,
      },
      {
        name: "James Wilson",
        phone: "3125550501",
        email: "j.wilson@retailmasters.com",
        designation: "Event Planner",
        isPrimary: false,
      },
    ],
    status: "active",
    created_at: new Date("2024-03-10").toISOString(),
    updated_at: new Date("2024-03-10").toISOString(),
  },
];

export const mockEvents = [
  // Partner 1 events
  {
    id: "event-1",
    partner_id: "partner-1",
    event_name: "Annual Tech Summit 2024",
    event_type: "Conference",
    description: "A flagship technology conference bringing together industry leaders and innovators.",
    logo_url: "",
    start_date: "2024-06-15",
    end_date: "2024-06-17",
    status: "active",
    created_at: new Date("2024-01-20").toISOString(),
    updated_at: new Date("2024-01-20").toISOString(),
  },
  {
    id: "event-2",
    partner_id: "partner-1",
    event_name: "Product Launch Gala",
    event_type: "Corporate Event",
    description: "Exclusive product launch event for major stakeholders and media.",
    logo_url: "",
    start_date: "2024-05-10",
    end_date: "2024-05-10",
    status: "active",
    created_at: new Date("2024-01-25").toISOString(),
    updated_at: new Date("2024-01-25").toISOString(),
  },
  {
    id: "event-3",
    partner_id: "partner-1",
    event_name: "Q2 Team Building Retreat",
    event_type: "Incentive",
    description: "Team building activities and workshops for department heads.",
    logo_url: "",
    start_date: "2024-04-20",
    end_date: "2024-04-22",
    status: "active",
    created_at: new Date("2024-02-01").toISOString(),
    updated_at: new Date("2024-02-01").toISOString(),
  },
  // Partner 2 events
  {
    id: "event-4",
    partner_id: "partner-2",
    event_name: "Global Finance Forum",
    event_type: "Conference",
    description: "International forum discussing global financial trends and opportunities.",
    logo_url: "",
    start_date: "2024-07-10",
    end_date: "2024-07-12",
    status: "active",
    created_at: new Date("2024-02-05").toISOString(),
    updated_at: new Date("2024-02-05").toISOString(),
  },
  {
    id: "event-5",
    partner_id: "partner-2",
    event_name: "Investment Summit",
    event_type: "Meeting",
    description: "Strategic investment planning meeting with key stakeholders.",
    logo_url: "",
    start_date: "2024-05-25",
    end_date: "2024-05-26",
    status: "active",
    created_at: new Date("2024-02-10").toISOString(),
    updated_at: new Date("2024-02-10").toISOString(),
  },
  {
    id: "event-6",
    partner_id: "partner-2",
    event_name: "Quarterly Board Meeting",
    event_type: "Meeting",
    description: "Regular board meeting to discuss Q1 results and Q2 strategy.",
    logo_url: "",
    start_date: "2024-04-15",
    end_date: "2024-04-15",
    status: "active",
    created_at: new Date("2024-02-15").toISOString(),
    updated_at: new Date("2024-02-15").toISOString(),
  },
  {
    id: "event-7",
    partner_id: "partner-2",
    event_name: "Client Appreciation Dinner",
    event_type: "Corporate Event",
    description: "Exclusive dinner event for top-tier clients and partners.",
    logo_url: "",
    start_date: "2024-06-05",
    end_date: "2024-06-05",
    status: "active",
    created_at: new Date("2024-02-20").toISOString(),
    updated_at: new Date("2024-02-20").toISOString(),
  },
  {
    id: "event-8",
    partner_id: "partner-2",
    event_name: "Financial Literacy Workshop",
    event_type: "Exhibition",
    description: "Educational workshop series for community engagement.",
    logo_url: "",
    start_date: "2024-08-20",
    end_date: "2024-08-21",
    status: "active",
    created_at: new Date("2024-02-25").toISOString(),
    updated_at: new Date("2024-02-25").toISOString(),
  },
  // Partner 3 events
  {
    id: "event-9",
    partner_id: "partner-3",
    event_name: "Healthcare Innovation Conference",
    event_type: "Conference",
    description: "Annual conference showcasing latest healthcare technologies and solutions.",
    logo_url: "",
    start_date: "2024-09-10",
    end_date: "2024-09-12",
    status: "active",
    created_at: new Date("2024-03-01").toISOString(),
    updated_at: new Date("2024-03-01").toISOString(),
  },
  {
    id: "event-10",
    partner_id: "partner-3",
    event_name: "Medical Staff Training",
    event_type: "Meeting",
    description: "Comprehensive training program for medical staff on new protocols.",
    logo_url: "",
    start_date: "2024-05-15",
    end_date: "2024-05-17",
    status: "active",
    created_at: new Date("2024-03-05").toISOString(),
    updated_at: new Date("2024-03-05").toISOString(),
  },
  // Partner 4 events
  {
    id: "event-11",
    partner_id: "partner-4",
    event_name: "Sustainability Expo 2024",
    event_type: "Exhibition",
    description: "Exhibition showcasing eco-friendly energy solutions and innovations.",
    logo_url: "",
    start_date: "2024-10-05",
    end_date: "2024-10-07",
    status: "active",
    created_at: new Date("2024-03-10").toISOString(),
    updated_at: new Date("2024-03-10").toISOString(),
  },
  // Partner 5 events
  {
    id: "event-12",
    partner_id: "partner-5",
    event_name: "Retail Excellence Awards",
    event_type: "Corporate Event",
    description: "Annual awards ceremony recognizing excellence in retail.",
    logo_url: "",
    start_date: "2024-11-20",
    end_date: "2024-11-20",
    status: "active",
    created_at: new Date("2024-03-15").toISOString(),
    updated_at: new Date("2024-03-15").toISOString(),
  },
  {
    id: "event-13",
    partner_id: "partner-5",
    event_name: "Store Managers Conference",
    event_type: "Conference",
    description: "National conference for store managers to share best practices.",
    logo_url: "",
    start_date: "2024-08-15",
    end_date: "2024-08-17",
    status: "active",
    created_at: new Date("2024-03-18").toISOString(),
    updated_at: new Date("2024-03-18").toISOString(),
  },
  {
    id: "event-14",
    partner_id: "partner-5",
    event_name: "Holiday Season Kickoff",
    event_type: "Corporate Event",
    description: "Launch event for holiday season marketing campaign.",
    logo_url: "",
    start_date: "2024-10-25",
    end_date: "2024-10-25",
    status: "active",
    created_at: new Date("2024-03-20").toISOString(),
    updated_at: new Date("2024-03-20").toISOString(),
  },
  {
    id: "event-15",
    partner_id: "partner-5",
    event_name: "Leadership Development Program",
    event_type: "Incentive",
    description: "Executive leadership training and team building retreat.",
    logo_url: "",
    start_date: "2024-07-20",
    end_date: "2024-07-23",
    status: "active",
    created_at: new Date("2024-03-22").toISOString(),
    updated_at: new Date("2024-03-22").toISOString(),
  },
];

// Helper function to get events by partner ID
export const getEventsByPartnerId = (partnerId: string) => {
  return mockEvents.filter((event) => event.partner_id === partnerId);
};

// Helper function to get event by ID
export const getEventById = (eventId: string) => {
  return mockEvents.find((event) => event.id === eventId);
};

// Helper function to get event with partner details
export const getEventWithPartner = (eventId: string) => {
  const event = getEventById(eventId);
  if (!event) return null;
  
  const partner = mockPartners.find(p => p.id === event.partner_id);
  return {
    ...event,
    partner,
  };
};

export const mockMembers = [
  // Event 1 members
  {
    id: "member-1",
    event_id: "event-1",
    employee_id: "EMP001",
    name: "Alice Johnson",
    email: "alice.johnson@techinnovations.com",
    phone: "4155551001",
    kyc_document_type: "aadhaar",
    kyc_document_number: "1234-5678-9012",
    kyc_document_url: "https://example.com/documents/alice_aadhaar.pdf",
    status: "active",
    created_at: new Date("2024-02-01").toISOString(),
    updated_at: new Date("2024-02-01").toISOString(),
  },
  {
    id: "member-2",
    event_id: "event-1",
    employee_id: "EMP002",
    name: "Bob Smith",
    email: "bob.smith@techinnovations.com",
    phone: "4155551002",
    kyc_document_type: "pan",
    kyc_document_number: "ABCDE1234F",
    kyc_document_url: "https://example.com/documents/bob_pan.pdf",
    status: "active",
    created_at: new Date("2024-02-02").toISOString(),
    updated_at: new Date("2024-02-02").toISOString(),
  },
  {
    id: "member-3",
    event_id: "event-1",
    employee_id: "EMP003",
    name: "Carol Williams",
    email: "carol.williams@techinnovations.com",
    phone: "4155551003",
    status: "active",
    created_at: new Date("2024-02-03").toISOString(),
    updated_at: new Date("2024-02-03").toISOString(),
  },
  // Event 2 members
  {
    id: "member-4",
    event_id: "event-2",
    employee_id: "EMP004",
    name: "David Brown",
    email: "david.brown@techinnovations.com",
    phone: "4155551004",
    kyc_document_type: "passport",
    kyc_document_number: "P12345678",
    kyc_document_url: "https://example.com/documents/david_passport.pdf",
    status: "active",
    created_at: new Date("2024-02-05").toISOString(),
    updated_at: new Date("2024-02-05").toISOString(),
  },
  {
    id: "member-5",
    event_id: "event-2",
    employee_id: "EMP005",
    name: "Eva Martinez",
    email: "eva.martinez@techinnovations.com",
    phone: "4155551005",
    status: "active",
    created_at: new Date("2024-02-06").toISOString(),
    updated_at: new Date("2024-02-06").toISOString(),
  },
];

// Helper function to get members by event ID
export const getMembersByEventId = (eventId: string) => {
  return mockMembers.filter((member) => member.event_id === eventId && member.status === "active");
};

// Hotels mock data (one per event)
export const mockHotels = [
  {
    id: "hotel-1",
    event_id: "event-1",
    hotel_name: "Grand Plaza Hotel",
    address_street: "456 Convention Center Drive",
    city: "San Francisco",
    state: "California",
    country: "USA",
    pincode: "94103",
    maps_link: "https://maps.google.com/?q=Grand+Plaza+Hotel+San+Francisco",
    website: "https://www.grandplazahotel.com",
    pocs: [
      {
        name: "Michael Chen",
        phone: "4155559000",
        email: "reservations@grandplaza.com",
        poc_for: "Reservations & Check-in",
        display_for_members: true,
      },
      {
        name: "Sarah Williams",
        phone: "4155559001",
        email: "events@grandplaza.com",
        poc_for: "Event Coordination",
        display_for_members: false,
      },
    ],
    star_rating: 5,
    image_url: "",
    amenities: ["WiFi", "Swimming Pool", "Gym", "Restaurant", "Bar", "Conference Rooms", "Parking", "Airport Shuttle", "Spa", "Room Service", "24/7 Reception", "Laundry Service"],
    additional_details: "Early check-in available upon request. Complimentary airport shuttle service every hour.",
    created_at: new Date("2024-01-15").toISOString(),
    updated_at: new Date("2024-01-15").toISOString(),
  },
  {
    id: "hotel-2",
    event_id: "event-2",
    hotel_name: "Luxury Business Suites",
    address_street: "789 Market Street",
    city: "San Francisco",
    state: "California",
    country: "USA",
    pincode: "94102",
    maps_link: "https://maps.google.com/?q=Luxury+Business+Suites+San+Francisco",
    website: "https://www.luxurybusinesssuites.com",
    pocs: [
      {
        name: "Sarah Johnson",
        phone: "4155559100",
        email: "contact@luxurysuites.com",
        poc_for: "General Inquiries",
        display_for_members: true,
      },
    ],
    star_rating: 4,
    image_url: "",
    amenities: ["WiFi", "Gym", "Restaurant", "Conference Rooms", "Parking", "Room Service", "24/7 Reception"],
    additional_details: "Business center available 24/7. Flexible check-out times for extended stays.",
    created_at: new Date("2024-03-10").toISOString(),
    updated_at: new Date("2024-03-10").toISOString(),
  },
];

// Room assignments mock data
export const mockRoomAssignments = [
  {
    id: "assignment-1",
    event_id: "event-1",
    member_id: "member-1",
    room_number: "205",
    room_type: "Double",
    check_in_date: "2024-05-14",
    check_out_date: "2024-05-17",
    sharing_with_member_id: "member-2",
    special_requests: "High floor preferred",
    status: "assigned",
    created_at: new Date("2024-02-10").toISOString(),
    updated_at: new Date("2024-02-10").toISOString(),
  },
  {
    id: "assignment-2",
    event_id: "event-1",
    member_id: "member-2",
    room_number: "205",
    room_type: "Double",
    check_in_date: "2024-05-14",
    check_out_date: "2024-05-17",
    sharing_with_member_id: "member-1",
    special_requests: "",
    status: "assigned",
    created_at: new Date("2024-02-10").toISOString(),
    updated_at: new Date("2024-02-10").toISOString(),
  },
  {
    id: "assignment-3",
    event_id: "event-1",
    member_id: "member-3",
    room_number: "308",
    room_type: "Single",
    check_in_date: "2024-05-14",
    check_out_date: "2024-05-17",
    sharing_with_member_id: null,
    special_requests: "Early check-in requested",
    status: "assigned",
    created_at: new Date("2024-02-11").toISOString(),
    updated_at: new Date("2024-02-11").toISOString(),
  },
];

// Helper function to get hotel by event ID
export const getHotelByEventId = (eventId: string) => {
  return mockHotels.find((hotel) => hotel.event_id === eventId) || null;
};

// Helper function to get room assignments by event ID
export const getRoomAssignmentsByEventId = (eventId: string) => {
  return mockRoomAssignments.filter((assignment) => assignment.event_id === eventId && assignment.status === "assigned");
};

// Helper function to get room assignment for a specific member
export const getRoomAssignmentByMemberId = (memberId: string) => {
  return mockRoomAssignments.find((assignment) => assignment.member_id === memberId && assignment.status === "assigned") || null;
};

// Calculate events count for each partner
export const getPartnersWithEventCount = () => {
  return mockPartners.map((partner) => ({
    ...partner,
    events_count: mockEvents.filter((e) => e.partner_id === partner.id).length,
  }));
};

