export interface Ward {
  id: string;
  name: string;
  code?: string;
}

export interface SubCounty {
  id: string;
  name: string;
  code?: string;
  wards: Ward[];
}

export interface County {
  id: string;
  name: string;
  code: string;
  capital?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  subCounties: SubCounty[];
}

export const kenyanCountiesData: County[] = [
  {
    id: '001',
    name: 'Mombasa',
    code: '001',
    capital: 'Mombasa City',
    coordinates: { latitude: -4.0435, longitude: 39.6682 },
    subCounties: [
      {
        id: '001-01',
        name: 'Changamwe',
        wards: [
          { id: '001-01-01', name: 'Port Reitz' },
          { id: '001-01-02', name: 'Kipevu' },
          { id: '001-01-03', name: 'Airport' },
          { id: '001-01-04', name: 'Changamwe' },
          { id: '001-01-05', name: 'Chaani' },
        ],
      },
      {
        id: '001-02',
        name: 'Jomvu',
        wards: [
          { id: '001-02-01', name: 'Jomvu Kuu' },
          { id: '001-02-02', name: 'Miritini' },
          { id: '001-02-03', name: 'Mikindani' },
        ],
      },
      {
        id: '001-03',
        name: 'Kisauni',
        wards: [
          { id: '001-03-01', name: 'Mjambere' },
          { id: '001-03-02', name: 'Junda' },
          { id: '001-03-03', name: 'Bamburi' },
          { id: '001-03-04', name: 'Mwakirunge' },
          { id: '001-03-05', name: 'Mtopanga' },
          { id: '001-03-06', name: 'Magogoni' },
          { id: '001-03-07', name: 'Shanzu' },
        ],
      },
      {
        id: '001-04',
        name: 'Nyali',
        wards: [
          { id: '001-04-01', name: 'Frere Town' },
          { id: '001-04-02', name: 'Ziwa La Ng\'ombe' },
          { id: '001-04-03', name: 'Mkomani' },
          { id: '001-04-04', name: 'Kongowea' },
          { id: '001-04-05', name: 'Kadzandani' },
        ],
      },
      {
        id: '001-05',
        name: 'Likoni',
        wards: [
          { id: '001-05-01', name: 'Mtongwe' },
          { id: '001-05-02', name: 'Shika Adabu' },
          { id: '001-05-03', name: 'Bofu' },
          { id: '001-05-04', name: 'Likoni' },
          { id: '001-05-05', name: 'Timbwani' },
        ],
      },
      {
        id: '001-06',
        name: 'Mvita',
        wards: [
          { id: '001-06-01', name: 'Mji Wa Kale/Makadara' },
          { id: '001-06-02', name: 'Tudor' },
          { id: '001-06-03', name: 'Tononoka' },
          { id: '001-06-04', name: 'Shimanzi/Ganjoni' },
          { id: '001-06-05', name: 'Majengo' },
        ],
      },
    ],
  },
  {
    id: '002',
    name: 'Kwale',
    code: '002',
    capital: 'Kwale',
    coordinates: { latitude: -4.1742, longitude: 39.4520 },
    subCounties: [
      {
        id: '002-01',
        name: 'Msambweni',
        wards: [
          { id: '002-01-01', name: 'Gombato Bongwe' },
          { id: '002-01-02', name: 'Ukunda' },
          { id: '002-01-03', name: 'Kinondo' },
          { id: '002-01-04', name: 'Ramisi' },
        ],
      },
      {
        id: '002-02',
        name: 'Lunga Lunga',
        wards: [
          { id: '002-02-01', name: 'Vanga' },
          { id: '002-02-02', name: 'Lunga Lunga' },
          { id: '002-02-03', name: 'Pongwe/Kikoneni' },
        ],
      },
      {
        id: '002-03',
        name: 'Matuga',
        wards: [
          { id: '002-03-01', name: 'Tsimba Golini' },
          { id: '002-03-02', name: 'Waa' },
          { id: '002-03-03', name: 'Tiwi' },
          { id: '002-03-04', name: 'Kubo South' },
          { id: '002-03-05', name: 'Mkongani' },
        ],
      },
      {
        id: '002-04',
        name: 'Kinango',
        wards: [
          { id: '002-04-01', name: 'Puma' },
          { id: '002-04-02', name: 'Kinango' },
          { id: '002-04-03', name: 'Kasemeni' },
          { id: '002-04-04', name: 'Mackinnon Road' },
          { id: '002-04-05', name: 'Chengoni/Samburu' },
          { id: '002-04-06', name: 'Mwavumbo' },
        ],
      },
    ],
  },
  {
    id: '047',
    name: 'Nairobi',
    code: '047',
    capital: 'Nairobi City',
    coordinates: { latitude: -1.2921, longitude: 36.8219 },
    subCounties: [
      {
        id: '047-01',
        name: 'Westlands',
        wards: [
          { id: '047-01-01', name: 'Kitisuru' },
          { id: '047-01-02', name: 'Parklands/Highridge' },
          { id: '047-01-03', name: 'Karura' },
          { id: '047-01-04', name: 'Kangemi' },
          { id: '047-01-05', name: 'Mountain View' },
        ],
      },
      {
        id: '047-02',
        name: 'Dagoretti North',
        wards: [
          { id: '047-02-01', name: 'Kilimani' },
          { id: '047-02-02', name: 'Kawangware' },
          { id: '047-02-03', name: 'Gatina' },
          { id: '047-02-04', name: 'Kileleshwa' },
          { id: '047-02-05', name: 'Kabiro' },
        ],
      },
      {
        id: '047-03',
        name: 'Dagoretti South',
        wards: [
          { id: '047-03-01', name: 'Mutu-ini' },
          { id: '047-03-02', name: 'Ngando' },
          { id: '047-03-03', name: 'Riruta' },
          { id: '047-03-04', name: 'Uthiru/Ruthimitu' },
          { id: '047-03-05', name: 'Waithaka' },
        ],
      },
      {
        id: '047-04',
        name: 'Lang\'ata',
        wards: [
          { id: '047-04-01', name: 'Karen' },
          { id: '047-04-02', name: 'Nairobi West' },
          { id: '047-04-03', name: 'Mugumo-ini' },
          { id: '047-04-04', name: 'South C' },
          { id: '047-04-05', name: 'Nyayo Highrise' },
        ],
      },
      {
        id: '047-05',
        name: 'Kibra',
        wards: [
          { id: '047-05-01', name: 'Laini Saba' },
          { id: '047-05-02', name: 'Lindi' },
          { id: '047-05-03', name: 'Makina' },
          { id: '047-05-04', name: 'Woodley/Kenyatta Golf Course' },
          { id: '047-05-05', name: 'Sarang\'ombe' },
        ],
      },
      {
        id: '047-06',
        name: 'Roysambu',
        wards: [
          { id: '047-06-01', name: 'Githurai' },
          { id: '047-06-02', name: 'Kahawa West' },
          { id: '047-06-03', name: 'Zimmerman' },
          { id: '047-06-04', name: 'Roysambu' },
          { id: '047-06-05', name: 'Kahawa' },
        ],
      },
      {
        id: '047-07',
        name: 'Kasarani',
        wards: [
          { id: '047-07-01', name: 'Clay City' },
          { id: '047-07-02', name: 'Mwiki' },
          { id: '047-07-03', name: 'Kasarani' },
          { id: '047-07-04', name: 'Njiru' },
          { id: '047-07-05', name: 'Ruai' },
        ],
      },
      {
        id: '047-08',
        name: 'Ruaraka',
        wards: [
          { id: '047-08-01', name: 'Babadogo' },
          { id: '047-08-02', name: 'Utalii' },
          { id: '047-08-03', name: 'Mathare North' },
          { id: '047-08-04', name: 'Lucky Summer' },
          { id: '047-08-05', name: 'Korogocho' },
        ],
      },
      {
        id: '047-09',
        name: 'Embakasi South',
        wards: [
          { id: '047-09-01', name: 'Imara Daima' },
          { id: '047-09-02', name: 'Kwa Njenga' },
          { id: '047-09-03', name: 'Kwa Reuben' },
          { id: '047-09-04', name: 'Pipeline' },
          { id: '047-09-05', name: 'Kware' },
        ],
      },
      {
        id: '047-10',
        name: 'Embakasi North',
        wards: [
          { id: '047-10-01', name: 'Kariobangi North' },
          { id: '047-10-02', name: 'Dandora Area I' },
          { id: '047-10-03', name: 'Dandora Area II' },
          { id: '047-10-04', name: 'Dandora Area III' },
          { id: '047-10-05', name: 'Dandora Area IV' },
        ],
      },
      {
        id: '047-11',
        name: 'Embakasi Central',
        wards: [
          { id: '047-11-01', name: 'Kayole North' },
          { id: '047-11-02', name: 'Kayole Central' },
          { id: '047-11-03', name: 'Kayole South' },
          { id: '047-11-04', name: 'Komarock' },
          { id: '047-11-05', name: 'Matopeni/Spring Valley' },
        ],
      },
      {
        id: '047-12',
        name: 'Embakasi East',
        wards: [
          { id: '047-12-01', name: 'Upper Savannah' },
          { id: '047-12-02', name: 'Lower Savannah' },
          { id: '047-12-03', name: 'Embakasi' },
          { id: '047-12-04', name: 'Utawala' },
          { id: '047-12-05', name: 'Mihang\'o' },
        ],
      },
      {
        id: '047-13',
        name: 'Embakasi West',
        wards: [
          { id: '047-13-01', name: 'Umoja I' },
          { id: '047-13-02', name: 'Umoja II' },
          { id: '047-13-03', name: 'Mowlem' },
          { id: '047-13-04', name: 'Kariobangi South' },
        ],
      },
      {
        id: '047-14',
        name: 'Makadara',
        wards: [
          { id: '047-14-01', name: 'Maringo/Hamza' },
          { id: '047-14-02', name: 'Viwandani' },
          { id: '047-14-03', name: 'Harambee' },
          { id: '047-14-04', name: 'Makongeni' },
        ],
      },
      {
        id: '047-15',
        name: 'Kamukunji',
        wards: [
          { id: '047-15-01', name: 'Pumwani' },
          { id: '047-15-02', name: 'Eastleigh North' },
          { id: '047-15-03', name: 'Eastleigh South' },
          { id: '047-15-04', name: 'Airbase' },
          { id: '047-15-05', name: 'California' },
        ],
      },
      {
        id: '047-16',
        name: 'Starehe',
        wards: [
          { id: '047-16-01', name: 'Nairobi Central' },
          { id: '047-16-02', name: 'Ngara' },
          { id: '047-16-03', name: 'Pangani' },
          { id: '047-16-04', name: 'Ziwani/Kariokor' },
          { id: '047-16-05', name: 'Landimawe' },
          { id: '047-16-06', name: 'Nairobi South' },
        ],
      },
      {
        id: '047-17',
        name: 'Mathare',
        wards: [
          { id: '047-17-01', name: 'Hospital' },
          { id: '047-17-02', name: 'Mabatini' },
          { id: '047-17-03', name: 'Huruma' },
          { id: '047-17-04', name: 'Ngei' },
          { id: '047-17-05', name: 'Mlango Kubwa' },
          { id: '047-17-06', name: 'Kiamaiko' },
        ],
      },
    ],
  },
];

export const getAllCounties = (): County[] => {
  return kenyanCountiesData;
};

export const getCountyById = (id: string): County | undefined => {
  return kenyanCountiesData.find(county => county.id === id || county.code === id);
};

export const getCountyByName = (name: string): County | undefined => {
  return kenyanCountiesData.find(
    county => county.name.toLowerCase() === name.toLowerCase()
  );
};

export const getSubCountiesByCounty = (countyId: string): SubCounty[] => {
  const county = getCountyById(countyId);
  return county?.subCounties || [];
};

export const getWardsBySubCounty = (countyId: string, subCountyId: string): Ward[] => {
  const county = getCountyById(countyId);
  const subCounty = county?.subCounties.find(sc => sc.id === subCountyId);
  return subCounty?.wards || [];
};

export const searchLocations = (query: string): {
  counties: County[];
  subCounties: (SubCounty & { countyName: string })[];
  wards: (Ward & { countyName: string; subCountyName: string })[];
} => {
  const lowerQuery = query.toLowerCase();
  const results = {
    counties: [] as County[],
    subCounties: [] as (SubCounty & { countyName: string })[],
    wards: [] as (Ward & { countyName: string; subCountyName: string })[],
  };

  kenyanCountiesData.forEach(county => {
    if (county.name.toLowerCase().includes(lowerQuery)) {
      results.counties.push(county);
    }

    county.subCounties.forEach(subCounty => {
      if (subCounty.name.toLowerCase().includes(lowerQuery)) {
        results.subCounties.push({
          ...subCounty,
          countyName: county.name,
        });
      }

      subCounty.wards.forEach(ward => {
        if (ward.name.toLowerCase().includes(lowerQuery)) {
          results.wards.push({
            ...ward,
            countyName: county.name,
            subCountyName: subCounty.name,
          });
        }
      });
    });
  });

  return results;
};

export const getCountyNames = (): string[] => {
  return kenyanCountiesData.map(county => county.name);
};

export const getCountyCoordinates = (countyId: string) => {
  const county = getCountyById(countyId);
  return county?.coordinates;
};
