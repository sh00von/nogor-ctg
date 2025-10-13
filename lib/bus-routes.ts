export interface BusStop {
  id: string;
  name: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface BusRoute {
  id: string;
  name: string;
  nameBn: string;
  number: string;
  stops: BusStop[];
  color: string;
  description?: string;
}

export const busRoutes: BusRoute[] = [
  {
    id: "route-1",
    name: "Route 1",
    nameBn: "রুট নং: ০১",
    number: "1",
    color: "#3B82F6",
    description: "Karnaphuli Bridge to New Market (10 km)",
    stops: [
      { id: "karnaphuli-bridge", name: "Karnaphuli Bridge" },
      { id: "rajakhali", name: "Rajakhali" },
      { id: "kalamia-bazar", name: "Kalamia Bazar" },
      { id: "nahar-cng", name: "Nahar CNG" },
      { id: "ek-kilometer", name: "Ek Kilometer" },
      { id: "bahaddarhat", name: "Bahaddarhat" },
      { id: "kapasgola", name: "Kapasgola" },
      { id: "chawkbazar", name: "Chawkbazar" },
      { id: "sirajuddowla-road", name: "Sirajuddowla Road" },
      { id: "andarkilla", name: "Andarkilla" },
      { id: "laldighi", name: "Laldighi" },
      { id: "new-market", name: "New Market" }
    ]
  },
  {
    id: "route-2",
    name: "Route 2",
    nameBn: "রুট নং: ০২",
    number: "2",
    color: "#10B981",
    description: "Kalurghat Bridge to New Market (14 km)",
    stops: [
      { id: "kalurghat-bridge", name: "Kalurghat Bridge" },
      { id: "ispahani-mosque", name: "Ispahani Mosque" },
      { id: "kaptai-road", name: "Kaptai Road Junction" },
      { id: "cmp-road", name: "CMP Road Junction" },
      { id: "sharafat-petrol", name: "Sharafat Petrol Pump" },
      { id: "bus-terminal", name: "Bus Terminal" },
      { id: "bahaddarhat", name: "Bahaddarhat" },
      { id: "muradpur", name: "Muradpur" },
      { id: "2no-gate", name: "2no Gate" },
      { id: "medical", name: "Medical" },
      { id: "chawkbazar-mosque", name: "Chawkbazar (Mosque)" },
      { id: "jamalkhan-road", name: "Jamalkhan Road" },
      { id: "andarkilla", name: "Andarkilla" },
      { id: "laldighi", name: "Laldighi" },
      { id: "new-market", name: "New Market" }
    ]
  },
  {
    id: "route-3",
    name: "Route 3",
    nameBn: "রুট নং: ০৩",
    number: "3",
    color: "#F59E0B",
    description: "Fateyabad to New Market (14.5 km)",
    stops: [
      { id: "fateyabad", name: "Fateyabad" },
      { id: "nandir-hat", name: "Nandir Hat" },
      { id: "baluchara", name: "Baluchara" },
      { id: "oxygen", name: "Oxygen" },
      { id: "hamzarbag", name: "Hamzarbag" },
      { id: "muradpur", name: "Muradpur" },
      { id: "probortok-moor", name: "Probortok Moor" },
      { id: "golpahar", name: "Golpahar" },
      { id: "kazir-deuri", name: "Kazir Deuri" },
      { id: "enayet-bazar", name: "Enayet Bazar" },
      { id: "tin-poler-matha", name: "Tin Poler Matha" },
      { id: "new-market", name: "New Market" }
    ]
  },
  {
    id: "route-4",
    name: "Route 4",
    nameBn: "রুট নং: ০৪",
    number: "4",
    color: "#EF4444",
    description: "New Market to Bhatiari (15 km)",
    stops: [
      { id: "new-market", name: "New Market" },
      { id: "puraton-station", name: "Puraton Station" },
      { id: "tiger-pass", name: "Tiger Pass" },
      { id: "choumuhani", name: "Choumuhani" },
      { id: "badamtali", name: "Badamtali" },
      { id: "barek-building", name: "Barek Building" },
      { id: "fakir-hat", name: "Fakir Hat" },
      { id: "nimtala-bridge", name: "Nimtala Bridge" },
      { id: "salt-gola", name: "Salt Gola" },
      { id: "cepzed", name: "CEPZED" },
      { id: "bandar-tila", name: "Bandar Tila" },
      { id: "cement-crossing", name: "Cement Crossing" },
      { id: "floatila", name: "Floatila" },
      { id: "standard-asiatic", name: "Standard Asiatic Well" },
      { id: "drydock", name: "Drydock" },
      { id: "koylar-dipu", name: "Koylar Dipu" },
      { id: "airport", name: "Airport" }
    ]
  },
  {
    id: "route-5",
    name: "Route 5",
    nameBn: "রুট নং: ০৫",
    number: "5",
    color: "#8B5CF6",
    description: "New Market to Airport (18.6 km)",
    stops: [
      { id: "new-market", name: "New Market" },
      { id: "puraton-station", name: "Puraton Station" },
      { id: "tiger-pass", name: "Tiger Pass" },
      { id: "choumuhani", name: "Choumuhani" },
      { id: "badamtali", name: "Badamtali" },
      { id: "barek-building", name: "Barek Building" },
      { id: "fakir-hat", name: "Fakir Hat" },
      { id: "nimtala-bridge", name: "Nimtala Bridge" },
      { id: "salt-gola", name: "Salt Gola" },
      { id: "cepzed", name: "CEPZED" },
      { id: "bandar-tila", name: "Bandar Tila" },
      { id: "cement-crossing", name: "Cement Crossing" },
      { id: "steel-mill-bazar", name: "Steel Mill Bazar" },
      { id: "katgar-refinery", name: "Katgar Refinery Gate" },
      { id: "sea-beach", name: "Sea Beach" }
    ]
  },
  {
    id: "route-6",
    name: "Route 6",
    nameBn: "রুট নং: ০৬",
    number: "6",
    color: "#EC4899",
    description: "Laldighi to Sea Beach (16.6 km)",
    stops: [
      { id: "laldighi", name: "Laldighi" },
      { id: "new-market", name: "New Market" },
      { id: "puraton-station", name: "Puraton Station" },
      { id: "tiger-pass", name: "Tiger Pass" },
      { id: "choumuhani", name: "Choumuhani" },
      { id: "badamtali", name: "Badamtali" },
      { id: "barek-building", name: "Barek Building" },
      { id: "fakir-hat", name: "Fakir Hat" },
      { id: "nimtala-bridge", name: "Nimtala Bridge" },
      { id: "salt-gola", name: "Salt Gola" },
      { id: "cepzed", name: "CEPZED" },
      { id: "bandar-tila", name: "Bandar Tila" },
      { id: "cement-crossing", name: "Cement Crossing" },
      { id: "steel-mill-bazar", name: "Steel Mill Bazar" },
      { id: "katgar-refinery", name: "Katgar Refinery Gate" },
      { id: "sea-beach", name: "Sea Beach" }
    ]
  },
  {
    id: "route-7",
    name: "Route 7",
    nameBn: "রুট নং: ০৭",
    number: "7",
    color: "#F97316",
    description: "Kotowali Mor to Bhatiari (16.1 km)",
    stops: [
      { id: "kotowali-mor", name: "Kotowali Mor" },
      { id: "new-market", name: "New Market" },
      { id: "puraton-station", name: "Puraton Station" },
      { id: "tiger-pass", name: "Tiger Pass" },
      { id: "choumuhani", name: "Choumuhani" },
      { id: "badamtali", name: "Badamtali" },
      { id: "jela-police-line", name: "Jela Police Line" },
      { id: "rajmukut", name: "Rajmukut" },
      { id: "wapda-gate", name: "Wapda Gate" },
      { id: "noyabazar", name: "Noyabazar" },
      { id: "alankar", name: "Alankar" },
      { id: "kornel-hat", name: "Kornel Hat" },
      { id: "fakir-hat", name: "Fakir Hat" },
      { id: "fouzdar-hat", name: "Fouzdar Hat" },
      { id: "banur-bazar", name: "Banur Bazar" },
      { id: "bhatiari", name: "Bhatiari" }
    ]
  },
  {
    id: "route-8",
    name: "Route 8",
    nameBn: "রুট নং: ০৮",
    number: "8",
    color: "#84CC16",
    description: "New Market to Oxygen (8 km)",
    stops: [
      { id: "new-market", name: "New Market" },
      { id: "kadam-tali", name: "Kadam Tali" },
      { id: "tiger-pass", name: "Tiger Pass" },
      { id: "wasa", name: "WASA" },
      { id: "2no-gate", name: "2no Gate" },
      { id: "rubi-gate", name: "Rubi Gate" },
      { id: "shershah-colony", name: "Shershah Colony" },
      { id: "bayezid", name: "Bayezid" },
      { id: "oxygen", name: "Oxygen" }
    ]
  },
  {
    id: "route-10",
    name: "Route 10",
    nameBn: "রুট নং: ১০",
    number: "10",
    color: "#6366F1",
    description: "Kalurghat to Sea Beach (25 km)",
    stops: [
      { id: "kalurghat-bridge", name: "Kalurghat Bridge" },
      { id: "ispahani-mosque", name: "Ispahani Mosque" },
      { id: "kaptai-road", name: "Kaptai Road Junction" },
      { id: "bus-terminal", name: "Bus Terminal" },
      { id: "bahaddarhat", name: "Bahaddarhat" },
      { id: "muradpur", name: "Muradpur" },
      { id: "2no-gate", name: "2no Gate" },
      { id: "gec", name: "GEC" },
      { id: "ispahani-mor", name: "Ispahani Mor" },
      { id: "deowan-hat", name: "Deowan Hat" },
      { id: "barek-building", name: "Barek Building" },
      { id: "badamtali", name: "Badamtali" },
      { id: "bandar-post", name: "Bandar Post Office" },
      { id: "customs-bridge", name: "Customs Bridge" },
      { id: "salt-gola", name: "Salt Gola" },
      { id: "cepzed", name: "CEPZED" },
      { id: "bandar-tila", name: "Bandar Tila" },
      { id: "cement-crossing", name: "Cement Crossing" },
      { id: "katgar-refinery-colony", name: "Katgar Refinery Colony Gate" },
      { id: "sea-beach", name: "Sea Beach" }
    ]
  },
  {
    id: "route-11",
    name: "Route 11",
    nameBn: "রুট নং: ১১",
    number: "11",
    color: "#14B8A6",
    description: "Bhatiari to Sea Beach (23 km)",
    stops: [
      { id: "bhatiari", name: "Bhatiari" },
      { id: "bm-gate", name: "BM Gate" },
      { id: "banur-bazar", name: "Banur Bazar" },
      { id: "fouzdar-hat", name: "Fouzdar Hat" },
      { id: "fakir-hat", name: "Fakir Hat" },
      { id: "city-gate", name: "City Gate" },
      { id: "kornel-hat", name: "Kornel Hat" },
      { id: "alankar", name: "Alankar" },
      { id: "noyabazar", name: "Noyabazar" },
      { id: "wapda-gate", name: "Wapda Gate" },
      { id: "boropol", name: "Boro Pol" },
      { id: "nimtala-bridge", name: "Nimtala Bridge" },
      { id: "custom-mor", name: "Custom Mor" },
      { id: "salt-gola", name: "Salt Gola" },
      { id: "cepzed", name: "CEPZED" },
      { id: "bandar-tila", name: "Bandar Tila" },
      { id: "steel-mill-bazar", name: "Steel Mill Bazar" },
      { id: "katgar-refinery", name: "Katgar Refinery Gate" },
      { id: "sea-beach", name: "Sea Beach" }
    ]
  }
];

export const getRouteById = (id: string): BusRoute | undefined => {
  return busRoutes.find(route => route.id === id);
};

export const getAllRoutes = (): BusRoute[] => {
  return busRoutes;
};
