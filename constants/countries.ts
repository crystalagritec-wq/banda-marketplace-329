export interface Country {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
  currency: string;
  mapSvg: string;
}

export const countries: Country[] = [
  {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    phoneCode: '+254',
    currency: 'KES',
    mapSvg: 'M50,20 L80,25 L85,40 L80,60 L70,80 L50,85 L30,80 L20,60 L15,40 L20,25 Z'
  },
  {
    code: 'UG',
    name: 'Uganda',
    flag: '🇺🇬',
    phoneCode: '+256',
    currency: 'UGX',
    mapSvg: 'M45,15 L75,20 L80,35 L75,55 L65,75 L45,80 L25,75 L15,55 L10,35 L15,20 Z'
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    flag: '🇹🇿',
    phoneCode: '+255',
    currency: 'TZS',
    mapSvg: 'M40,25 L70,30 L75,45 L70,65 L60,85 L40,90 L20,85 L10,65 L5,45 L10,30 Z'
  },
  {
    code: 'RW',
    name: 'Rwanda',
    flag: '🇷🇼',
    phoneCode: '+250',
    currency: 'RWF',
    mapSvg: 'M35,30 L65,35 L70,50 L65,70 L50,80 L35,75 L20,70 L15,50 L20,35 Z'
  },
  {
    code: 'ET',
    name: 'Ethiopia',
    flag: '🇪🇹',
    phoneCode: '+251',
    currency: 'ETB',
    mapSvg: 'M30,10 L70,15 L80,30 L85,50 L75,70 L60,85 L40,90 L20,85 L10,70 L5,50 L10,30 L20,15 Z'
  },
  {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    phoneCode: '+233',
    currency: 'GHS',
    mapSvg: 'M25,25 L75,30 L80,45 L75,65 L65,80 L45,85 L25,80 L15,65 L10,45 L15,30 Z'
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    phoneCode: '+234',
    currency: 'NGN',
    mapSvg: 'M20,20 L80,25 L85,40 L80,60 L70,80 L50,85 L30,80 L15,60 L10,40 L15,25 Z'
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    phoneCode: '+27',
    currency: 'ZAR',
    mapSvg: 'M30,40 L70,45 L80,60 L75,80 L60,90 L40,85 L20,80 L10,60 L15,45 Z'
  }
];

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

export const getCountryByPhoneCode = (phoneCode: string): Country | undefined => {
  return countries.find(country => country.phoneCode === phoneCode);
};