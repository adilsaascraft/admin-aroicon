// locationData.ts

export type Option = { value: string; label: string };

// ----------------- Countries -----------------
export const countries: Option[] = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "UAE", label: "United Arab Emirates" },
];

// ----------------- States -----------------
export const states: Record<string, Option[]> = {
  IN: [
  // States
  { value: "AP", label: "Andhra Pradesh" },
  { value: "AR", label: "Arunachal Pradesh" },
  { value: "AS", label: "Assam" },
  { value: "BR", label: "Bihar" },
  { value: "CT", label: "Chhattisgarh" },
  { value: "GA", label: "Goa" },
  { value: "GJ", label: "Gujarat" },
  { value: "HR", label: "Haryana" },
  { value: "HP", label: "Himachal Pradesh" },
  { value: "JH", label: "Jharkhand" },
  { value: "KA", label: "Karnataka" },
  { value: "KL", label: "Kerala" },
  { value: "MP", label: "Madhya Pradesh" },
  { value: "MH", label: "Maharashtra" },
  { value: "MN", label: "Manipur" },
  { value: "ML", label: "Meghalaya" },
  { value: "MZ", label: "Mizoram" },
  { value: "NL", label: "Nagaland" },
  { value: "OD", label: "Odisha" },
  { value: "PB", label: "Punjab" },
  { value: "RJ", label: "Rajasthan" },
  { value: "SK", label: "Sikkim" },
  { value: "TN", label: "Tamil Nadu" },
  { value: "TG", label: "Telangana" },
  { value: "TR", label: "Tripura" },
  { value: "UP", label: "Uttar Pradesh" },
  { value: "UK", label: "Uttarakhand" },
  { value: "WB", label: "West Bengal" },

  // Union Territories
  { value: "AN", label: "Andaman and Nicobar Islands" },
  { value: "CH", label: "Chandigarh" },
  { value: "DN", label: "Dadra and Nagar Haveli and Daman and Diu" },
  { value: "DL", label: "Delhi" },
  { value: "JK", label: "Jammu and Kashmir" },
  { value: "LA", label: "Ladakh" },
  { value: "LD", label: "Lakshadweep" },
  { value: "PY", label: "Puducherry" }
],

  US: [
    { value: "CA", label: "California" },
    { value: "TX", label: "Texas" },
    { value: "FL", label: "Florida" },
    { value: "NY", label: "New York" },
    { value: "PA", label: "Pennsylvania" }
  ],

  UK: [
    { value: "ENG", label: "England" },
    { value: "SCT", label: "Scotland" },
    { value: "WLS", label: "Wales" },
    { value: "NIR", label: "Northern Ireland" },
    { value: "LDN", label: "Greater London" }
  ],

  CA: [
    { value: "ON", label: "Ontario" },
    { value: "QC", label: "Quebec" },
    { value: "BC", label: "British Columbia" },
    { value: "AB", label: "Alberta" },
    { value: "MB", label: "Manitoba" }
  ],

  UAE: [
    { value: "DU", label: "Dubai" },
    { value: "AUH", label: "Abu Dhabi" },
    { value: "SHJ", label: "Sharjah" },
    { value: "AJM", label: "Ajman" },
    { value: "RAK", label: "Ras Al Khaimah" }
  ]
};

// ----------------- Cities -----------------
export const cities: Record<string, string[]> = {
  // India
  AP: ["Visakhapatnam", "Vijayawada", "Tirupati", "Guntur", "Nellore"],
  AR: ["Itanagar", "Tawang", "Ziro", "Pasighat", "Bomdila"],
  AS: ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur"],
  BR: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"],
  CT: ["Raipur", "Bilaspur", "Durg", "Korba", "Rajnandgaon"],
  GA: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  GJ: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  HR: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar"],
  HP: ["Shimla", "Manali", "Dharamshala", "Solan", "Mandi"],
  JH: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
  KA: ["Bengaluru", "Mysuru", "Mangaluru", "Hubli", "Belagavi"],
  KL: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Alappuzha"],
  MP: ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
  MH: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
  MN: ["Imphal", "Thoubal", "Kakching", "Churachandpur", "Bishnupur"],
  ML: ["Shillong", "Tura", "Nongstoin", "Baghmara", "Jowai"],
  MZ: ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"],
  NL: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
  OD: ["Bhubaneswar", "Cuttack", "Puri", "Rourkela", "Sambalpur"],
  PB: ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Mohali"],
  RJ: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
  SK: ["Gangtok", "Namchi", "Geyzing", "Mangan", "Rangpo"],
  TN: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  TG: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  TR: ["Agartala", "Dharmanagar", "Udaipur", "Kailashahar", "Belonia"],
  UP: ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj"],
  UK: ["Dehradun", "Haridwar", "Nainital", "Rishikesh", "Haldwani"],
  WB: ["Kolkata", "Howrah", "Asansol", "Durgapur", "Siliguri"],

  // Union Territories
  AN: ["Port Blair"],
  CH: ["Chandigarh"],
  DN: ["Silvassa", "Daman", "Diu"],
  DL: ["Delhi"],
  JK: ["Srinagar", "Jammu"],
  LA: ["Leh", "Kargil"],
  LD: ["Kavaratti"],
  PY: ["Puducherry", "Karaikal", "Yanam", "Mahe"],

  // USA
  CA: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento"],
  TX: ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"],
  FL: ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee"],
  NY: ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse"],
  PA: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Harrisburg"],

  // UK
  ENG: ["London", "Manchester", "Birmingham", "Liverpool", "Leeds"],
  SCT: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness"],
  WLS: ["Cardiff", "Swansea", "Newport", "Wrexham", "Bangor"],
  NIR: ["Belfast", "Derry", "Lisburn", "Newry", "Armagh"],
  LDN: ["Camden", "Croydon", "Westminster", "Hackney", "Kensington"],

  // Canada

  ON: ["Toronto", "Ottawa", "Mississauga", "Hamilton", "London"],
  QC: ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil"],
  BC: ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond"],
  AB: ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert"],
  MB: ["Winnipeg", "Brandon", "Steinbach", "Thompson", "Portage la Prairie"],

  DU: ["Dubai", "Jebel Ali", "Hatta", "Al Awir", "Nad Al Sheba"],
  AUH: ["Abu Dhabi", "Al Ain", "Madinat Zayed", "Ruwais", "Ghayathi"],
  SHJ: ["Sharjah", "Khor Fakkan", "Kalba", "Dibba Al-Hisn", "Al Dhaid"],
  AJM: ["Ajman", "Manama", "Masfout", "Al Jurf", "Al Nuaimiya"],
  RAK: ["Ras Al Khaimah", "Al Rams", "Khatt", "Digdaga", "Sha’am"],

};
