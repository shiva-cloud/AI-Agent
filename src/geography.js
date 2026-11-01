import {globalDestinations} from './destinations.js';
import {originCountryContext} from './licence-context.js';
// Versioned pilot geography registry (geo-1). One typed hierarchy holds every place the
// parser recognizes: supported pilot places, places it knows it does not cover, and
// places outside Canada that conflict with a Canadian-scoped question. It is not a
// global place-name database. Never infer Canada from an unknown place.
//
// Aliases are case-insensitive regular-expression fragments matched on word boundaries.
// Status:
//   supported           answered by the pilot
//   known_unsupported   always needs clarification
//   outside_canada      needs clarification when the question is otherwise Canadian
export const GEOGRAPHY_VERSION = 'geo-1';

export const places = Object.freeze([
  {id: 'CA', type: 'country', name: 'Canada', parent: null, status: 'supported', aliases: ['canada', 'canadian']},
  {id: 'ON', type: 'region', name: 'Ontario', parent: 'CA', status: 'supported', aliases: ['ontario']},
  {id: 'BC', type: 'region', name: 'British Columbia', parent: 'CA', status: 'supported', aliases: ['british columbia', 'bc']},
  {id: 'Toronto', type: 'city', name: 'Toronto', parent: 'ON', status: 'supported', aliases: ['toronto']},
  {id: 'Mississauga', type: 'city', name: 'Mississauga', parent: 'ON', status: 'supported', aliases: ['mississ?auga']},
  {id: 'Brampton', type: 'city', name: 'Brampton', parent: 'ON', status: 'supported', aliases: ['brampton']},
  // North and West Vancouver are separate municipalities, not neighbourhoods of Vancouver.
  {id: 'Vancouver', type: 'city', name: 'Vancouver', parent: 'BC', status: 'supported', aliases: ['(?<!(?:north|west) )vancouver']},
  {id: 'Mississauga/Square One', type: 'neighbourhood', name: 'Square One', parent: 'Mississauga', status: 'supported', aliases: ['square one']},
  {id: 'Mississauga/Malton', type: 'neighbourhood', name: 'Malton', parent: 'Mississauga', status: 'supported', aliases: ['malton']},
  {id: 'Mississauga/Streetsville', type: 'neighbourhood', name: 'Streetsville', parent: 'Mississauga', status: 'supported', aliases: ['streetsville']},
  {id: 'Mississauga/Meadowvale', type: 'neighbourhood', name: 'Meadowvale', parent: 'Mississauga', status: 'supported', aliases: ['meadowvale']},
  {id: 'Toronto/Scarborough', type: 'neighbourhood', name: 'Scarborough', parent: 'Toronto', status: 'supported', aliases: ['scarborough']},
  {id: 'Toronto/North York', type: 'neighbourhood', name: 'North York', parent: 'Toronto', status: 'supported', aliases: ['north york']},
  {id: 'Toronto/Etobicoke', type: 'neighbourhood', name: 'Etobicoke', parent: 'Toronto', status: 'supported', aliases: ['etobicoke']},
  {id: 'Toronto/East York', type: 'neighbourhood', name: 'East York', parent: 'Toronto', status: 'supported', aliases: ['east york']},
  {id: 'Brampton/Bramalea', type: 'neighbourhood', name: 'Bramalea', parent: 'Brampton', status: 'supported', aliases: ['bramalea']},
  {id: 'Vancouver/Kitsilano', type: 'neighbourhood', name: 'Kitsilano', parent: 'Vancouver', status: 'supported', aliases: ['kitsilano']},
  {id: 'Vancouver/Yaletown', type: 'neighbourhood', name: 'Yaletown', parent: 'Vancouver', status: 'supported', aliases: ['yaletown']},
  {id: 'Vancouver/Gastown', type: 'neighbourhood', name: 'Gastown', parent: 'Vancouver', status: 'supported', aliases: ['gastown']},

  {id: 'QC', type: 'region', name: 'Quebec', parent: 'CA', status: 'known_unsupported', aliases: ['quebec']},
  {id: 'AB', type: 'region', name: 'Alberta', parent: 'CA', status: 'known_unsupported', aliases: ['alberta']},
  {id: 'MB', type: 'region', name: 'Manitoba', parent: 'CA', status: 'known_unsupported', aliases: []},
  {id: 'NS', type: 'region', name: 'Nova Scotia', parent: 'CA', status: 'known_unsupported', aliases: ['nova scotia']},
  {id: 'SK', type: 'region', name: 'Saskatchewan', parent: 'CA', status: 'known_unsupported', aliases: ['saskatchewan']},
  {id: 'NL', type: 'region', name: 'Newfoundland and Labrador', parent: 'CA', status: 'known_unsupported', aliases: ['newfoundland', 'newfoundland and labrador']},
  {id: 'PE', type: 'region', name: 'Prince Edward Island', parent: 'CA', status: 'known_unsupported', aliases: ['prince edward island', 'pei']},
  {id: 'NB', type: 'region', name: 'New Brunswick', parent: 'CA', status: 'known_unsupported', aliases: ['new brunswick']},
  {id: 'YT', type: 'region', name: 'Yukon', parent: 'CA', status: 'known_unsupported', aliases: ['yukon']},
  {id: 'NT', type: 'region', name: 'Northwest Territories', parent: 'CA', status: 'known_unsupported', aliases: ['northwest territories', 'nwt']},
  {id: 'NU', type: 'region', name: 'Nunavut', parent: 'CA', status: 'known_unsupported', aliases: ['nunavut']},
  {id: 'Regina', type: 'city', name: 'Regina', parent: 'SK', status: 'known_unsupported', aliases: ['regina']},
  {id: 'St. Johns', type: 'city', name: "St. John's", parent: 'NL', status: 'known_unsupported', aliases: ["st\\. john'?s", "st johns"]},
  {id: 'Charlottetown', type: 'city', name: 'Charlottetown', parent: 'PE', status: 'known_unsupported', aliases: ['charlottetown']},
  {id: 'Whitehorse', type: 'city', name: 'Whitehorse', parent: 'YT', status: 'known_unsupported', aliases: ['whitehorse']},
  {id: 'Yellowknife', type: 'city', name: 'Yellowknife', parent: 'NT', status: 'known_unsupported', aliases: ['yellowknife']},
  {id: 'Iqaluit', type: 'city', name: 'Iqaluit', parent: 'NU', status: 'known_unsupported', aliases: ['iqaluit']},
  {id: 'Ottawa', type: 'city', name: 'Ottawa', parent: 'ON', status: 'known_unsupported', aliases: ['ottawa']},
  // No alias of its own: "London" is matched by the UK entry and offered as an alternative reading.
  {id: 'London, ON', type: 'city', name: 'London', parent: 'ON', status: 'known_unsupported', aliases: []},
  {id: 'Markham', type: 'city', name: 'Markham', parent: 'ON', status: 'known_unsupported', aliases: ['markham']},
  {id: 'Richmond Hill', type: 'city', name: 'Richmond Hill', parent: 'ON', status: 'known_unsupported', aliases: ['richmond hill']},
  {id: 'Vaughan', type: 'city', name: 'Vaughan', parent: 'ON', status: 'known_unsupported', aliases: ['vaughan']},
  {id: 'Oakville', type: 'city', name: 'Oakville', parent: 'ON', status: 'known_unsupported', aliases: ['oakville']},
  {id: 'Hamilton', type: 'city', name: 'Hamilton', parent: 'ON', status: 'known_unsupported', aliases: ['hamilton']},
  {id: 'Surrey', type: 'city', name: 'Surrey', parent: 'BC', status: 'known_unsupported', aliases: ['surrey']},
  {id: 'Burnaby', type: 'city', name: 'Burnaby', parent: 'BC', status: 'known_unsupported', aliases: ['burnaby']},
  {id: 'Richmond', type: 'city', name: 'Richmond', parent: 'BC', status: 'known_unsupported', aliases: ['richmond(?! hill)']},
  {id: 'Coquitlam', type: 'city', name: 'Coquitlam', parent: 'BC', status: 'known_unsupported', aliases: ['coquitlam']},
  {id: 'North Vancouver', type: 'city', name: 'North Vancouver', parent: 'BC', status: 'known_unsupported', aliases: ['north vancouver']},
  {id: 'West Vancouver', type: 'city', name: 'West Vancouver', parent: 'BC', status: 'known_unsupported', aliases: ['west vancouver']},
  {id: 'Montreal', type: 'city', name: 'Montreal', parent: 'QC', status: 'known_unsupported', aliases: ['montreal']},
  {id: 'Calgary', type: 'city', name: 'Calgary', parent: 'AB', status: 'known_unsupported', aliases: ['calgary']},
  {id: 'Edmonton', type: 'city', name: 'Edmonton', parent: 'AB', status: 'known_unsupported', aliases: ['edmonton']},
  {id: 'Winnipeg', type: 'city', name: 'Winnipeg', parent: 'MB', status: 'known_unsupported', aliases: ['winnipeg']},
  {id: 'Halifax', type: 'city', name: 'Halifax', parent: 'NS', status: 'known_unsupported', aliases: ['halifax']},
  {id: 'France', type: 'country', name: 'France', parent: null, status: 'outside_canada', aliases: ['france']},
  {id: 'Paris', type: 'city', name: 'Paris', parent: 'France', status: 'outside_canada', aliases: ['paris']},

  {id: 'United Kingdom', type: 'country', name: 'United Kingdom', parent: null, status: 'outside_canada', aliases: ['uk', 'united kingdom', 'northern ireland']},
  // "London" may also mean London, Ontario (same name above); both readings need clarification.
  {id: 'London', type: 'city', name: 'London', parent: 'United Kingdom', status: 'outside_canada', aliases: ['london']},
  {id: 'Manchester', type: 'city', name: 'Manchester', parent: 'United Kingdom', status: 'outside_canada', aliases: ['manchester']},
  {id: 'Birmingham', type: 'city', name: 'Birmingham', parent: 'United Kingdom', status: 'outside_canada', aliases: ['birmingham']},
  {id: 'Edinburgh', type: 'city', name: 'Edinburgh', parent: 'United Kingdom', status: 'outside_canada', aliases: ['edinburgh']},
  {id: 'Glasgow', type: 'city', name: 'Glasgow', parent: 'United Kingdom', status: 'outside_canada', aliases: ['glasgow']},

  {id: 'Australia', type: 'country', name: 'Australia', parent: null, status: 'outside_canada', aliases: ['australia', 'australian']},
  {id: 'Sydney', type: 'city', name: 'Sydney', parent: 'Australia', status: 'outside_canada', aliases: ['sydney']},
  {id: 'Melbourne', type: 'city', name: 'Melbourne', parent: 'Australia', status: 'outside_canada', aliases: ['melbourne']},
  {id: 'Brisbane', type: 'city', name: 'Brisbane', parent: 'Australia', status: 'outside_canada', aliases: ['brisbane']},
  {id: 'Perth', type: 'city', name: 'Perth', parent: 'Australia', status: 'outside_canada', aliases: ['perth']},

  {id: 'United States', type: 'country', name: 'United States', parent: null, status: 'outside_canada', aliases: ['usa', 'united states']},
  {id: 'New York', type: 'city', name: 'New York', parent: 'United States', status: 'outside_canada', aliases: ['new york']},
  {id: 'Los Angeles', type: 'city', name: 'Los Angeles', parent: 'United States', status: 'outside_canada', aliases: ['los angeles', 'la']},
  {id: 'Chicago', type: 'city', name: 'Chicago', parent: 'United States', status: 'outside_canada', aliases: ['chicago']},
  {id: 'San Francisco', type: 'city', name: 'San Francisco', parent: 'United States', status: 'outside_canada', aliases: ['san francisco', 'sf']},
  {id: 'Seattle', type: 'city', name: 'Seattle', parent: 'United States', status: 'outside_canada', aliases: ['seattle']},
  {id: 'Boston', type: 'city', name: 'Boston', parent: 'United States', status: 'outside_canada', aliases: ['boston']},
  {id: 'Austin', type: 'city', name: 'Austin', parent: 'United States', status: 'outside_canada', aliases: ['austin']},
  {id: 'San Jose', type: 'city', name: 'San Jose', parent: 'United States', status: 'outside_canada', aliases: ['san jose']},

  {id: 'Germany', type: 'country', name: 'Germany', parent: null, status: 'outside_canada', aliases: ['germany', 'deutschland']},
  {id: 'Berlin', type: 'city', name: 'Berlin', parent: 'Germany', status: 'outside_canada', aliases: ['berlin']},
  {id: 'Munich', type: 'city', name: 'Munich', parent: 'Germany', status: 'outside_canada', aliases: ['munich', 'münchen']},
  {id: 'Frankfurt', type: 'city', name: 'Frankfurt', parent: 'Germany', status: 'outside_canada', aliases: ['frankfurt']},
  {id: 'Hamburg', type: 'city', name: 'Hamburg', parent: 'Germany', status: 'outside_canada', aliases: ['hamburg']},

  {id: 'United Arab Emirates', type: 'country', name: 'United Arab Emirates', parent: null, status: 'outside_canada', aliases: ['uae', 'united arab emirates']},
  {id: 'Dubai', type: 'city', name: 'Dubai', parent: 'United Arab Emirates', status: 'outside_canada', aliases: ['dubai']},
  {id: 'Abu Dhabi', type: 'city', name: 'Abu Dhabi', parent: 'United Arab Emirates', status: 'outside_canada', aliases: ['abu dhabi']},
  {id: 'Sharjah', type: 'city', name: 'Sharjah', parent: 'United Arab Emirates', status: 'outside_canada', aliases: ['sharjah']},

  {id: 'New Zealand', type: 'country', name: 'New Zealand', parent: null, status: 'outside_canada', aliases: ['new zealand', 'nz']},
  {id: 'Auckland', type: 'city', name: 'Auckland', parent: 'New Zealand', status: 'outside_canada', aliases: ['auckland']},
  {id: 'Wellington', type: 'city', name: 'Wellington', parent: 'New Zealand', status: 'outside_canada', aliases: ['wellington']},
  {id: 'Christchurch', type: 'city', name: 'Christchurch', parent: 'New Zealand', status: 'outside_canada', aliases: ['christchurch']},

  {id: 'Ireland', type: 'country', name: 'Ireland', parent: null, status: 'outside_canada', aliases: ['(?<!northern )ireland', 'irish', 'eire']},
  {id: 'Dublin', type: 'city', name: 'Dublin', parent: 'Ireland', status: 'outside_canada', aliases: ['dublin']},
  {id: 'Cork', type: 'city', name: 'Cork', parent: 'Ireland', status: 'outside_canada', aliases: ['cork']},

  {id: 'Singapore', type: 'country', name: 'Singapore', parent: null, status: 'outside_canada', aliases: ['singapore']},
  {id: 'Netherlands', type: 'country', name: 'Netherlands', parent: null, status: 'outside_canada', aliases: ['netherlands', 'holland']},
  {id: 'Amsterdam', type: 'city', name: 'Amsterdam', parent: 'Netherlands', status: 'outside_canada', aliases: ['amsterdam']},

  {id: 'Sweden', type: 'country', name: 'Sweden', parent: null, status: 'outside_canada', aliases: ['sweden', 'swedish']},
  {id: 'Stockholm', type: 'city', name: 'Stockholm', parent: 'Sweden', status: 'outside_canada', aliases: ['stockholm']},

  {id: 'Spain', type: 'country', name: 'Spain', parent: null, status: 'outside_canada', aliases: ['spain', 'spanish']},
  {id: 'Madrid', type: 'city', name: 'Madrid', parent: 'Spain', status: 'outside_canada', aliases: ['madrid']},
  {id: 'Barcelona', type: 'city', name: 'Barcelona', parent: 'Spain', status: 'outside_canada', aliases: ['barcelona']},

  {id: 'Argentina', type: 'country', name: 'Argentina', parent: null, status: 'outside_canada', aliases: ['argentina', 'argentine', 'argentinian']},
  {id: 'Austria', type: 'country', name: 'Austria', parent: null, status: 'outside_canada', aliases: ['austria', 'austrian']},
  {id: 'Bangladesh', type: 'country', name: 'Bangladesh', parent: null, status: 'outside_canada', aliases: ['bangladesh', 'bangladeshi']},
  {id: 'Belgium', type: 'country', name: 'Belgium', parent: null, status: 'outside_canada', aliases: ['belgium', 'belgian']},
  {id: 'Brazil', type: 'country', name: 'Brazil', parent: null, status: 'outside_canada', aliases: ['brazil', 'brazilian']},
  {id: 'Bulgaria', type: 'country', name: 'Bulgaria', parent: null, status: 'outside_canada', aliases: ['bulgaria', 'bulgarian']},
  {id: 'Chile', type: 'country', name: 'Chile', parent: null, status: 'outside_canada', aliases: ['chile', 'chilean']},
  {id: 'China', type: 'country', name: 'China', parent: null, status: 'outside_canada', aliases: ['china', 'chinese']},
  {id: 'Colombia', type: 'country', name: 'Colombia', parent: null, status: 'outside_canada', aliases: ['colombia', 'colombian']},
  {id: 'Costa Rica', type: 'country', name: 'Costa Rica', parent: null, status: 'outside_canada', aliases: ['costa rica', 'costa rican']},
  {id: 'Croatia', type: 'country', name: 'Croatia', parent: null, status: 'outside_canada', aliases: ['croatia', 'croatian']},
  {id: 'Cyprus', type: 'country', name: 'Cyprus', parent: null, status: 'outside_canada', aliases: ['cyprus', 'cypriot']},
  {id: 'Czechia', type: 'country', name: 'Czechia', parent: null, status: 'outside_canada', aliases: ['czechia', 'czech republic', 'czech']},
  {id: 'Denmark', type: 'country', name: 'Denmark', parent: null, status: 'outside_canada', aliases: ['denmark', 'danish']},
  {id: 'Dominican Republic', type: 'country', name: 'Dominican Republic', parent: null, status: 'outside_canada', aliases: ['dominican republic']},
  {id: 'Ecuador', type: 'country', name: 'Ecuador', parent: null, status: 'outside_canada', aliases: ['ecuador', 'ecuadorian']},
  {id: 'Egypt', type: 'country', name: 'Egypt', parent: null, status: 'outside_canada', aliases: ['egypt', 'egyptian']},
  {id: 'Estonia', type: 'country', name: 'Estonia', parent: null, status: 'outside_canada', aliases: ['estonia', 'estonian']},
  {id: 'Fiji', type: 'country', name: 'Fiji', parent: null, status: 'outside_canada', aliases: ['fiji', 'fijian']},
  {id: 'Finland', type: 'country', name: 'Finland', parent: null, status: 'outside_canada', aliases: ['finland', 'finnish']},
  {id: 'Ghana', type: 'country', name: 'Ghana', parent: null, status: 'outside_canada', aliases: ['ghana', 'ghanaian']},
  {id: 'Greece', type: 'country', name: 'Greece', parent: null, status: 'outside_canada', aliases: ['greece', 'greek']},
  {id: 'Hong Kong', type: 'country', name: 'Hong Kong', parent: null, status: 'outside_canada', aliases: ['hong kong']},
  {id: 'Hungary', type: 'country', name: 'Hungary', parent: null, status: 'outside_canada', aliases: ['hungary', 'hungarian']},
  {id: 'Iceland', type: 'country', name: 'Iceland', parent: null, status: 'outside_canada', aliases: ['iceland', 'icelandic']},
  {id: 'India', type: 'country', name: 'India', parent: null, status: 'outside_canada', aliases: ['india']},
  {id: 'Indonesia', type: 'country', name: 'Indonesia', parent: null, status: 'outside_canada', aliases: ['indonesia', 'indonesian']},
  {id: 'Israel', type: 'country', name: 'Israel', parent: null, status: 'outside_canada', aliases: ['israel', 'israeli']},
  {id: 'Italy', type: 'country', name: 'Italy', parent: null, status: 'outside_canada', aliases: ['italy', 'italian', 'italia']},
  {id: 'Jamaica', type: 'country', name: 'Jamaica', parent: null, status: 'outside_canada', aliases: ['jamaica', 'jamaican']},
  {id: 'Japan', type: 'country', name: 'Japan', parent: null, status: 'outside_canada', aliases: ['japan', 'japanese']},
  {id: 'Kenya', type: 'country', name: 'Kenya', parent: null, status: 'outside_canada', aliases: ['kenya', 'kenyan']},
  {id: 'Latvia', type: 'country', name: 'Latvia', parent: null, status: 'outside_canada', aliases: ['latvia', 'latvian']},
  {id: 'Lithuania', type: 'country', name: 'Lithuania', parent: null, status: 'outside_canada', aliases: ['lithuania', 'lithuanian']},
  {id: 'Luxembourg', type: 'country', name: 'Luxembourg', parent: null, status: 'outside_canada', aliases: ['luxembourg']},
  {id: 'Malaysia', type: 'country', name: 'Malaysia', parent: null, status: 'outside_canada', aliases: ['malaysia', 'malaysian']},
  {id: 'Malta', type: 'country', name: 'Malta', parent: null, status: 'outside_canada', aliases: ['malta', 'maltese']},
  {id: 'Mauritius', type: 'country', name: 'Mauritius', parent: null, status: 'outside_canada', aliases: ['mauritius', 'mauritian']},
  {id: 'Mexico', type: 'country', name: 'Mexico', parent: null, status: 'outside_canada', aliases: ['mexico', 'mexican']},
  {id: 'Morocco', type: 'country', name: 'Morocco', parent: null, status: 'outside_canada', aliases: ['morocco', 'moroccan']},
  {id: 'Nepal', type: 'country', name: 'Nepal', parent: null, status: 'outside_canada', aliases: ['nepal', 'nepalese', 'nepali']},
  {id: 'Nigeria', type: 'country', name: 'Nigeria', parent: null, status: 'outside_canada', aliases: ['nigeria', 'nigerian']},
  {id: 'Norway', type: 'country', name: 'Norway', parent: null, status: 'outside_canada', aliases: ['norway', 'norwegian']},
  {id: 'Pakistan', type: 'country', name: 'Pakistan', parent: null, status: 'outside_canada', aliases: ['pakistan', 'pakistani']},
  {id: 'Panama', type: 'country', name: 'Panama', parent: null, status: 'outside_canada', aliases: ['panama', 'panamanian']},
  {id: 'Paraguay', type: 'country', name: 'Paraguay', parent: null, status: 'outside_canada', aliases: ['paraguay', 'paraguayan']},
  {id: 'Peru', type: 'country', name: 'Peru', parent: null, status: 'outside_canada', aliases: ['peru', 'peruvian']},
  {id: 'Philippines', type: 'country', name: 'Philippines', parent: null, status: 'outside_canada', aliases: ['philippines', 'filipino', 'philippine']},
  {id: 'Poland', type: 'country', name: 'Poland', parent: null, status: 'outside_canada', aliases: ['poland', 'polish']},
  {id: 'Portugal', type: 'country', name: 'Portugal', parent: null, status: 'outside_canada', aliases: ['portugal', 'portuguese']},
  {id: 'Qatar', type: 'country', name: 'Qatar', parent: null, status: 'outside_canada', aliases: ['qatar', 'qatari']},
  {id: 'Romania', type: 'country', name: 'Romania', parent: null, status: 'outside_canada', aliases: ['romania', 'romanian']},
  {id: 'Saudi Arabia', type: 'country', name: 'Saudi Arabia', parent: null, status: 'outside_canada', aliases: ['saudi arabia', 'saudi']},
  {id: 'Slovakia', type: 'country', name: 'Slovakia', parent: null, status: 'outside_canada', aliases: ['slovakia', 'slovak']},
  {id: 'Slovenia', type: 'country', name: 'Slovenia', parent: null, status: 'outside_canada', aliases: ['slovenia', 'slovenian', 'slovene']},
  {id: 'South Africa', type: 'country', name: 'South Africa', parent: null, status: 'outside_canada', aliases: ['south africa', 'south african']},
  {id: 'South Korea', type: 'country', name: 'South Korea', parent: null, status: 'outside_canada', aliases: ['south korea', 'korea']},
  {id: 'Sri Lanka', type: 'country', name: 'Sri Lanka', parent: null, status: 'outside_canada', aliases: ['sri lanka', 'sri lankan']},
  {id: 'Switzerland', type: 'country', name: 'Switzerland', parent: null, status: 'outside_canada', aliases: ['switzerland', 'swiss']},
  {id: 'Taiwan', type: 'country', name: 'Taiwan', parent: null, status: 'outside_canada', aliases: ['taiwan', 'taiwanese']},
  {id: 'Thailand', type: 'country', name: 'Thailand', parent: null, status: 'outside_canada', aliases: ['thailand', 'thai']},
  {id: 'Trinidad and Tobago', type: 'country', name: 'Trinidad and Tobago', parent: null, status: 'outside_canada', aliases: ['trinidad and tobago', 'trinidad', 'tobago']},
  {id: 'Turkey', type: 'country', name: 'Turkey', parent: null, status: 'outside_canada', aliases: ['turkey', 'turkish', 'türkiye']},
  {id: 'Uruguay', type: 'country', name: 'Uruguay', parent: null, status: 'outside_canada', aliases: ['uruguay', 'uruguayan']},
  {id: 'Vietnam', type: 'country', name: 'Vietnam', parent: null, status: 'outside_canada', aliases: ['vietnam', 'vietnamese']},
  {id: "Bahrain", type: "country", name: "Bahrain", parent: null, status: "outside_canada", aliases: ["bahrain","bahraini"]},
  {id: "Kuwait", type: "country", name: "Kuwait", parent: null, status: "outside_canada", aliases: ["kuwait","kuwaiti"]},
  {id: "Oman", type: "country", name: "Oman", parent: null, status: "outside_canada", aliases: ["oman","omani"]},
  {id: "Lima", type: "city", name: "Lima", parent: "Peru", status: "outside_canada", aliases: ["lima"]},
  {id: "Brussels", type: "city", name: "Brussels", parent: "Belgium", status: "outside_canada", aliases: ["brussels"]},
  {id: "Antwerp", type: "city", name: "Antwerp", parent: "Belgium", status: "outside_canada", aliases: ["antwerp"]},
  {id: "Colombo", type: "city", name: "Colombo", parent: "Sri Lanka", status: "outside_canada", aliases: ["colombo"]},
  {id: "Warsaw", type: "city", name: "Warsaw", parent: "Poland", status: "outside_canada", aliases: ["warsaw"]},
  {id: "Krakow", type: "city", name: "Krakow", parent: "Poland", status: "outside_canada", aliases: ["krakow"]},
  {id: "Bratislava", type: "city", name: "Bratislava", parent: "Slovakia", status: "outside_canada", aliases: ["bratislava"]},
  {id: "Cebu", type: "city", name: "Cebu", parent: "Philippines", status: "outside_canada", aliases: ["cebu"]},
  {id: "Manila", type: "city", name: "Manila", parent: "Philippines", status: "outside_canada", aliases: ["manila"]},
  {id: "Bergen", type: "city", name: "Bergen", parent: "Norway", status: "outside_canada", aliases: ["bergen"]},
  {id: "Oslo", type: "city", name: "Oslo", parent: "Norway", status: "outside_canada", aliases: ["oslo"]},
  {id: "Jeddah", type: "city", name: "Jeddah", parent: "Saudi Arabia", status: "outside_canada", aliases: ["jeddah"]},
  {id: "Riyadh", type: "city", name: "Riyadh", parent: "Saudi Arabia", status: "outside_canada", aliases: ["riyadh"]},
  {id: "Nairobi", type: "city", name: "Nairobi", parent: "Kenya", status: "outside_canada", aliases: ["nairobi"]},
  {id: "Bengaluru", type: "city", name: "Bengaluru", parent: "India", status: "outside_canada", aliases: ["bengaluru","bangalore"]},
  {id: "Delhi", type: "city", name: "Delhi", parent: "India", status: "outside_canada", aliases: ["delhi"]},
  {id: "Mumbai", type: "city", name: "Mumbai", parent: "India", status: "outside_canada", aliases: ["mumbai"]},
  {id: "Accra", type: "city", name: "Accra", parent: "Ghana", status: "outside_canada", aliases: ["accra"]},
  {id: "Muscat", type: "city", name: "Muscat", parent: "Oman", status: "outside_canada", aliases: ["muscat"]},
  {id: "Jakarta", type: "city", name: "Jakarta", parent: "Indonesia", status: "outside_canada", aliases: ["jakarta"]},
  {id: "Bali", type: "city", name: "Bali", parent: "Indonesia", status: "outside_canada", aliases: ["bali"]},
  {id: "Valencia", type: "city", name: "Valencia", parent: "Spain", status: "outside_canada", aliases: ["valencia"]},
  {id: "Seville", type: "city", name: "Seville", parent: "Spain", status: "outside_canada", aliases: ["seville"]},
  {id: "Reykjavik", type: "city", name: "Reykjavik", parent: "Iceland", status: "outside_canada", aliases: ["reykjavik"]},
  {id: "Budapest", type: "city", name: "Budapest", parent: "Hungary", status: "outside_canada", aliases: ["budapest"]},
  {id: "Tampere", type: "city", name: "Tampere", parent: "Finland", status: "outside_canada", aliases: ["tampere"]},
  {id: "Helsinki", type: "city", name: "Helsinki", parent: "Finland", status: "outside_canada", aliases: ["helsinki"]},
  {id: "Manama", type: "city", name: "Manama", parent: "Bahrain", status: "outside_canada", aliases: ["manama"]},
  {id: "Bogota", type: "city", name: "Bogota", parent: "Colombia", status: "outside_canada", aliases: ["bogota"]},
  {id: "Sofia", type: "city", name: "Sofia", parent: "Bulgaria", status: "outside_canada", aliases: ["sofia"]},
  {id: "Luxembourg City", type: "city", name: "Luxembourg City", parent: "Luxembourg", status: "outside_canada", aliases: ["luxembourg city","luxembourg city"]},
  {id: "Jerusalem", type: "city", name: "Jerusalem", parent: "Israel", status: "outside_canada", aliases: ["jerusalem"]},
  {id: "Tel Aviv", type: "city", name: "Tel Aviv", parent: "Israel", status: "outside_canada", aliases: ["tel aviv"]},
  {id: "Quito", type: "city", name: "Quito", parent: "Ecuador", status: "outside_canada", aliases: ["quito"]},
  {id: "Tallinn", type: "city", name: "Tallinn", parent: "Estonia", status: "outside_canada", aliases: ["tallinn"]},
  {id: "Central Region", type: "city", name: "Central Region", parent: "Singapore", status: "outside_canada", aliases: ["central region","central region"]},
  {id: "Jurong", type: "city", name: "Jurong", parent: "Singapore", status: "outside_canada", aliases: ["jurong"]},
  {id: "Kaohsiung", type: "city", name: "Kaohsiung", parent: "Taiwan", status: "outside_canada", aliases: ["kaohsiung"]},
  {id: "Taipei", type: "city", name: "Taipei", parent: "Taiwan", status: "outside_canada", aliases: ["taipei"]},
  {id: "Montevideo", type: "city", name: "Montevideo", parent: "Uruguay", status: "outside_canada", aliases: ["montevideo"]},
  {id: "Doha", type: "city", name: "Doha", parent: "Qatar", status: "outside_canada", aliases: ["doha"]},
  {id: "Santiago", type: "city", name: "Santiago", parent: "Chile", status: "outside_canada", aliases: ["santiago"]},
  {id: "Valparaiso", type: "city", name: "Valparaiso", parent: "Chile", status: "outside_canada", aliases: ["valparaiso"]},
  {id: "Ljubljana", type: "city", name: "Ljubljana", parent: "Slovenia", status: "outside_canada", aliases: ["ljubljana"]},
  {id: "Istanbul", type: "city", name: "Istanbul", parent: "Turkey", status: "outside_canada", aliases: ["istanbul"]},
  {id: "Ankara", type: "city", name: "Ankara", parent: "Turkey", status: "outside_canada", aliases: ["ankara"]},
  {id: "Ajman", type: "city", name: "Ajman", parent: "United Arab Emirates", status: "outside_canada", aliases: ["ajman"]},
  {id: "New Zealand/Hamilton", type: "city", name: "Hamilton", parent: "New Zealand", status: "outside_canada", aliases: ["hamilton"]},
  {id: "Sliema", type: "city", name: "Sliema", parent: "Malta", status: "outside_canada", aliases: ["sliema"]},
  {id: "Valletta", type: "city", name: "Valletta", parent: "Malta", status: "outside_canada", aliases: ["valletta"]},
  {id: "Kathmandu", type: "city", name: "Kathmandu", parent: "Nepal", status: "outside_canada", aliases: ["kathmandu"]},
  {id: "Buenos Aires", type: "city", name: "Buenos Aires", parent: "Argentina", status: "outside_canada", aliases: ["buenos aires"]},
  {id: "Karachi", type: "city", name: "Karachi", parent: "Pakistan", status: "outside_canada", aliases: ["karachi"]},
  {id: "Lahore", type: "city", name: "Lahore", parent: "Pakistan", status: "outside_canada", aliases: ["lahore"]},
  {id: "Monterrey", type: "city", name: "Monterrey", parent: "Mexico", status: "outside_canada", aliases: ["monterrey"]},
  {id: "Mexico City", type: "city", name: "Mexico City", parent: "Mexico", status: "outside_canada", aliases: ["mexico city"]},
  {id: "Casablanca", type: "city", name: "Casablanca", parent: "Morocco", status: "outside_canada", aliases: ["casablanca"]},
  {id: "Prague", type: "city", name: "Prague", parent: "Czechia", status: "outside_canada", aliases: ["prague"]},
  {id: "Brno", type: "city", name: "Brno", parent: "Czechia", status: "outside_canada", aliases: ["brno"]},
  {id: "Dhaka", type: "city", name: "Dhaka", parent: "Bangladesh", status: "outside_canada", aliases: ["dhaka"]},
  {id: "Galway", type: "city", name: "Galway", parent: "Ireland", status: "outside_canada", aliases: ["galway"]},
  {id: "Limerick", type: "city", name: "Limerick", parent: "Ireland", status: "outside_canada", aliases: ["limerick"]},
  {id: "Lyon", type: "city", name: "Lyon", parent: "France", status: "outside_canada", aliases: ["lyon"]},
  {id: "Marseille", type: "city", name: "Marseille", parent: "France", status: "outside_canada", aliases: ["marseille"]},
  {id: "Sao Paulo", type: "city", name: "Sao Paulo", parent: "Brazil", status: "outside_canada", aliases: ["sao paulo"]},
  {id: "Rio de Janeiro", type: "city", name: "Rio de Janeiro", parent: "Brazil", status: "outside_canada", aliases: ["rio de janeiro"]},
  {id: "Hong Kong Island", type: "city", name: "Hong Kong Island", parent: "Hong Kong", status: "outside_canada", aliases: ["hong kong island"]},
  {id: "Kowloon", type: "city", name: "Kowloon", parent: "Hong Kong", status: "outside_canada", aliases: ["kowloon"]},
  {id: "Kuwait City", type: "city", name: "Kuwait City", parent: "Kuwait", status: "outside_canada", aliases: ["kuwait city","kuwait city"]},
  {id: "Busan", type: "city", name: "Busan", parent: "South Korea", status: "outside_canada", aliases: ["busan"]},
  {id: "Seoul", type: "city", name: "Seoul", parent: "South Korea", status: "outside_canada", aliases: ["seoul"]},
  {id: "Santo Domingo", type: "city", name: "Santo Domingo", parent: "Dominican Republic", status: "outside_canada", aliases: ["santo domingo"]},
  {id: "Bologna", type: "city", name: "Bologna", parent: "Italy", status: "outside_canada", aliases: ["bologna"]},
  {id: "Rome", type: "city", name: "Rome", parent: "Italy", status: "outside_canada", aliases: ["rome"]},
  {id: "Milan", type: "city", name: "Milan", parent: "Italy", status: "outside_canada", aliases: ["milan"]},
  {id: "Limassol", type: "city", name: "Limassol", parent: "Cyprus", status: "outside_canada", aliases: ["limassol"]},
  {id: "Nicosia", type: "city", name: "Nicosia", parent: "Cyprus", status: "outside_canada", aliases: ["nicosia"]},
  {id: "Osaka", type: "city", name: "Osaka", parent: "Japan", status: "outside_canada", aliases: ["osaka"]},
  {id: "Tokyo", type: "city", name: "Tokyo", parent: "Japan", status: "outside_canada", aliases: ["tokyo"]},
  {id: "Vilnius", type: "city", name: "Vilnius", parent: "Lithuania", status: "outside_canada", aliases: ["vilnius"]},
  {id: "Shanghai", type: "city", name: "Shanghai", parent: "China", status: "outside_canada", aliases: ["shanghai"]},
  {id: "Shenzhen", type: "city", name: "Shenzhen", parent: "China", status: "outside_canada", aliases: ["shenzhen"]},
  {id: "Zurich", type: "city", name: "Zurich", parent: "Switzerland", status: "outside_canada", aliases: ["zurich"]},
  {id: "Geneva", type: "city", name: "Geneva", parent: "Switzerland", status: "outside_canada", aliases: ["geneva"]},
  {id: "Panama City", type: "city", name: "Panama City", parent: "Panama", status: "outside_canada", aliases: ["panama city","panama city"]},
  {id: "San Jose, Costa Rica", type: "city", name: "San Jose", parent: "Costa Rica", status: "outside_canada", aliases: []},
  {id: "Graz", type: "city", name: "Graz", parent: "Austria", status: "outside_canada", aliases: ["graz"]},
  {id: "Vienna", type: "city", name: "Vienna", parent: "Austria", status: "outside_canada", aliases: ["vienna"]},
  {id: "Thessaloniki", type: "city", name: "Thessaloniki", parent: "Greece", status: "outside_canada", aliases: ["thessaloniki"]},
  {id: "Athens", type: "city", name: "Athens", parent: "Greece", status: "outside_canada", aliases: ["athens"]},
  {id: "Ho Chi Minh City", type: "city", name: "Ho Chi Minh City", parent: "Vietnam", status: "outside_canada", aliases: ["ho chi minh city","ho chi minh","saigon"]},
  {id: "Hanoi", type: "city", name: "Hanoi", parent: "Vietnam", status: "outside_canada", aliases: ["hanoi"]},
  {id: "Gothenburg", type: "city", name: "Gothenburg", parent: "Sweden", status: "outside_canada", aliases: ["gothenburg"]},
  {id: "Malmo", type: "city", name: "Malmo", parent: "Sweden", status: "outside_canada", aliases: ["malmo"]},
  {id: "Zagreb", type: "city", name: "Zagreb", parent: "Croatia", status: "outside_canada", aliases: ["zagreb"]},
  {id: "Johannesburg", type: "city", name: "Johannesburg", parent: "South Africa", status: "outside_canada", aliases: ["johannesburg"]},
  {id: "Cape Town", type: "city", name: "Cape Town", parent: "South Africa", status: "outside_canada", aliases: ["cape town"]},
  {id: "Copenhagen", type: "city", name: "Copenhagen", parent: "Denmark", status: "outside_canada", aliases: ["copenhagen"]},
  {id: "Aarhus", type: "city", name: "Aarhus", parent: "Denmark", status: "outside_canada", aliases: ["aarhus"]},
  {id: "Braga", type: "city", name: "Braga", parent: "Portugal", status: "outside_canada", aliases: ["braga"]},
  {id: "Lisbon", type: "city", name: "Lisbon", parent: "Portugal", status: "outside_canada", aliases: ["lisbon"]},
  {id: "Porto", type: "city", name: "Porto", parent: "Portugal", status: "outside_canada", aliases: ["porto"]},
  {id: "Bangkok", type: "city", name: "Bangkok", parent: "Thailand", status: "outside_canada", aliases: ["bangkok"]},
  {id: "Chiang Mai", type: "city", name: "Chiang Mai", parent: "Thailand", status: "outside_canada", aliases: ["chiang mai"]},
  {id: "Cologne", type: "city", name: "Cologne", parent: "Germany", status: "outside_canada", aliases: ["cologne"]},
  {id: "Dusseldorf", type: "city", name: "Dusseldorf", parent: "Germany", status: "outside_canada", aliases: ["dusseldorf"]},
  {id: "Stuttgart", type: "city", name: "Stuttgart", parent: "Germany", status: "outside_canada", aliases: ["stuttgart"]},
  {id: "Rotterdam", type: "city", name: "Rotterdam", parent: "Netherlands", status: "outside_canada", aliases: ["rotterdam"]},
  {id: "The Hague", type: "city", name: "The Hague", parent: "Netherlands", status: "outside_canada", aliases: ["the hague"]},
  {id: "Utrecht", type: "city", name: "Utrecht", parent: "Netherlands", status: "outside_canada", aliases: ["utrecht"]},
  {id: "Bucharest", type: "city", name: "Bucharest", parent: "Romania", status: "outside_canada", aliases: ["bucharest"]},
  {id: "Asuncion", type: "city", name: "Asuncion", parent: "Paraguay", status: "outside_canada", aliases: ["asuncion"]},
  {id: "Penang", type: "city", name: "Penang", parent: "Malaysia", status: "outside_canada", aliases: ["penang"]},
  {id: "Kuala Lumpur", type: "city", name: "Kuala Lumpur", parent: "Malaysia", status: "outside_canada", aliases: ["kuala lumpur"]},
  {id: "Lagos", type: "city", name: "Lagos", parent: "Nigeria", status: "outside_canada", aliases: ["lagos"]},
  {id: "Abuja", type: "city", name: "Abuja", parent: "Nigeria", status: "outside_canada", aliases: ["abuja"]},
  {id: "Cairo", type: "city", name: "Cairo", parent: "Egypt", status: "outside_canada", aliases: ["cairo"]},
  {id: "Riga", type: "city", name: "Riga", parent: "Latvia", status: "outside_canada", aliases: ["riga"]},
  {id: "Belfast", type: "city", name: "Belfast", parent: "United Kingdom", status: "outside_canada", aliases: ["belfast"]},
  {id: "Adelaide", type: "city", name: "Adelaide", parent: "Australia", status: "outside_canada", aliases: ["adelaide"]}
].map(place => Object.freeze({...place, aliases: Object.freeze([...place.aliases])})));

const byId = new Map(places.map(place => [place.id, place]));
const aliasSource = list => list.map(place => place.aliases.join('|')).filter(Boolean).join('|');
const pattern = list => new RegExp(`\\b(?:${aliasSource(list)})\\b`, 'iu');
const placePattern = place => place.aliases.length ? pattern([place]) : null;
const compiled = places.map(place => [place, placePattern(place)]);

/** Ancestor chain from the country down to the place, e.g. ['CA', 'ON', 'Toronto']. */
export function placePath(id) {
  const path = [];
  for (let place = byId.get(id); place; place = byId.get(place.parent)) path.unshift(place.id);
  return path;
}

/** The nearest ancestor-or-self of the given type, or null. */
export function ancestorOfType(id, type) {
  for (let place = byId.get(id); place; place = byId.get(place.parent)) if (place.type === type) return place.id;
  return null;
}

/** Every registry place named in the text, in registry order. */
export function findPlaces(text) {
  return compiled.filter(([, regex]) => regex && regex.test(text)).map(([place]) => place);
}

/** Supported pilot cities named in the text; a neighbourhood counts as its city. */
export function supportedCitiesIn(text) {
  return [...new Set(findPlaces(text)
    .filter(place => place.status === 'supported' && (place.type === 'city' || place.type === 'neighbourhood'))
    .map(place => ancestorOfType(place.id, 'city')))];
}

/** Supported regions named in the text by their own aliases (not inferred from a city). */
export function supportedRegionsIn(text) {
  return findPlaces(text).filter(place => place.status === 'supported' && place.type === 'region').map(place => place.id);
}

/** A reader-facing label such as "Ottawa, Ontario" or "London, United Kingdom". */
export function placeLabel(id) {
  const place = byId.get(id);
  if (!place) return id;
  if (place.type === 'country' || place.type === 'region') return place.name;
  const parent = byId.get(place.parent);
  return parent ? `${place.name}, ${parent.type === 'city' ? placeLabel(parent.id) : parent.name}` : place.name;
}

const PILOT_CITIES = 'Toronto, Mississauga, Brampton and Vancouver';
const listLabels = (labels, joiner = 'and') => labels.length < 2 ? labels.join('') : `${labels.slice(0, -1).join(', ')} ${joiner} ${labels.at(-1)}`;
const choice = place => ({id: place.id, label: placeLabel(place.id), type: place.type, status: place.status, path: placePath(place.id)});

/**
 * Explains why a question needs a location and which places it mentioned, including
 * other places with the same name (London, Ontario / London, United Kingdom).
 * Only supported pilot cities are ever selectable, and only when the question names no
 * place: a chosen city must never overwrite a place the user wrote.
 *
 * @param {string} text - the normalized question
 * @param {object} parsed - parse() output whose missingSlots include 'location'
 */
export function describeLocationClarification(text, parsed) {
  const isExplicitCanada = /\b(?:canada|canadian|ontario|\bon\b|british columbia|\bbc\b)\b/i.test(text);
  const named = findPlaces(text).filter(place => {
    if (parsed?.country && parsed.country !== 'CA' && !isExplicitCanada) {
      const c = ancestorOfType(place.id, 'country');
      if (c === 'CA') return false;
    }
    return true;
  });
  const mentioned = [];
  for (const place of named) {
    for (const same of places.filter(p => p.name.toLowerCase() === place.name.toLowerCase())) {
      if (!mentioned.includes(same)) mentioned.push(same);
    }
  }
  const unsupported = mentioned.filter(p => {
    if (p.status === 'known_unsupported') return true;
    if (p.status === 'outside_canada') {
      const parentCountry = p.type === 'country' ? p.name : ancestorOfType(p.id, 'country');
      const isSupportedGlobal = globalDestinations.some(([name]) => name === parentCountry);
      if (!isSupportedGlobal) return true;
      if (parsed.country === 'CA') return true;
    }
    return false;
  });
  const cities = supportedCitiesIn(text), regions = supportedRegionsIn(text);
  // Destination countries the app supports, plus Canada when a Canadian place is named.
  const countries = [...new Set([
    ...(cities.length || regions.length || /\b(?:canada|canadian)\b/i.test(text) ? ['Canada'] : []),
    ...globalDestinations.filter(([, pattern]) => pattern.test(text)).map(([name]) => name)
  ])];
  let reason, message, selectableCities = [];
  if (countries.length > 1 && !unsupported.some(p => p.status === 'known_unsupported')) {
    reason = 'conflicting_countries';
    message = `Your question mentions more than one country (${listLabels(countries.map(name => /^United\b/.test(name) ? `the ${name}` : name))}). Ask about one country at a time. To ask about a country other than Canada, choose it as the destination country.`;
  } else if (unsupported.length) {
    reason = 'unsupported_place';
    const homonyms = [...new Set(unsupported.map(p => p.name))].filter(name => mentioned.filter(p => p.name === name).length > 1);
    const readings = homonyms.map(name => `${name} could mean ${listLabels(mentioned.filter(p => p.name === name).map(p => placeLabel(p.id)), 'or')}`);
    const labels = unsupported.filter(p => !homonyms.includes(p.name)).map(p => placeLabel(p.id));
    const parts = [...readings, ...(labels.length ? [`your question mentions ${listLabels(labels)}`] : [])];
    const sentence = parts.join('; ');
    const countries = [...new Set(unsupported.filter(p => p.status === 'outside_canada').map(p => ancestorOfType(p.id, 'country')))];
    const coverage = !labels.length && homonyms.length === 1 ? 'either place' : unsupported.length > 1 ? 'these places' : 'that place';
    const country = countries.length === 1 ? byId.get(countries[0])?.name : null;
    const isGlobalUnsupported = country && !['CA', 'Canada'].includes(country) && !globalDestinations.some(([name]) => name === country);
    if (isGlobalUnsupported) {
      message = `${sentence[0].toUpperCase()}${sentence.slice(1)}. This pilot currently provides verified statutory settlement datasets for 13 destination corridors (Canada, United States, United Kingdom, Australia, Germany, France, New Zealand, Ireland, Singapore, Spain, Netherlands, Sweden, and United Arab Emirates). ${country} is currently outside our verified municipal settlement dataset. For matters in ${country}, consult the competent national authorities or local accredited legal counsel.`;
    } else {
      message = `${sentence[0].toUpperCase()}${sentence.slice(1)}. This pilot does not cover ${coverage} yet. It covers ${PILOT_CITIES}.`
        + (country ? ` To ask about ${/^United\b/.test(country) ? 'the ' : ''}${country} as a whole, choose it as the destination country and leave Canadian places out of the question.` : ' Edit the question to name one of the covered cities.');
    }
  } else if (cities.length > 1) {
    reason = 'multiple_cities';
    message = `Your question mentions ${listLabels(cities)}. Ask about one city at a time so each answer uses the right local rules.`;
  } else if (regions.length > 1 || (parsed.region && regions.some(r => r !== parsed.region))) {
    reason = 'conflicting_regions';
    message = `Your question mentions places in more than one province (${listLabels([...new Set([parsed.region, ...regions].filter(Boolean))].map(placeLabel))}). Ask about one province at a time.`;
  } else if (parsed.ambiguous && parsed.country !== 'CA') {
    reason = 'conflicting_countries';
    message = 'Your question mentions more than one country. Ask about one country at a time.';
  } else if (parsed.ambiguous) {
    reason = 'unknown_place';
    const unknown = unrecognisedPlaceNames(text);
    message = `${unknown.length ? `We could not recognise ${listLabels(unknown.map(name => `“${name}”`))} as a place.` : 'We could not recognise the place in your question.'} This pilot covers ${PILOT_CITIES}. Edit the question to name one of them.`;
  } else {
    reason = 'missing_location';
    message = `Which city is your question about? This pilot covers ${PILOT_CITIES}.`;
    if (!parsed.city && !parsed.region) selectableCities = places.filter(p => p.type === 'city' && p.status === 'supported').map(p => p.id);
  }
  return {version: GEOGRAPHY_VERSION, reason, message, mentioned: mentioned.map(choice), selectableCities};
}

const supportedPrefix =new RegExp(`^(?:${aliasSource(places.filter(place => place.status === 'supported'))})\\b`, 'i');
const alwaysUnsupported = pattern(places.filter(place => place.status === 'known_unsupported'));
const outsideCanada = pattern(places.filter(place => place.status === 'outside_canada'));

// 'in' is listed so a masked issuing-country span ("issued in ___ in Toronto")
// does not read the dangling preposition as an unknown destination; the real
// destination after it is still parsed, and unknown countries keep their
// clarification through the licence-country slot.
const nonPlace = /^(?:a|an|the|in|and|or|with|for|after|while|before|prior|from|without|also|then|until|since|during|across|through|years?|months?|days?|times?|status|pr|visa|permit|application|my|your|our|their|this|that|which|what|me|here|free|new|dufferin|person|english|advance|cash|full|writing|order|general|particular|total|addition|case|terms|need|time|future|school|hospital|college|university|public|private|employment|healthcare|health|housing|childcare|daycare|libraries|library|online|work|search|express(?:\s+entry)?|teer|peel(?:\s+district)?|school\s+board|acro|french|bilingual|nclc|clb|ielts|celpip|noc|crs|fsw|cec|pnp|oinp|partner|partners|clinic|clinics|january|february|march|april|may|june|july|august|september|october|november|december|early|late|mid|winter|summer|spring|autumn|fall|[0-9]+|progress|between|languages?|tef|tcf|pte|europe|distance|degrees?|diplomas?|universit(?:y|ies)|programs?|streams?|draws?|rounds?|categories?|postings?|units?|custody|convictions?|speeding|tickets?|traffic|dui|rehabilitation|medicare|medicaid|superannuation|kiwisaver|pension|probation|probearbeit|fhsa|tfsa|rrsp|401k|ira|chancenkarte|bad(?:\s+faith)?|census(?:\s+metropolitan)?|publicly(?:\s+advertised)?|designated|ohip|msp|ramq|ahcip|ifhp|nhs|sin|ssn|any|annex|accordance|compliance|violation|respect|relation|excess|comparison|cryptocurrency|crypto|hardware|ledger|unhosted|medical|science|tech|supermarkets?|regional|one|two|three|four|five|ten|junior(?:\s+kindergarten)?|kindergarten|preschool|elementary|secondary|high\s+schools?|schools?|offices?|departments?|stores?|shops?|shopping|malls?|places?|courts?|sectors?|industries|commerce|business|government|banking|finance|technology|healthcare|german|french|spanish|dutch|swedish|canadian|australian|american|british|irish|immigration|emigration|migration|another|different|other|various|all|many|several|multiple|certain|every|each|such|same|similar|removal|local|foreign|international|domestic|global|national|federal|provincial|state|migrants?|immigrants?|citizens?|residents?|applicants?|newcomers?|integration|settlement|policy|law|practice|context|theory|reality|principles?|effect|force|area|areas|jurisdictions?|cases?|circumstances?|situations?|periods?|stages?|phases?|systems?|frameworks?|types?|forms?|ways?|regards?|fact|short|essence|parallel|consultants?|lawyers?|documents?|records?|intentions?|purposes?|discretion|entitlement|rules?|websites?|departments?|statistics?|outcomes?|countries|legislation|statutes?|policies|constitution|treaty|treaties|old|new|names?|jobs?|duties|birthdays?|selection|cross-border|entry|transit|disputes?|custody|networks?|records?|agreements?|filings?|interviews?|reviews?|assessments?|processing|decisions?|procedures?|requirements?|criteria|systems?|programs?|categories?|qualifications?|credentials?|degrees?|diplomas?|certificates?|standards?|tests?|exams?|scores?|results?|evidence|proof|funds?|assets?|accounts?|statements?|documents?|forms?|notices?|letters?|appeals?|hearings?|tribunals?|regulations?|laws?|rules?|guidelines?|instructions?|orders?|bans?|penalties?|fees?|costs?|expenses?|payments?|transfers?|taxes?|benefits?|services?|supports?|resources?|centers?|offices?|agencies?|departments?|ministries?|embassies?|consulates?|missions?|borders?|ports?|airports?|checkpoints?|flights?|travel|trips?|arrivals?|departures?|stays?|visits?|admissions?|landings?|settlements?|relocations?|moves?|refusals?|detention|dangerous|security-sensitive|citizenship-by-investment|residency|trade|social|either|neither|family|skilled-migration|regions?|official|evaluating|industry|industries|temporary|long-term|short-term|medium-term|accommodation|history|loss|losses|spousal|spouse|spouses|plain(?:\s+language|\s+english)?|simple(?:\s+terms|\s+words)?|layman(?:'s)?(?:\s+terms)?|chronological(?:\s+order)?|summary|detail|crisis|trouble|dispute|danger|urgent(?:\s+assistance)?|assistance|rental(?:\s+housing|\s+property|\s+market|\s+units?)?|two\s+countries|automated\s+screening|social\s+security(?:\s+contributions?)?|rent\s+arrears|accessibility(?:\s+modification)?|food\s+banks?|public\s+transit|telecom(?:\s+early\s+cancellation|\s+contract)?)\b/i;

// In a question about another destination country, "in London UK" or "in Sydney Australia"
// names a city inside that country; the city itself is not a pilot place to resolve.
function namesGlobalCountrySoon(destination) {
  return globalDestinations.some(([,pattern])=>pattern.test(destination));
}

// Text after a location preposition that is not a known place or an ordinary word.
function unrecognisedDestinations(text, isGlobal = false) {
  const found = [];
  for(const match of text.matchAll(/(?<![-])\b(?:in|near|around|mov(?:e|ed|ing) to|relocat(?:e|ed|ing) to|arriv(?:e|ed|ing) in|live|lived|living in|settl(?:e|ed|ing) in|stay(?:ing|ed)? in)\s+(?=([a-z][a-z.\s'-]*))/gi)) {
    const destination=match[1].trim();
    if(isGlobal && (outsideCanada.test(destination) || namesGlobalCountrySoon(destination))) continue;
    if(!supportedPrefix.test(destination) && !globalDestinations.some(([,pattern])=>pattern.exec(destination)?.index===0) && !nonPlace.test(destination)) found.push(destination);
  }
  return found;
}

export function hasUnsupportedDestination(text, isGlobal = false) {
  if(!isGlobal && alwaysUnsupported.test(text)) return true;
  if(!isGlobal && outsideCanada.test(text)) return true;
  if(isGlobal) {
    const hasUnsupportedOutside = places.some(p => {
      if (p.status !== 'outside_canada') return false;
      const countryObj = p.type === 'country' ? p : byId.get(ancestorOfType(p.id, 'country'));
      const parentCountry = countryObj?.name || (p.type === 'country' ? p.name : ancestorOfType(p.id, 'country'));
      const isSupportedGlobal = globalDestinations.some(([name]) => name === parentCountry);
      if (isSupportedGlobal) return false;
      return p.aliases.some(a => new RegExp(`\\b${a}\\b`, 'i').test(text));
    });
    if (hasUnsupportedOutside) return true;
    return false;
  }
  return unrecognisedDestinations(text, isGlobal).length > 0;
}

/** Short place-like names the user wrote that the registry does not know, e.g. "Springfield" or "Prince George". */
export function unrecognisedPlaceNames(text) {
  return [...new Set(unrecognisedDestinations(text).map(destination => {
    const [first, ...rest] = destination.replace(/[.'-]+$/, '').split(/\s+/);
    const name = [first, ...rest.slice(0, 2).filter((word, i, all) => /^[A-Z]/.test(word) && all.slice(0, i).every(w => /^[A-Z]/.test(w)))].join(' ');
    return name.slice(0, 40);
  }).filter(Boolean))];
}

/**
 * Detects and resolves directional relocation clauses ("from X to Y", "moving from X to Y").
 * Disambiguates origin (source country/city) from destination (settlement city/country).
 */
export function resolveClauseGeography(text) {
  if (typeof text !== 'string') return null;
  const pattern = /\b(?:from|moving from|relocating from|leaving|arriving from|travel(?:l?ing)? from|coming from|originating from|migrating from)\s+([a-zA-Z\s'-]+?)\s+(?:to|in|into)\s+([a-zA-Z\s'-]+?)(?=(?:[,.?!]|\s+(?:can|how|what|is|are|will|do|does|where|when|should|my|with|for|about|and|or|$)))/i;
  const match = text.match(pattern);
  if (!match) return null;

  const originClause = match[1].trim();
  const destClause = match[2].trim();

  let originMatches = findPlaces(originClause);
  const destMatches = findPlaces(destClause);

  if (!originMatches.length) {
    const fallback = originCountryContext(`from ${originClause}`);
    if (fallback?.originCountry) {
      originMatches = [{
        id: fallback.originCountry,
        type: 'country',
        name: fallback.originCountry,
        parent: null,
        status: 'outside_canada',
        aliases: []
      }];
    }
  }

  if (!originMatches.length || !destMatches.length) return null;

  const origin = originMatches[0];
  const destination = destMatches[0];

  const originCountry = ancestorOfType(origin.id, 'country') || (origin.type === 'country' ? origin.name : null);
  const destCountry = ancestorOfType(destination.id, 'country') || (destination.type === 'country' ? destination.name : 'Canada');
  const destCity = ancestorOfType(destination.id, 'city') || (destination.type === 'city' ? destination.id : null);
  const destRegion = ancestorOfType(destination.id, 'region') || (destination.type === 'region' ? destination.id : null);

  const isDestSupported = destination.status === 'supported' || destCountry === 'Canada' || destCountry === 'CA';

  return {
    hasRelocation: true,
    origin,
    originName: origin.name,
    originCountry,
    originClause,
    destination,
    destName: destination.name,
    destCountry: destCountry === 'Canada' ? 'CA' : destCountry,
    destCity,
    destRegion,
    isDestSupported,
    matchText: match[0],
    maskPattern: new RegExp(`\\b(?:from|moving from|relocating from|leaving|arriving from|travel(?:l?ing)? from|coming from|originating from|migrating from)\\s+${originClause.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
  };
}
