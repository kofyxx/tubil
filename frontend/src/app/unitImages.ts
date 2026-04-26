const wikiTitleByUnitName: Record<string, string> = {
  "Toyota Vios": "Toyota Vios",
  "Toyota Wigo": "Toyota Agya",
  "Toyota Raize 1.2": "Toyota Raize",
  "Toyota Hilux": "Toyota Hilux",
  "Honda City": "Honda City",
  "Honda Brio": "Honda Brio",
  "Honda BR-V": "Honda BR-V",
  "Honda Civic RS Turbo": "Honda Civic (eleventh generation)",
  "Honda CR-V Turbo": "Honda CR-V",
  "Mitsubishi Mirage G4": "Mitsubishi Mirage",
  "Mitsubishi Xpander": "Mitsubishi Xpander",
  "Mitsubishi Montero Sport": "Mitsubishi Pajero Sport",
  "Mitsubishi Strada": "Mitsubishi Triton",
  "Nissan Almera Turbo": "Nissan Almera",
  "Nissan Navara": "Nissan Navara",
  "Nissan Terra": "Nissan Terra",
  "Suzuki Ertiga": "Suzuki Ertiga",
  "Suzuki Dzire": "Suzuki Dzire",
  "Suzuki S-Presso": "Suzuki S-Presso",
  "Kia Soluto": "Kia Soluto",
  "Hyundai Stargazer": "Hyundai Stargazer",
  "Ford Ranger": "Ford Ranger",
  "Isuzu D-Max": "Isuzu D-Max",
  "Isuzu mu-X": "Isuzu MU-X",
  "Geely Coolray": "Geely Binyue",
  "MG ZS": "MG ZS",
  "Honda Click 125i": "Honda Click",
  "Honda Beat": "Honda BeAT",
  "Honda ADV 160": "Honda ADV",
  "Honda PCX 160": "Honda PCX",
  "Honda XRM 125": "Honda XRM",
  "Honda TMX 125": "Honda TMX",
  "Yamaha Mio i125": "Yamaha Mio",
  "Yamaha NMAX": "Yamaha NMAX",
  "Yamaha Aerox": "Yamaha Aerox",
  "Yamaha Sniper 155": "Yamaha Sniper",
  "Yamaha Fazzio": "Yamaha Fazzio",
  "Yamaha YTX 125": "Yamaha YTX",
  "Suzuki Raider R150 FI": "Suzuki Raider",
  "Suzuki Burgman Street": "Suzuki Burgman",
  "Suzuki Skydrive Sport": "Suzuki Skydrive",
  "Kawasaki Barako II": "Kawasaki Barako",
  "Kawasaki Rouser NS160": "Bajaj Pulsar",
  "Bajaj CT100": "Bajaj CT 100",
  "KTM Duke 200": "KTM 200 Duke",
  "CFMOTO 250 NK": "CFMoto 250 NK",
  "Rusi Classic 250": "Rusi Classic 250",
};

const fetchWikipediaThumbnail = async (title: string) => {
  const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    thumbnail?: {
      source?: string;
    };
  };

  return data.thumbnail?.source ?? null;
};

const fetchWikipediaSearchTitles = async (query: string) => {
  const response = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=1&format=json&origin=*`,
  );
  if (!response.ok) {
    return [] as string[];
  }

  const data = (await response.json()) as {
    query?: {
      search?: Array<{ title?: string }>;
    };
  };

  const titles = data.query?.search?.map((entry) => entry.title).filter((title): title is string => Boolean(title)) ?? [];
  return titles.slice(0, 5);
};

export const inferCategoryFromName = (name: string): "Vehicle" | "Motorcycle" => {
  const lower = name.toLowerCase();
  const motorcycleHints = [
    "click",
    "beat",
    "mio",
    "nmax",
    "aerox",
    "sniper",
    "tmx",
    "xrm",
    "barako",
    "raider",
    "burgman",
    "rouser",
    "duke",
    "ct100",
    "fazzio",
    "ytx",
    "pcx",
    "adv",
    "nk",
  ];

  return motorcycleHints.some((hint) => lower.includes(hint)) ? "Motorcycle" : "Vehicle";
};

export const fetchUnitImageByName = async (name: string, category?: "Vehicle" | "Motorcycle") => {
  const effectiveCategory = category ?? inferCategoryFromName(name);
  const mappedTitle = wikiTitleByUnitName[name];

  const primaryTitles = [mappedTitle, name].filter((title): title is string => Boolean(title));
  for (const title of primaryTitles) {
    const thumbnail = await fetchWikipediaThumbnail(title);
    if (thumbnail) {
      return thumbnail;
    }
  }

  const searchQueries = [
    `${name} ${effectiveCategory === "Motorcycle" ? "motorcycle" : "car"}`,
    `${name} ${effectiveCategory === "Motorcycle" ? "motorbike" : "vehicle"}`,
    name,
  ];

  for (const query of searchQueries) {
    const titles = await fetchWikipediaSearchTitles(query);
    for (const title of titles) {
      const thumbnail = await fetchWikipediaThumbnail(title);
      if (thumbnail) {
        return thumbnail;
      }
    }
  }

  return null;
};
