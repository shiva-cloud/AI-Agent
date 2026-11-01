import {ValidationError} from './api-errors.js';

export const globalDestinations = [
    ['United States', /\b(?:united states|usa|u\.s(?:\.a)?\.?|america|new york|los angeles|chicago|san francisco|seattle|boston|austin|california|florida|uscis|h[- ]?1b|cap[- ]gap|form i[- ]94|i[- ]765|245\(k\)|fincen(?:\s+form\s+105)?|\bssn\b|\bsocial security number\b|\bgreen card\b|\bf[- ]?1(?:\s+student|\s+visa)?\b|\bopt\b|\bstem opt\b|\beb[- ]?[1235]\b|\bn[- ]?400\b|\bflsa\b)(?![\p{L}\p{N}_]|\.[\p{L}\p{N}_])/iu],
    ['United Kingdom', /\b(?:united kingdom|uk|u\.k\.?|great britain|britain|england|northern ireland|belfast|manchester|birmingham|edinburgh|glasgow|nhs|hmrc|dwp|skilled worker visa|indefinite leave to remain|\bilr\b|share code|right to rent|section 21|form 6a|\bnin\b|\bnational insurance number\b|\bgraduate route\b|\bmees\b|\bofcom\b|council tax|gp surgery)(?![\p{L}\p{N}_]|\.[\p{L}\p{N}_])/iu],
    ['Australia', /\b(?:australia|australian|sydney|melbourne|brisbane|perth|adelaide|nsw|ncat|vcat|qcat|fair work|centrelink|subclass (?:189|190|482|500|485|188)|vevo|skillselect|tfn|superannuation|austrac|condition 8607|residential tenancies authority|rta bond)\b/iu],
    ['Germany', /\b(?:germany|german|deutschland|blaue karte|eu blue card|chancenkarte|opportunity card|anmeldung|bürgeramt|steuer[- ]id|schufa|mietkaution|mietpreisbremse|rundfunkbeitrag|deutschlandticket|berlin|munich|frankfurt|hamburg|cologne|dusseldorf|stuttgart|§\s*16b|§\s*20|niederlassungserlaubnis|zoll|übersiedlungsgut|uebersiedlungsgut)\b/iu],
    ['United Arab Emirates', /\b(?:united arab emirates|uae|u\.a\.e\.?|dubai|abu dhabi|sharjah|ajman|ras al khaimah|fujairah|umm al quwain|mohre|mohap|emirates id|golden visa|green visa|ejari|rera|decree 43|wages protection system)(?![\p{L}\p{N}_]|\.[\p{L}\p{N}_])/iu],
    ['New Zealand', /\b(?:new zealand|kiwi|nz|aewv|accredited employer work visa|smc|skilled migrant category|ird number|tenancy tribunal|auckland|wellington|christchurch|hamilton|pswv|green list|plunket|at hop)\b/iu],
    ['Ireland', /(?<!\bnorthern\s+)\b(?:ireland|irish|eire|dublin|cork|galway|limerick|stamp 4|stamp 2|stamp 1g|csep|critical skills employment permit|pps number|ppsn|rent pressure zones?|rpz|leap card|rtb|wrc)\b/iu],
    ['Singapore', /\b(?:singapore|singaporean|changi|ica|cpf|mom|singpass|student'?s pass|employment pass|\bep\b|\bs pass\b|\bone pass\b|singapore pr|pts scheme|ltvp)\b/iu],
    ['France', /\b(?:france|french|paris|lyon|marseille|vls[- ]ts|passeport talent|ofii|carte de séjour|carte vitale|ameli|navigo|rece)\b/iu],
    ['Netherlands', /\b(?:netherlands|dutch|holland|amsterdam|rotterdam|the hague|utrecht|bsn|ind|kennismigrant|search year visa|zoekjaar|huurcommissie|digid|ovpay)\b/iu],
    ['Sweden', /\b(?:sweden|swedish|stockholm|gothenburg|malmo|personnummer|migrationsverket|uppehållstillstånd|bankid|swish)\b/iu],
    ['Spain', /\b(?:spain|spanish|madrid|barcelona|valencia|seville|nie|empadronamiento|tarjeta de identidad de extranjero|tie(?![- ]breaker)|nomada digital|beckham law)\b/iu],
    ['European Union', /\b(?:european union|eu|schengen|schengen area|schengen border|schengen visa|blue card directive|dublin regulation|cefr|gdpr)\b/iu]
  ];

export const explicitCountryPatterns = [
  ['United States', /\b(?:united states|usa|u\.s(?:\.a)?\.?|america|new york|los angeles|chicago|san francisco|seattle|boston|austin|california|florida)\b/iu],
  ['United Kingdom', /\b(?:united kingdom|uk|u\.k\.?|great britain|britain|england|scotland|wales|northern ireland|belfast|manchester|birmingham|edinburgh|glasgow)\b/iu],
  ['Australia', /\b(?:australia|australian|sydney|melbourne|brisbane|perth|adelaide|nsw)\b/iu],
  ['Germany', /\b(?:germany|deutschland|berlin|munich|frankfurt|hamburg|cologne|dusseldorf|stuttgart)\b/iu],
  ['United Arab Emirates', /\b(?:united arab emirates|uae|u\.a\.e\.?|dubai|abu dhabi|sharjah|ajman|ras al khaimah|fujairah|umm al quwain)\b/iu],
  ['New Zealand', /\b(?:new zealand|nz|auckland|wellington|christchurch|hamilton)\b/iu],
  ['Ireland', /(?<!\bnorthern\s+)\b(?:ireland|irish|eire|dublin|cork|galway|limerick)\b/iu],
  ['Singapore', /\b(?:singapore|singaporean)\b/iu],
  ['France', /\b(?:france|french|paris|lyon|marseille)\b/iu],
  ['Netherlands', /\b(?:netherlands|dutch|holland|amsterdam|rotterdam|the hague|utrecht)\b/iu],
  ['Sweden', /\b(?:sweden|swedish|stockholm|gothenburg|malmo)\b/iu],
  ['Spain', /\b(?:spain|spanish|madrid|barcelona|valencia|seville)\b/iu],
  ['European Union', /\b(?:european union|eu|schengen|brussels|strasbourg)\b/iu]
];

export const destinationCountries=Object.freeze(['CA',...globalDestinations.map(([country])=>country)]);

export const destinationCities = Object.freeze({
  'CA': Object.freeze(['Toronto', 'Mississauga', 'Brampton', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal']),
  'Canada': Object.freeze(['Toronto', 'Mississauga', 'Brampton', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal']),
  'United States': Object.freeze(['New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Seattle', 'Boston', 'Austin']),
  'United Kingdom': Object.freeze(['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Belfast']),
  'Australia': Object.freeze(['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide']),
  'Germany': Object.freeze(['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne', 'Dusseldorf', 'Stuttgart']),
  'United Arab Emirates': Object.freeze(['Dubai', 'Abu Dhabi', 'Sharjah']),
  'New Zealand': Object.freeze(['Auckland', 'Wellington', 'Christchurch', 'Hamilton']),
  'Ireland': Object.freeze(['Dublin', 'Cork', 'Galway', 'Limerick']),
  'Singapore': Object.freeze(['Singapore']),
  'France': Object.freeze(['Paris', 'Lyon', 'Marseille']),
  'Netherlands': Object.freeze(['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht']),
  'Sweden': Object.freeze(['Stockholm', 'Gothenburg', 'Malmo']),
  'Spain': Object.freeze(['Madrid', 'Barcelona', 'Valencia', 'Seville']),
  'European Union': Object.freeze(['Brussels', 'Strasbourg', 'Frankfurt', 'Amsterdam', 'Berlin', 'Paris', 'Madrid', 'Rome', 'Vienna'])
});

export const allSupportedCities = new Set(Object.values(destinationCities).flat());

export function isValidCityForCountry(city, country) {
  if (!city || typeof city !== 'string') return true;
  const safeCity = city.trim();
  if (!safeCity) return true;
  if (!country || country === 'CA') {
    return destinationCities['CA'].includes(safeCity);
  }
  const countryList = destinationCities[country];
  return countryList ? countryList.includes(safeCity) : allSupportedCities.has(safeCity);
}

export function resolveInputCountry(value) {
 if(value===undefined)return null;
 if(typeof value!=='string'||!value.trim()||value.length>80)throw new ValidationError('Choose a supported destination country');
 const normalized=value.trim().toLowerCase();
 if(normalized==='ca'||normalized==='canada')return 'CA';
 const country=destinationCountries.find(name=>name.toLowerCase()===normalized);
 if(!country)throw new ValidationError('Choose a supported destination country');
 return country;
}
