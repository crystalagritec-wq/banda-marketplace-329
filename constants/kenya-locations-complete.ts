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

export const kenyanCountiesComplete: County[] = [
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
    id: '003',
    name: 'Kilifi',
    code: '003',
    capital: 'Kilifi',
    coordinates: { latitude: -3.6309, longitude: 39.8493 },
    subCounties: [
      {
        id: '003-01',
        name: 'Kilifi North',
        wards: [
          { id: '003-01-01', name: 'Tezo' },
          { id: '003-01-02', name: 'Sokoke' },
          { id: '003-01-03', name: 'Ganze' },
          { id: '003-01-04', name: 'Jaribuni' },
        ],
      },
      {
        id: '003-02',
        name: 'Kilifi South',
        wards: [
          { id: '003-02-01', name: 'Junju' },
          { id: '003-02-02', name: 'Mwarakaya' },
          { id: '003-02-03', name: 'Shimo La Tewa' },
          { id: '003-02-04', name: 'Chasimba' },
        ],
      },
      {
        id: '003-03',
        name: 'Kaloleni',
        wards: [
          { id: '003-03-01', name: 'Mariakani' },
          { id: '003-03-02', name: 'Kaloleni' },
          { id: '003-03-03', name: 'Mwanamwinga' },
          { id: '003-03-04', name: 'Jibana' },
        ],
      },
      {
        id: '003-04',
        name: 'Rabai',
        wards: [
          { id: '003-04-01', name: 'Rabai/Kisurutini' },
          { id: '003-04-02', name: 'Ruruma' },
          { id: '003-04-03', name: 'Kambe/Ribe' },
          { id: '003-04-04', name: 'Mwawesa' },
        ],
      },
      {
        id: '003-05',
        name: 'Ganze',
        wards: [
          { id: '003-05-01', name: 'Bamba' },
          { id: '003-05-02', name: 'Ganze' },
          { id: '003-05-03', name: 'Jaribuni' },
        ],
      },
      {
        id: '003-06',
        name: 'Malindi',
        wards: [
          { id: '003-06-01', name: 'Malindi Town' },
          { id: '003-06-02', name: 'Shella' },
          { id: '003-06-03', name: 'Jilore' },
          { id: '003-06-04', name: 'Kakuyuni' },
          { id: '003-06-05', name: 'Ganda' },
        ],
      },
      {
        id: '003-07',
        name: 'Magarini',
        wards: [
          { id: '003-07-01', name: 'Marafa' },
          { id: '003-07-02', name: 'Magarini' },
          { id: '003-07-03', name: 'Gongoni' },
          { id: '003-07-04', name: 'Adu' },
          { id: '003-07-05', name: 'Garashi' },
        ],
      },
    ],
  },
  {
    id: '004',
    name: 'Tana River',
    code: '004',
    capital: 'Hola',
    coordinates: { latitude: -1.5000, longitude: 40.0000 },
    subCounties: [
      {
        id: '004-01',
        name: 'Garsen',
        wards: [
          { id: '004-01-01', name: 'Garsen South' },
          { id: '004-01-02', name: 'Garsen North' },
          { id: '004-01-03', name: 'Garsen Central' },
          { id: '004-01-04', name: 'Garsen West' },
        ],
      },
      {
        id: '004-02',
        name: 'Galole',
        wards: [
          { id: '004-02-01', name: 'Wayu' },
          { id: '004-02-02', name: 'Chewani' },
          { id: '004-02-03', name: 'Mikinduni' },
          { id: '004-02-04', name: 'Hirimani' },
        ],
      },
      {
        id: '004-03',
        name: 'Bura',
        wards: [
          { id: '004-03-01', name: 'Bura' },
          { id: '004-03-02', name: 'Bangale' },
          { id: '004-03-03', name: 'Chewele' },
          { id: '004-03-04', name: 'Madogo' },
        ],
      },
    ],
  },
  {
    id: '005',
    name: 'Lamu',
    code: '005',
    capital: 'Lamu',
    coordinates: { latitude: -2.2717, longitude: 40.9020 },
    subCounties: [
      {
        id: '005-01',
        name: 'Lamu East',
        wards: [
          { id: '005-01-01', name: 'Faza' },
          { id: '005-01-02', name: 'Kiunga' },
          { id: '005-01-03', name: 'Basuba' },
        ],
      },
      {
        id: '005-02',
        name: 'Lamu West',
        wards: [
          { id: '005-02-01', name: 'Witu' },
          { id: '005-02-02', name: 'Bahari' },
          { id: '005-02-03', name: 'Hindi' },
          { id: '005-02-04', name: 'Mkomani' },
        ],
      },
    ],
  },
  {
    id: '006',
    name: 'Taita Taveta',
    code: '006',
    capital: 'Voi',
    coordinates: { latitude: -3.3869, longitude: 38.5587 },
    subCounties: [
      {
        id: '006-01',
        name: 'Taveta',
        wards: [
          { id: '006-01-01', name: 'Bomeni' },
          { id: '006-01-02', name: 'Chala' },
          { id: '006-01-03', name: 'Mahoo' },
          { id: '006-01-04', name: 'Mboghoni' },
        ],
      },
      {
        id: '006-02',
        name: 'Wundanyi',
        wards: [
          { id: '006-02-01', name: 'Wundanyi/Mbale' },
          { id: '006-02-02', name: 'Mwanda/Mgange' },
          { id: '006-02-03', name: 'Werugha' },
          { id: '006-02-04', name: 'Wumingu/Kishushe' },
        ],
      },
      {
        id: '006-03',
        name: 'Mwatate',
        wards: [
          { id: '006-03-01', name: 'Mwatate' },
          { id: '006-03-02', name: 'Ronge' },
          { id: '006-03-03', name: 'Bura' },
          { id: '006-03-04', name: 'Chawia' },
        ],
      },
      {
        id: '006-04',
        name: 'Voi',
        wards: [
          { id: '006-04-01', name: 'Mbololo' },
          { id: '006-04-02', name: 'Sagalla' },
          { id: '006-04-03', name: 'Kaloleni' },
          { id: '006-04-04', name: 'Marungu' },
          { id: '006-04-05', name: 'Kasigau' },
        ],
      },
    ],
  },
  {
    id: '007',
    name: 'Garissa',
    code: '007',
    capital: 'Garissa',
    coordinates: { latitude: -0.4536, longitude: 39.6401 },
    subCounties: [
      {
        id: '007-01',
        name: 'Garissa Township',
        wards: [
          { id: '007-01-01', name: 'Galbet' },
          { id: '007-01-02', name: 'Waberi' },
          { id: '007-01-03', name: 'Township' },
          { id: '007-01-04', name: 'Iftin' },
        ],
      },
      {
        id: '007-02',
        name: 'Balambala',
        wards: [
          { id: '007-02-01', name: 'Balambala' },
          { id: '007-02-02', name: 'Saka' },
          { id: '007-02-03', name: 'Sankuri' },
        ],
      },
      {
        id: '007-03',
        name: 'Lagdera',
        wards: [
          { id: '007-03-01', name: 'Benane' },
          { id: '007-03-02', name: 'Goreale' },
          { id: '007-03-03', name: 'Sabena' },
          { id: '007-03-04', name: 'Modogashe' },
        ],
      },
      {
        id: '007-04',
        name: 'Dadaab',
        wards: [
          { id: '007-04-01', name: 'Dadaab' },
          { id: '007-04-02', name: 'Labasigale' },
          { id: '007-04-03', name: 'Dertu' },
          { id: '007-04-04', name: 'Abakaile' },
        ],
      },
      {
        id: '007-05',
        name: 'Fafi',
        wards: [
          { id: '007-05-01', name: 'Fafi' },
          { id: '007-05-02', name: 'Bura' },
          { id: '007-05-03', name: 'Dekaharia' },
          { id: '007-05-04', name: 'Jarajila' },
        ],
      },
      {
        id: '007-06',
        name: 'Ijara',
        wards: [
          { id: '007-06-01', name: 'Ijara' },
          { id: '007-06-02', name: 'Hulugho' },
          { id: '007-06-03', name: 'Sangailu' },
          { id: '007-06-04', name: 'Masalani' },
        ],
      },
    ],
  },
  {
    id: '008',
    name: 'Wajir',
    code: '008',
    capital: 'Wajir',
    coordinates: { latitude: 1.7471, longitude: 40.0573 },
    subCounties: [
      {
        id: '008-01',
        name: 'Wajir North',
        wards: [
          { id: '008-01-01', name: 'Batalu' },
          { id: '008-01-02', name: 'Tarbaj' },
          { id: '008-01-03', name: 'Wajir Bor' },
        ],
      },
      {
        id: '008-02',
        name: 'Wajir East',
        wards: [
          { id: '008-02-01', name: 'Barwago' },
          { id: '008-02-02', name: 'Khorof/Harar' },
          { id: '008-02-03', name: 'Wagberi' },
        ],
      },
      {
        id: '008-03',
        name: 'Tarbaj',
        wards: [
          { id: '008-03-01', name: 'Tarbaj' },
          { id: '008-03-02', name: 'Wajir Bor' },
          { id: '008-03-03', name: 'Elben' },
        ],
      },
      {
        id: '008-04',
        name: 'Wajir West',
        wards: [
          { id: '008-04-01', name: 'Hadado/Athibohol' },
          { id: '008-04-02', name: 'Ademasajide' },
          { id: '008-04-03', name: 'Ganyure/Wagalla' },
        ],
      },
      {
        id: '008-05',
        name: 'Eldas',
        wards: [
          { id: '008-05-01', name: 'Eldas' },
          { id: '008-05-02', name: 'Lakoley South/Basir' },
          { id: '008-05-03', name: 'Della' },
        ],
      },
      {
        id: '008-06',
        name: 'Wajir South',
        wards: [
          { id: '008-06-01', name: 'Habaswein' },
          { id: '008-06-02', name: 'Wajir South' },
          { id: '008-06-03', name: 'Diif' },
        ],
      },
    ],
  },
  {
    id: '009',
    name: 'Mandera',
    code: '009',
    capital: 'Mandera',
    coordinates: { latitude: 3.9366, longitude: 41.8670 },
    subCounties: [
      {
        id: '009-01',
        name: 'Mandera West',
        wards: [
          { id: '009-01-01', name: 'Takaba South' },
          { id: '009-01-02', name: 'Takaba' },
          { id: '009-01-03', name: 'Dandu' },
        ],
      },
      {
        id: '009-02',
        name: 'Banissa',
        wards: [
          { id: '009-02-01', name: 'Banissa' },
          { id: '009-02-02', name: 'Derkhale' },
          { id: '009-02-03', name: 'Guba' },
        ],
      },
      {
        id: '009-03',
        name: 'Mandera North',
        wards: [
          { id: '009-03-01', name: 'Ashabito' },
          { id: '009-03-02', name: 'Libehia' },
          { id: '009-03-03', name: 'Rhamu' },
        ],
      },
      {
        id: '009-04',
        name: 'Mandera South',
        wards: [
          { id: '009-04-01', name: 'Elwak South' },
          { id: '009-04-02', name: 'Elwak North' },
          { id: '009-04-03', name: 'Wargadud' },
        ],
      },
      {
        id: '009-05',
        name: 'Mandera East',
        wards: [
          { id: '009-05-01', name: 'Khalalio' },
          { id: '009-05-02', name: 'Neboi' },
          { id: '009-05-03', name: 'Kutulo' },
        ],
      },
      {
        id: '009-06',
        name: 'Lafey',
        wards: [
          { id: '009-06-01', name: 'Lafey' },
          { id: '009-06-02', name: 'Wayu' },
          { id: '009-06-03', name: 'Fino' },
        ],
      },
    ],
  },
  {
    id: '010',
    name: 'Marsabit',
    code: '010',
    capital: 'Marsabit',
    coordinates: { latitude: 2.3284, longitude: 37.9899 },
    subCounties: [
      {
        id: '010-01',
        name: 'Moyale',
        wards: [
          { id: '010-01-01', name: 'Moyale Township' },
          { id: '010-01-02', name: 'Uran' },
          { id: '010-01-03', name: 'Obbu' },
          { id: '010-01-04', name: 'Sololo' },
        ],
      },
      {
        id: '010-02',
        name: 'North Horr',
        wards: [
          { id: '010-02-01', name: 'North Horr' },
          { id: '010-02-02', name: 'Dukana' },
          { id: '010-02-03', name: 'Maikona' },
          { id: '010-02-04', name: 'Turbi' },
        ],
      },
      {
        id: '010-03',
        name: 'Saku',
        wards: [
          { id: '010-03-01', name: 'Marsabit Central' },
          { id: '010-03-02', name: 'Karare' },
          { id: '010-03-03', name: 'Sagante/Jaldesa' },
        ],
      },
      {
        id: '010-04',
        name: 'Laisamis',
        wards: [
          { id: '010-04-01', name: 'Laisamis' },
          { id: '010-04-02', name: 'Korr/Ngurunit' },
          { id: '010-04-03', name: 'Logologo' },
          { id: '010-04-04', name: 'Log Logo' },
        ],
      },
    ],
  },
  {
    id: '011',
    name: 'Isiolo',
    code: '011',
    capital: 'Isiolo',
    coordinates: { latitude: 0.3556, longitude: 37.5833 },
    subCounties: [
      {
        id: '011-01',
        name: 'Isiolo North',
        wards: [
          { id: '011-01-01', name: 'Bulla Pesa' },
          { id: '011-01-02', name: 'Cherab' },
          { id: '011-01-03', name: 'Wabera' },
        ],
      },
      {
        id: '011-02',
        name: 'Isiolo South',
        wards: [
          { id: '011-02-01', name: 'Kinna' },
          { id: '011-02-02', name: 'Garba Tulla' },
          { id: '011-02-03', name: 'Sericho' },
        ],
      },
    ],
  },
  {
    id: '012',
    name: 'Meru',
    code: '012',
    capital: 'Meru',
    coordinates: { latitude: 0.0469, longitude: 37.6553 },
    subCounties: [
      {
        id: '012-01',
        name: 'Imenti North',
        wards: [
          { id: '012-01-01', name: 'Nyaki West' },
          { id: '012-01-02', name: 'Nyaki East' },
          { id: '012-01-03', name: 'Ntima West' },
          { id: '012-01-04', name: 'Ntima East' },
        ],
      },
      {
        id: '012-02',
        name: 'Imenti Central',
        wards: [
          { id: '012-02-01', name: 'Abothuguchi Central' },
          { id: '012-02-02', name: 'Abothuguchi West' },
          { id: '012-02-03', name: 'Kiagu' },
          { id: '012-02-04', name: 'Mitunguu' },
        ],
      },
      {
        id: '012-03',
        name: 'Imenti South',
        wards: [
          { id: '012-03-01', name: 'Igoji East' },
          { id: '012-03-02', name: 'Igoji West' },
          { id: '012-03-03', name: 'Nkuene' },
          { id: '012-03-04', name: 'Abogeta East' },
        ],
      },
      {
        id: '012-04',
        name: 'Tigania West',
        wards: [
          { id: '012-04-01', name: 'Akithi' },
          { id: '012-04-02', name: 'Karama' },
          { id: '012-04-03', name: 'Mbeu' },
          { id: '012-04-04', name: 'Nkomo' },
        ],
      },
      {
        id: '012-05',
        name: 'Tigania East',
        wards: [
          { id: '012-05-01', name: 'Muthara' },
          { id: '012-05-02', name: 'Mikinduri' },
          { id: '012-05-03', name: 'Thangatha' },
          { id: '012-05-04', name: 'Akachiu' },
        ],
      },
      {
        id: '012-06',
        name: 'Igembe South',
        wards: [
          { id: '012-06-01', name: 'Kangeta' },
          { id: '012-06-02', name: 'Athiru Gaiti' },
          { id: '012-06-03', name: 'Akachiu' },
        ],
      },
      {
        id: '012-07',
        name: 'Igembe Central',
        wards: [
          { id: '012-07-01', name: 'Akirang\'ondu' },
          { id: '012-07-02', name: 'Athiru Ruujine' },
          { id: '012-07-03', name: 'Igembe East' },
        ],
      },
      {
        id: '012-08',
        name: 'Igembe North',
        wards: [
          { id: '012-08-01', name: 'Antubochiu' },
          { id: '012-08-02', name: 'Antuambui' },
          { id: '012-08-03', name: 'Naathu' },
        ],
      },
      {
        id: '012-09',
        name: 'Buuri',
        wards: [
          { id: '012-09-01', name: 'Timau' },
          { id: '012-09-02', name: 'Kisima' },
          { id: '012-09-03', name: 'Kibirichia' },
          { id: '012-09-04', name: 'Ruiri/Rwarera' },
        ],
      },
    ],
  },
  {
    id: '013',
    name: 'Tharaka Nithi',
    code: '013',
    capital: 'Chuka',
    coordinates: { latitude: -0.3347, longitude: 37.6486 },
    subCounties: [
      {
        id: '013-01',
        name: 'Maara',
        wards: [
          { id: '013-01-01', name: 'Chogoria' },
          { id: '013-01-02', name: 'Karingani' },
          { id: '013-01-03', name: 'Magumoni' },
          { id: '013-01-04', name: 'Mitheru' },
        ],
      },
      {
        id: '013-02',
        name: 'Chuka/Igambang\'ombe',
        wards: [
          { id: '013-02-01', name: 'Karingani' },
          { id: '013-02-02', name: 'Mariani' },
          { id: '013-02-03', name: 'Magumoni' },
          { id: '013-02-04', name: 'Mugwe' },
        ],
      },
      {
        id: '013-03',
        name: 'Tharaka',
        wards: [
          { id: '013-03-01', name: 'Gatunga' },
          { id: '013-03-02', name: 'Nkondi' },
          { id: '013-03-03', name: 'Chiakariga' },
          { id: '013-03-04', name: 'Marimanti' },
        ],
      },
    ],
  },
  {
    id: '014',
    name: 'Embu',
    code: '014',
    capital: 'Embu',
    coordinates: { latitude: -0.5310, longitude: 37.4570 },
    subCounties: [
      {
        id: '014-01',
        name: 'Manyatta',
        wards: [
          { id: '014-01-01', name: 'Gaturi South' },
          { id: '014-01-02', name: 'Gaturi North' },
          { id: '014-01-03', name: 'Kithimu' },
          { id: '014-01-04', name: 'Nginda' },
        ],
      },
      {
        id: '014-02',
        name: 'Runyenjes',
        wards: [
          { id: '014-02-01', name: 'Kyeni North' },
          { id: '014-02-02', name: 'Kyeni South' },
          { id: '014-02-03', name: 'Central' },
        ],
      },
      {
        id: '014-03',
        name: 'Mbeere South',
        wards: [
          { id: '014-03-01', name: 'Kiambere' },
          { id: '014-03-02', name: 'Mavuria' },
          { id: '014-03-03', name: 'Mbeti South' },
          { id: '014-03-04', name: 'Makima' },
        ],
      },
      {
        id: '014-04',
        name: 'Mbeere North',
        wards: [
          { id: '014-04-01', name: 'Muminji' },
          { id: '014-04-02', name: 'Evurore' },
          { id: '014-04-03', name: 'Nthawa' },
        ],
      },
    ],
  },
  {
    id: '015',
    name: 'Kitui',
    code: '015',
    capital: 'Kitui',
    coordinates: { latitude: -1.3667, longitude: 38.0167 },
    subCounties: [
      {
        id: '015-01',
        name: 'Mwingi North',
        wards: [
          { id: '015-01-01', name: 'Kyuso' },
          { id: '015-01-02', name: 'Mumoni' },
          { id: '015-01-03', name: 'Tseikuru' },
          { id: '015-01-04', name: 'Tharaka' },
        ],
      },
      {
        id: '015-02',
        name: 'Mwingi West',
        wards: [
          { id: '015-02-01', name: 'Kyome/Thaana' },
          { id: '015-02-02', name: 'Ngomeni' },
          { id: '015-02-03', name: 'Migwani' },
          { id: '015-02-04', name: 'Kiomo/Kyethani' },
        ],
      },
      {
        id: '015-03',
        name: 'Mwingi Central',
        wards: [
          { id: '015-03-01', name: 'Central' },
          { id: '015-03-02', name: 'Kivou' },
          { id: '015-03-03', name: 'Ngutani' },
          { id: '015-03-04', name: 'Nuu' },
        ],
      },
      {
        id: '015-04',
        name: 'Kitui West',
        wards: [
          { id: '015-04-01', name: 'Kauwi' },
          { id: '015-04-02', name: 'Matinyani' },
          { id: '015-04-03', name: 'Kwa Mutonga/Kithumula' },
        ],
      },
      {
        id: '015-05',
        name: 'Kitui Rural',
        wards: [
          { id: '015-05-01', name: 'Kisasi' },
          { id: '015-05-02', name: 'Mbitini' },
          { id: '015-05-03', name: 'Kwavonza/Yatta' },
        ],
      },
      {
        id: '015-06',
        name: 'Kitui Central',
        wards: [
          { id: '015-06-01', name: 'Township' },
          { id: '015-06-02', name: 'Kyangwithya West' },
          { id: '015-06-03', name: 'Kyangwithya East' },
          { id: '015-06-04', name: 'Miambani' },
        ],
      },
      {
        id: '015-07',
        name: 'Kitui East',
        wards: [
          { id: '015-07-01', name: 'Zombe/Mwitika' },
          { id: '015-07-02', name: 'Chuluni' },
          { id: '015-07-03', name: 'Nzambani' },
          { id: '015-07-04', name: 'Voo/Kyamatu' },
        ],
      },
      {
        id: '015-08',
        name: 'Kitui South',
        wards: [
          { id: '015-08-01', name: 'Ikanga/Kyatune' },
          { id: '015-08-02', name: 'Mutomo' },
          { id: '015-08-03', name: 'Mutha' },
          { id: '015-08-04', name: 'Ikutha' },
        ],
      },
    ],
  },
  {
    id: '016',
    name: 'Machakos',
    code: '016',
    capital: 'Machakos',
    coordinates: { latitude: -1.5177, longitude: 37.2634 },
    subCounties: [
      {
        id: '016-01',
        name: 'Masinga',
        wards: [
          { id: '016-01-01', name: 'Kivaa' },
          { id: '016-01-02', name: 'Masinga Central' },
          { id: '016-01-03', name: 'Ekalakala' },
          { id: '016-01-04', name: 'Muthesya' },
        ],
      },
      {
        id: '016-02',
        name: 'Yatta',
        wards: [
          { id: '016-02-01', name: 'Ikombe' },
          { id: '016-02-02', name: 'Katangi' },
          { id: '016-02-03', name: 'Kithimani' },
          { id: '016-02-04', name: 'Matungulu North' },
        ],
      },
      {
        id: '016-03',
        name: 'Kangundo',
        wards: [
          { id: '016-03-01', name: 'Kangundo North' },
          { id: '016-03-02', name: 'Kangundo Central' },
          { id: '016-03-03', name: 'Kangundo East' },
          { id: '016-03-04', name: 'Kangundo West' },
        ],
      },
      {
        id: '016-04',
        name: 'Matungulu',
        wards: [
          { id: '016-04-01', name: 'Tala' },
          { id: '016-04-02', name: 'Matungulu North' },
          { id: '016-04-03', name: 'Matungulu West' },
          { id: '016-04-04', name: 'Matungulu East' },
        ],
      },
      {
        id: '016-05',
        name: 'Kathiani',
        wards: [
          { id: '016-05-01', name: 'Kathiani' },
          { id: '016-05-02', name: 'Lower Kaewa/Iveti' },
          { id: '016-05-03', name: 'Upper Kaewa/Iveti' },
          { id: '016-05-04', name: 'Mitaboni' },
        ],
      },
      {
        id: '016-06',
        name: 'Mavoko',
        wards: [
          { id: '016-06-01', name: 'Athi River' },
          { id: '016-06-02', name: 'Kinanie' },
          { id: '016-06-03', name: 'Muthwani' },
          { id: '016-06-04', name: 'Syokimau/Mlolongo' },
        ],
      },
      {
        id: '016-07',
        name: 'Machakos Town',
        wards: [
          { id: '016-07-01', name: 'Machakos Central' },
          { id: '016-07-02', name: 'Mumbuni North' },
          { id: '016-07-03', name: 'Muvuti/Kiima-Kimwe' },
          { id: '016-07-04', name: 'Kola' },
        ],
      },
      {
        id: '016-08',
        name: 'Mwala',
        wards: [
          { id: '016-08-01', name: 'Mbiuni' },
          { id: '016-08-02', name: 'Wamunyu' },
          { id: '016-08-03', name: 'Mwala' },
          { id: '016-08-04', name: 'Kibauni' },
        ],
      },
    ],
  },
  {
    id: '017',
    name: 'Makueni',
    code: '017',
    capital: 'Wote',
    coordinates: { latitude: -1.8040, longitude: 37.6240 },
    subCounties: [
      {
        id: '017-01',
        name: 'Makueni',
        wards: [
          { id: '017-01-01', name: 'Wote' },
          { id: '017-01-02', name: 'Mavindini' },
          { id: '017-01-03', name: 'Kathonzweni' },
          { id: '017-01-04', name: 'Mbitini' },
        ],
      },
      {
        id: '017-02',
        name: 'Kibwezi West',
        wards: [
          { id: '017-02-01', name: 'Kikumbulyu North' },
          { id: '017-02-02', name: 'Kikumbulyu South' },
          { id: '017-02-03', name: 'Nguu/Masumba' },
          { id: '017-02-04', name: 'Emali/Mulala' },
        ],
      },
      {
        id: '017-03',
        name: 'Kibwezi East',
        wards: [
          { id: '017-03-01', name: 'Thange' },
          { id: '017-03-02', name: 'Ivingoni/Nzambani' },
          { id: '017-03-03', name: 'Masongaleni' },
        ],
      },
      {
        id: '017-04',
        name: 'Kilome',
        wards: [
          { id: '017-04-01', name: 'Kilome' },
          { id: '017-04-02', name: 'Kasikeu' },
          { id: '017-04-03', name: 'Mukaa' },
        ],
      },
      {
        id: '017-05',
        name: 'Kaiti',
        wards: [
          { id: '017-05-01', name: 'Ukia' },
          { id: '017-05-02', name: 'Kee' },
          { id: '017-05-03', name: 'Kilungu' },
          { id: '017-05-04', name: 'Ilima' },
        ],
      },
      {
        id: '017-06',
        name: 'Mbooni',
        wards: [
          { id: '017-06-01', name: 'Kalawa' },
          { id: '017-06-02', name: 'Mbooni' },
          { id: '017-06-03', name: 'Kithungo/Kitundu' },
          { id: '017-06-04', name: 'Waia/Kako' },
        ],
      },
    ],
  },
  {
    id: '018',
    name: 'Nyandarua',
    code: '018',
    capital: 'Ol Kalou',
    coordinates: { latitude: -0.2827, longitude: 36.3800 },
    subCounties: [
      {
        id: '018-01',
        name: 'Kinangop',
        wards: [
          { id: '018-01-01', name: 'Murungaru' },
          { id: '018-01-02', name: 'Njabini/Kiburu' },
          { id: '018-01-03', name: 'Nyakio' },
          { id: '018-01-04', name: 'Gathara' },
        ],
      },
      {
        id: '018-02',
        name: 'Kipipiri',
        wards: [
          { id: '018-02-01', name: 'Wanjohi' },
          { id: '018-02-02', name: 'Kipipiri' },
          { id: '018-02-03', name: 'Geta' },
        ],
      },
      {
        id: '018-03',
        name: 'Ol Kalou',
        wards: [
          { id: '018-03-01', name: 'Karau' },
          { id: '018-03-02', name: 'Rurii' },
          { id: '018-03-03', name: 'Mirangine' },
          { id: '018-03-04', name: 'Kaimbaga' },
        ],
      },
      {
        id: '018-04',
        name: 'Ol Jorok',
        wards: [
          { id: '018-04-01', name: 'Weru' },
          { id: '018-04-02', name: 'Charagita' },
          { id: '018-04-03', name: 'Gathanji' },
        ],
      },
      {
        id: '018-05',
        name: 'Ndaragwa',
        wards: [
          { id: '018-05-01', name: 'Leshau/Pondo' },
          { id: '018-05-02', name: 'Kiriita' },
          { id: '018-05-03', name: 'Central' },
          { id: '018-05-04', name: 'Shamata' },
        ],
      },
    ],
  },
  {
    id: '019',
    name: 'Nyeri',
    code: '019',
    capital: 'Nyeri',
    coordinates: { latitude: -0.4197, longitude: 36.9475 },
    subCounties: [
      {
        id: '019-01',
        name: 'Tetu',
        wards: [
          { id: '019-01-01', name: 'Dedan Kimathi' },
          { id: '019-01-02', name: 'Wamagana' },
          { id: '019-01-03', name: 'Aguthi/Gaaki' },
        ],
      },
      {
        id: '019-02',
        name: 'Kieni',
        wards: [
          { id: '019-02-01', name: 'Gatarakwa' },
          { id: '019-02-02', name: 'Naromoru/Kiamathaga' },
          { id: '019-02-03', name: 'Mweiga' },
          { id: '019-02-04', name: 'Mugunda' },
        ],
      },
      {
        id: '019-03',
        name: 'Mathira',
        wards: [
          { id: '019-03-01', name: 'Magutu' },
          { id: '019-03-02', name: 'Iriaini' },
          { id: '019-03-03', name: 'Konyu' },
          { id: '019-03-04', name: 'Ruguru' },
        ],
      },
      {
        id: '019-04',
        name: 'Othaya',
        wards: [
          { id: '019-04-01', name: 'Karima' },
          { id: '019-04-02', name: 'Iria-ini' },
          { id: '019-04-03', name: 'Mahiga' },
          { id: '019-04-04', name: 'Chinga' },
        ],
      },
      {
        id: '019-05',
        name: 'Mukurweini',
        wards: [
          { id: '019-05-01', name: 'Gikondi' },
          { id: '019-05-02', name: 'Rugi' },
          { id: '019-05-03', name: 'Mukurwe-ini West' },
          { id: '019-05-04', name: 'Mukurwe-ini Central' },
        ],
      },
      {
        id: '019-06',
        name: 'Nyeri Town',
        wards: [
          { id: '019-06-01', name: 'Rware' },
          { id: '019-06-02', name: 'Gatitu/Muruguru' },
          { id: '019-06-03', name: 'Ruring\'u' },
          { id: '019-06-04', name: 'Kamakwa/Mukaro' },
        ],
      },
    ],
  },
  {
    id: '020',
    name: 'Kirinyaga',
    code: '020',
    capital: 'Kerugoya',
    coordinates: { latitude: -0.6599, longitude: 37.3826 },
    subCounties: [
      {
        id: '020-01',
        name: 'Mwea',
        wards: [
          { id: '020-01-01', name: 'Mutithi' },
          { id: '020-01-02', name: 'Kangai' },
          { id: '020-01-03', name: 'Thiba' },
          { id: '020-01-04', name: 'Wamumu' },
        ],
      },
      {
        id: '020-02',
        name: 'Gichugu',
        wards: [
          { id: '020-02-01', name: 'Baragwi' },
          { id: '020-02-02', name: 'Njukiini' },
          { id: '020-02-03', name: 'Ngariama' },
          { id: '020-02-04', name: 'Karumandi' },
        ],
      },
      {
        id: '020-03',
        name: 'Ndia',
        wards: [
          { id: '020-03-01', name: 'Kiine' },
          { id: '020-03-02', name: 'Kariti' },
          { id: '020-03-03', name: 'Mukure' },
        ],
      },
      {
        id: '020-04',
        name: 'Kirinyaga Central',
        wards: [
          { id: '020-04-01', name: 'Mutira' },
          { id: '020-04-02', name: 'Kanyekini' },
          { id: '020-04-03', name: 'Kerugoya' },
          { id: '020-04-04', name: 'Inoi' },
        ],
      },
    ],
  },
  {
    id: '021',
    name: 'Murang\'a',
    code: '021',
    capital: 'Murang\'a',
    coordinates: { latitude: -0.7167, longitude: 37.1500 },
    subCounties: [
      {
        id: '021-01',
        name: 'Kangema',
        wards: [
          { id: '021-01-01', name: 'Kanyenya-ini' },
          { id: '021-01-02', name: 'Muguru' },
          { id: '021-01-03', name: 'Rwathia' },
        ],
      },
      {
        id: '021-02',
        name: 'Mathioya',
        wards: [
          { id: '021-02-01', name: 'Kiru' },
          { id: '021-02-02', name: 'Kamacharia' },
          { id: '021-02-03', name: 'Muguru' },
        ],
      },
      {
        id: '021-03',
        name: 'Kiharu',
        wards: [
          { id: '021-03-01', name: 'Wangu' },
          { id: '021-03-02', name: 'Mugoiri' },
          { id: '021-03-03', name: 'Mbiri' },
          { id: '021-03-04', name: 'Township' },
        ],
      },
      {
        id: '021-04',
        name: 'Kigumo',
        wards: [
          { id: '021-04-01', name: 'Kinyona' },
          { id: '021-04-02', name: 'Kigumo' },
          { id: '021-04-03', name: 'Kahumbu' },
          { id: '021-04-04', name: 'Muthithi' },
        ],
      },
      {
        id: '021-05',
        name: 'Maragwa',
        wards: [
          { id: '021-05-01', name: 'Makuyu' },
          { id: '021-05-02', name: 'Kambiti' },
          { id: '021-05-03', name: 'Kamahuha' },
          { id: '021-05-04', name: 'Ichagaki' },
        ],
      },
      {
        id: '021-06',
        name: 'Kandara',
        wards: [
          { id: '021-06-01', name: 'Ng\'araria' },
          { id: '021-06-02', name: 'Muruka' },
          { id: '021-06-03', name: 'Kagundu-ini' },
          { id: '021-06-04', name: 'Ithanga' },
        ],
      },
      {
        id: '021-07',
        name: 'Gatanga',
        wards: [
          { id: '021-07-01', name: 'Kariara' },
          { id: '021-07-02', name: 'Kakuzi/Mitubiri' },
          { id: '021-07-03', name: 'Mukarara' },
          { id: '021-07-04', name: 'Gatanga' },
        ],
      },
    ],
  },
  {
    id: '022',
    name: 'Kiambu',
    code: '022',
    capital: 'Kiambu',
    coordinates: { latitude: -1.1714, longitude: 36.8356 },
    subCounties: [
      {
        id: '022-01',
        name: 'Gatundu South',
        wards: [
          { id: '022-01-01', name: 'Kiamwangi' },
          { id: '022-01-02', name: 'Kiganjo' },
          { id: '022-01-03', name: 'Ndarugu' },
          { id: '022-01-04', name: 'Ngenda' },
        ],
      },
      {
        id: '022-02',
        name: 'Gatundu North',
        wards: [
          { id: '022-02-01', name: 'Githobokoni' },
          { id: '022-02-02', name: 'Chania' },
          { id: '022-02-03', name: 'Mang\'u' },
        ],
      },
      {
        id: '022-03',
        name: 'Juja',
        wards: [
          { id: '022-03-01', name: 'Murera' },
          { id: '022-03-02', name: 'Theta' },
          { id: '022-03-03', name: 'Juja' },
          { id: '022-03-04', name: 'Witeithie' },
        ],
      },
      {
        id: '022-04',
        name: 'Thika Town',
        wards: [
          { id: '022-04-01', name: 'Township' },
          { id: '022-04-02', name: 'Kamenu' },
          { id: '022-04-03', name: 'Hospital' },
          { id: '022-04-04', name: 'Gatuanyaga' },
        ],
      },
      {
        id: '022-05',
        name: 'Ruiru',
        wards: [
          { id: '022-05-01', name: 'Biashara' },
          { id: '022-05-02', name: 'Gatongora' },
          { id: '022-05-03', name: 'Kahawa Sukari' },
          { id: '022-05-04', name: 'Kahawa Wendani' },
          { id: '022-05-05', name: 'Kiuu' },
        ],
      },
      {
        id: '022-06',
        name: 'Githunguri',
        wards: [
          { id: '022-06-01', name: 'Githunguri' },
          { id: '022-06-02', name: 'Githiga' },
          { id: '022-06-03', name: 'Ikinu' },
          { id: '022-06-04', name: 'Ngewa' },
        ],
      },
      {
        id: '022-07',
        name: 'Kiambu',
        wards: [
          { id: '022-07-01', name: 'Ting\'ang\'a' },
          { id: '022-07-02', name: 'Ndumberi' },
          { id: '022-07-03', name: 'Riabai' },
          { id: '022-07-04', name: 'Township' },
        ],
      },
      {
        id: '022-08',
        name: 'Kiambaa',
        wards: [
          { id: '022-08-01', name: 'Cianda' },
          { id: '022-08-02', name: 'Karuri' },
          { id: '022-08-03', name: 'Ndenderu' },
          { id: '022-08-04', name: 'Muchatha' },
        ],
      },
      {
        id: '022-09',
        name: 'Kabete',
        wards: [
          { id: '022-09-01', name: 'Gitaru' },
          { id: '022-09-02', name: 'Muguga' },
          { id: '022-09-03', name: 'Nyadhuna' },
          { id: '022-09-04', name: 'Kabete' },
        ],
      },
      {
        id: '022-10',
        name: 'Kikuyu',
        wards: [
          { id: '022-10-01', name: 'Karai' },
          { id: '022-10-02', name: 'Nachu' },
          { id: '022-10-03', name: 'Sigona' },
          { id: '022-10-04', name: 'Kikuyu' },
        ],
      },
      {
        id: '022-11',
        name: 'Limuru',
        wards: [
          { id: '022-11-01', name: 'Bibirioni' },
          { id: '022-11-02', name: 'Limuru Central' },
          { id: '022-11-03', name: 'Ndeiya' },
          { id: '022-11-04', name: 'Limuru East' },
        ],
      },
      {
        id: '022-12',
        name: 'Lari',
        wards: [
          { id: '022-12-01', name: 'Kinale' },
          { id: '022-12-02', name: 'Kijabe' },
          { id: '022-12-03', name: 'Nyanduma' },
          { id: '022-12-04', name: 'Kamburu' },
        ],
      },
    ],
  },
  {
    id: '023',
    name: 'Turkana',
    code: '023',
    capital: 'Lodwar',
    coordinates: { latitude: 3.1190, longitude: 35.5977 },
    subCounties: [
      {
        id: '023-01',
        name: 'Turkana North',
        wards: [
          { id: '023-01-01', name: 'Kaeris' },
          { id: '023-01-02', name: 'Nakalale' },
          { id: '023-01-03', name: 'Kibish' },
          { id: '023-01-04', name: 'Lapur' },
        ],
      },
      {
        id: '023-02',
        name: 'Turkana West',
        wards: [
          { id: '023-02-01', name: 'Kakuma' },
          { id: '023-02-02', name: 'Lopur' },
          { id: '023-02-03', name: 'Letea' },
          { id: '023-02-04', name: 'Songot' },
        ],
      },
      {
        id: '023-03',
        name: 'Loima',
        wards: [
          { id: '023-03-01', name: 'Kotaruk/Lobei' },
          { id: '023-03-02', name: 'Turkwel' },
          { id: '023-03-03', name: 'Loima' },
          { id: '023-03-04', name: 'Lokiriama/Lorengippi' },
        ],
      },
      {
        id: '023-04',
        name: 'Turkana Central',
        wards: [
          { id: '023-04-01', name: 'Kalokol' },
          { id: '023-04-02', name: 'Lodwar Township' },
          { id: '023-04-03', name: 'Kanamkemer' },
          { id: '023-04-04', name: 'Kotaruk' },
        ],
      },
      {
        id: '023-05',
        name: 'Loiyangalani',
        wards: [
          { id: '023-05-01', name: 'Loiyangalani' },
          { id: '023-05-02', name: 'North Horr' },
          { id: '023-05-03', name: 'Kargi/South Horr' },
        ],
      },
      {
        id: '023-06',
        name: 'Turkana South',
        wards: [
          { id: '023-06-01', name: 'Kaputir' },
          { id: '023-06-02', name: 'Katilu' },
          { id: '023-06-03', name: 'Lobokat' },
          { id: '023-06-04', name: 'Kalapata' },
        ],
      },
      {
        id: '023-07',
        name: 'Turkana East',
        wards: [
          { id: '023-07-01', name: 'Kapedo/Napeitom' },
          { id: '023-07-02', name: 'Katilia' },
          { id: '023-07-03', name: 'Lokori/Kochodin' },
        ],
      },
    ],
  },
  {
    id: '024',
    name: 'West Pokot',
    code: '024',
    capital: 'Kapenguria',
    coordinates: { latitude: 1.2381, longitude: 35.1119 },
    subCounties: [
      {
        id: '024-01',
        name: 'Kapenguria',
        wards: [
          { id: '024-01-01', name: 'Riwo' },
          { id: '024-01-02', name: 'Kapenguria' },
          { id: '024-01-03', name: 'Mnagei' },
          { id: '024-01-04', name: 'Siyoi' },
        ],
      },
      {
        id: '024-02',
        name: 'Sigor',
        wards: [
          { id: '024-02-01', name: 'Sekerr' },
          { id: '024-02-02', name: 'Masool' },
          { id: '024-02-03', name: 'Lomut' },
          { id: '024-02-04', name: 'Weiwei' },
        ],
      },
      {
        id: '024-03',
        name: 'Kacheliba',
        wards: [
          { id: '024-03-01', name: 'Suam' },
          { id: '024-03-02', name: 'Kodich' },
          { id: '024-03-03', name: 'Kasei' },
          { id: '024-03-04', name: 'Kapchok' },
        ],
      },
      {
        id: '024-04',
        name: 'Pokot South',
        wards: [
          { id: '024-04-01', name: 'Chepareria' },
          { id: '024-04-02', name: 'Batei' },
          { id: '024-04-03', name: 'Lelan' },
          { id: '024-04-04', name: 'Tapach' },
        ],
      },
    ],
  },
  {
    id: '025',
    name: 'Samburu',
    code: '025',
    capital: 'Maralal',
    coordinates: { latitude: 1.0961, longitude: 36.9720 },
    subCounties: [
      {
        id: '025-01',
        name: 'Samburu North',
        wards: [
          { id: '025-01-01', name: 'El-Barta' },
          { id: '025-01-02', name: 'Nachola' },
          { id: '025-01-03', name: 'Ndoto' },
          { id: '025-01-04', name: 'Nyiro' },
        ],
      },
      {
        id: '025-02',
        name: 'Samburu West',
        wards: [
          { id: '025-02-01', name: 'Lodokejek' },
          { id: '025-02-02', name: 'Suguta Marmar' },
          { id: '025-02-03', name: 'Maralal' },
          { id: '025-02-04', name: 'Loosuk' },
        ],
      },
      {
        id: '025-03',
        name: 'Samburu East',
        wards: [
          { id: '025-03-01', name: 'Waso' },
          { id: '025-03-02', name: 'Wamba West' },
          { id: '025-03-03', name: 'Wamba East' },
          { id: '025-03-04', name: 'Wamba North' },
        ],
      },
    ],
  },
  {
    id: '026',
    name: 'Trans Nzoia',
    code: '026',
    capital: 'Kitale',
    coordinates: { latitude: 1.0194, longitude: 34.9597 },
    subCounties: [
      {
        id: '026-01',
        name: 'Kwanza',
        wards: [
          { id: '026-01-01', name: 'Kapomboi' },
          { id: '026-01-02', name: 'Kwanza' },
          { id: '026-01-03', name: 'Keiyo' },
          { id: '026-01-04', name: 'Bidii' },
        ],
      },
      {
        id: '026-02',
        name: 'Endebess',
        wards: [
          { id: '026-02-01', name: 'Chepchoina' },
          { id: '026-02-02', name: 'Endebess' },
          { id: '026-02-03', name: 'Matumbei' },
        ],
      },
      {
        id: '026-03',
        name: 'Saboti',
        wards: [
          { id: '026-03-01', name: 'Kinyoro' },
          { id: '026-03-02', name: 'Matisi' },
          { id: '026-03-03', name: 'Tuwani' },
          { id: '026-03-04', name: 'Saboti' },
        ],
      },
      {
        id: '026-04',
        name: 'Kiminini',
        wards: [
          { id: '026-04-01', name: 'Kiminini' },
          { id: '026-04-02', name: 'Waitaluk' },
          { id: '026-04-03', name: 'Sirende' },
          { id: '026-04-04', name: 'Hospital' },
        ],
      },
      {
        id: '026-05',
        name: 'Cherangany',
        wards: [
          { id: '026-05-01', name: 'Chepsiro/Kiptoror' },
          { id: '026-05-02', name: 'Cherangany/Suwerwa' },
          { id: '026-05-03', name: 'Motosiet' },
          { id: '026-05-04', name: 'Kaplamai' },
        ],
      },
    ],
  },
  {
    id: '027',
    name: 'Uasin Gishu',
    code: '027',
    capital: 'Eldoret',
    coordinates: { latitude: 0.5143, longitude: 35.2698 },
    subCounties: [
      {
        id: '027-01',
        name: 'Soy',
        wards: [
          { id: '027-01-01', name: 'Soy' },
          { id: '027-01-02', name: 'Kuinet/Kapsuswa' },
          { id: '027-01-03', name: 'Kaptagat' },
          { id: '027-01-04', name: 'Ziwa' },
        ],
      },
      {
        id: '027-02',
        name: 'Turbo',
        wards: [
          { id: '027-02-01', name: 'Huruma' },
          { id: '027-02-02', name: 'Ngenyilel' },
          { id: '027-02-03', name: 'Tapsagoi' },
          { id: '027-02-04', name: 'Kamagut' },
        ],
      },
      {
        id: '027-03',
        name: 'Moiben',
        wards: [
          { id: '027-03-01', name: 'Tembelio' },
          { id: '027-03-02', name: 'Sergoit' },
          { id: '027-03-03', name: 'Karuna/Meibeki' },
          { id: '027-03-04', name: 'Moiben' },
        ],
      },
      {
        id: '027-04',
        name: 'Ainabkoi',
        wards: [
          { id: '027-04-01', name: 'Kapsoya' },
          { id: '027-04-02', name: 'Kaptagat' },
          { id: '027-04-03', name: 'Ainabkoi/Olare' },
        ],
      },
      {
        id: '027-05',
        name: 'Kapseret',
        wards: [
          { id: '027-05-01', name: 'Simat/Kapseret' },
          { id: '027-05-02', name: 'Kipkenyo' },
          { id: '027-05-03', name: 'Ngeria' },
          { id: '027-05-04', name: 'Megun' },
        ],
      },
      {
        id: '027-06',
        name: 'Kesses',
        wards: [
          { id: '027-06-01', name: 'Racecourse' },
          { id: '027-06-02', name: 'Cheptiret/Kipchamo' },
          { id: '027-06-03', name: 'Tulwet/Chuiyat' },
          { id: '027-06-04', name: 'Tarakwa' },
        ],
      },
    ],
  },
  {
    id: '028',
    name: 'Elgeyo Marakwet',
    code: '028',
    capital: 'Iten',
    coordinates: { latitude: 0.6697, longitude: 35.5080 },
    subCounties: [
      {
        id: '028-01',
        name: 'Marakwet East',
        wards: [
          { id: '028-01-01', name: 'Kapyego' },
          { id: '028-01-02', name: 'Sambirir' },
          { id: '028-01-03', name: 'Endo' },
          { id: '028-01-04', name: 'Embobut/Embulot' },
        ],
      },
      {
        id: '028-02',
        name: 'Marakwet West',
        wards: [
          { id: '028-02-01', name: 'Kapsowar' },
          { id: '028-02-02', name: 'Lelan' },
          { id: '028-02-03', name: 'Sengwer' },
          { id: '028-02-04', name: 'Cherang\'any/Chebororwa' },
        ],
      },
      {
        id: '028-03',
        name: 'Keiyo North',
        wards: [
          { id: '028-03-01', name: 'Emsoo' },
          { id: '028-03-02', name: 'Kamariny' },
          { id: '028-03-03', name: 'Kapchemutwa' },
          { id: '028-03-04', name: 'Tambach' },
        ],
      },
      {
        id: '028-04',
        name: 'Keiyo South',
        wards: [
          { id: '028-04-01', name: 'Kaptarakwa' },
          { id: '028-04-02', name: 'Chepkorio' },
          { id: '028-04-03', name: 'Soy North' },
          { id: '028-04-04', name: 'Soy South' },
        ],
      },
    ],
  },
  {
    id: '029',
    name: 'Nandi',
    code: '029',
    capital: 'Kapsabet',
    coordinates: { latitude: 0.1769, longitude: 35.1028 },
    subCounties: [
      {
        id: '029-01',
        name: 'Tinderet',
        wards: [
          { id: '029-01-01', name: 'Songhor/Soba' },
          { id: '029-01-02', name: 'Tindiret' },
          { id: '029-01-03', name: 'Chemelil/Chemase' },
        ],
      },
      {
        id: '029-02',
        name: 'Aldai',
        wards: [
          { id: '029-02-01', name: 'Kabisaga' },
          { id: '029-02-02', name: 'Kaptumo/Kaboi' },
          { id: '029-02-03', name: 'Koyo/Ndurio' },
          { id: '029-02-04', name: 'Terik' },
        ],
      },
      {
        id: '029-03',
        name: 'Nandi Hills',
        wards: [
          { id: '029-03-01', name: 'Nandi Hills' },
          { id: '029-03-02', name: 'Chepkunyuk' },
          { id: '029-03-03', name: 'Ol\'Lessos' },
        ],
      },
      {
        id: '029-04',
        name: 'Chesumei',
        wards: [
          { id: '029-04-01', name: 'Kaptel/Kamoiywo' },
          { id: '029-04-02', name: 'Kiptuya' },
          { id: '029-04-03', name: 'Kosirai' },
          { id: '029-04-04', name: 'Lelmokwo/Ngechek' },
        ],
      },
      {
        id: '029-05',
        name: 'Emgwen',
        wards: [
          { id: '029-05-01', name: 'Chepkumia' },
          { id: '029-05-02', name: 'Kapkangani' },
          { id: '029-05-03', name: 'Kapsabet' },
          { id: '029-05-04', name: 'Kilibwoni' },
        ],
      },
      {
        id: '029-06',
        name: 'Mosop',
        wards: [
          { id: '029-06-01', name: 'Kabiyet' },
          { id: '029-06-02', name: 'Ndalat' },
          { id: '029-06-03', name: 'Kabwareng' },
          { id: '029-06-04', name: 'Mosop' },
        ],
      },
    ],
  },
  {
    id: '030',
    name: 'Baringo',
    code: '030',
    capital: 'Kabarnet',
    coordinates: { latitude: 0.4917, longitude: 36.0833 },
    subCounties: [
      {
        id: '030-01',
        name: 'Tiaty',
        wards: [
          { id: '030-01-01', name: 'Tirioko' },
          { id: '030-01-02', name: 'Kolowa' },
          { id: '030-01-03', name: 'Ribkwo' },
          { id: '030-01-04', name: 'Silale' },
        ],
      },
      {
        id: '030-02',
        name: 'Baringo North',
        wards: [
          { id: '030-02-01', name: 'Barwessa' },
          { id: '030-02-02', name: 'Kabartonjo' },
          { id: '030-02-03', name: 'Saimo/Kipsaraman' },
          { id: '030-02-04', name: 'Saimo/Soi' },
        ],
      },
      {
        id: '030-03',
        name: 'Baringo Central',
        wards: [
          { id: '030-03-01', name: 'Kabarnet' },
          { id: '030-03-02', name: 'Sacho' },
          { id: '030-03-03', name: 'Tenges' },
          { id: '030-03-04', name: 'Ewalel/Chapchap' },
        ],
      },
      {
        id: '030-04',
        name: 'Baringo South',
        wards: [
          { id: '030-04-01', name: 'Marigat' },
          { id: '030-04-02', name: 'Ilchamus' },
          { id: '030-04-03', name: 'Mochongoi' },
          { id: '030-04-04', name: 'Mukutani' },
        ],
      },
      {
        id: '030-05',
        name: 'Mogotio',
        wards: [
          { id: '030-05-01', name: 'Mogotio' },
          { id: '030-05-02', name: 'Emining' },
          { id: '030-05-03', name: 'Kisanana' },
        ],
      },
      {
        id: '030-06',
        name: 'Eldama Ravine',
        wards: [
          { id: '030-06-01', name: 'Lembus' },
          { id: '030-06-02', name: 'Lembus Kwen' },
          { id: '030-06-03', name: 'Ravine' },
          { id: '030-06-04', name: 'Koibatek' },
        ],
      },
    ],
  },
  {
    id: '031',
    name: 'Laikipia',
    code: '031',
    capital: 'Rumuruti',
    coordinates: { latitude: 0.3667, longitude: 36.7833 },
    subCounties: [
      {
        id: '031-01',
        name: 'Laikipia West',
        wards: [
          { id: '031-01-01', name: 'Sosian' },
          { id: '031-01-02', name: 'Segera' },
          { id: '031-01-03', name: 'Mukogodo West' },
          { id: '031-01-04', name: 'Mukogodo East' },
        ],
      },
      {
        id: '031-02',
        name: 'Laikipia East',
        wards: [
          { id: '031-02-01', name: 'Nanyuki' },
          { id: '031-02-02', name: 'Tigithi' },
          { id: '031-02-03', name: 'Thingithu' },
          { id: '031-02-04', name: 'Ngobit' },
        ],
      },
      {
        id: '031-03',
        name: 'Laikipia North',
        wards: [
          { id: '031-03-01', name: 'Rumuruti Township' },
          { id: '031-03-02', name: 'Rumuruti' },
          { id: '031-03-03', name: 'Igwamiti' },
          { id: '031-03-04', name: 'Marmanet' },
        ],
      },
    ],
  },
  {
    id: '032',
    name: 'Nakuru',
    code: '032',
    capital: 'Nakuru',
    coordinates: { latitude: -0.3031, longitude: 36.0800 },
    subCounties: [
      {
        id: '032-01',
        name: 'Molo',
        wards: [
          { id: '032-01-01', name: 'Molo' },
          { id: '032-01-02', name: 'Turi' },
          { id: '032-01-03', name: 'Elburgon' },
          { id: '032-01-04', name: 'Mariashoni' },
        ],
      },
      {
        id: '032-02',
        name: 'Njoro',
        wards: [
          { id: '032-02-01', name: 'Mauche' },
          { id: '032-02-02', name: 'Mau Narok' },
          { id: '032-02-03', name: 'Njoro' },
          { id: '032-02-04', name: 'Nessuit' },
        ],
      },
      {
        id: '032-03',
        name: 'Naivasha',
        wards: [
          { id: '032-03-01', name: 'Naivasha East' },
          { id: '032-03-02', name: 'Viwandani' },
          { id: '032-03-03', name: 'Hells Gate' },
          { id: '032-03-04', name: 'Mai Mahiu' },
        ],
      },
      {
        id: '032-04',
        name: 'Gilgil',
        wards: [
          { id: '032-04-01', name: 'Gilgil' },
          { id: '032-04-02', name: 'Elementaita' },
          { id: '032-04-03', name: 'Mbaruk/Eburu' },
          { id: '032-04-04', name: 'Malewa West' },
        ],
      },
      {
        id: '032-05',
        name: 'Kuresoi South',
        wards: [
          { id: '032-05-01', name: 'Amalo' },
          { id: '032-05-02', name: 'Keringet' },
          { id: '032-05-03', name: 'Kiptagich' },
          { id: '032-05-04', name: 'Tinet' },
        ],
      },
      {
        id: '032-06',
        name: 'Kuresoi North',
        wards: [
          { id: '032-06-01', name: 'Kiptororo' },
          { id: '032-06-02', name: 'Nyota' },
          { id: '032-06-03', name: 'Sirikwa' },
          { id: '032-06-04', name: 'Kamara' },
        ],
      },
      {
        id: '032-07',
        name: 'Subukia',
        wards: [
          { id: '032-07-01', name: 'Subukia' },
          { id: '032-07-02', name: 'Waseges' },
          { id: '032-07-03', name: 'Kabazi' },
        ],
      },
      {
        id: '032-08',
        name: 'Rongai',
        wards: [
          { id: '032-08-01', name: 'Menengai West' },
          { id: '032-08-02', name: 'Soin' },
          { id: '032-08-03', name: 'Visoi' },
          { id: '032-08-04', name: 'Mosop' },
        ],
      },
      {
        id: '032-09',
        name: 'Bahati',
        wards: [
          { id: '032-09-01', name: 'Dundori' },
          { id: '032-09-02', name: 'Kabatini' },
          { id: '032-09-03', name: 'Kiamaina' },
          { id: '032-09-04', name: 'Lanet/Umoja' },
        ],
      },
      {
        id: '032-10',
        name: 'Nakuru Town West',
        wards: [
          { id: '032-10-01', name: 'Barut' },
          { id: '032-10-02', name: 'London' },
          { id: '032-10-03', name: 'Kaptembwo' },
          { id: '032-10-04', name: 'Kapkures' },
        ],
      },
      {
        id: '032-11',
        name: 'Nakuru Town East',
        wards: [
          { id: '032-11-01', name: 'Biashara' },
          { id: '032-11-02', name: 'Kivumbini' },
          { id: '032-11-03', name: 'Flamingo' },
          { id: '032-11-04', name: 'Menengai' },
        ],
      },
    ],
  },
  {
    id: '033',
    name: 'Narok',
    code: '033',
    capital: 'Narok',
    coordinates: { latitude: -1.0833, longitude: 35.8667 },
    subCounties: [
      {
        id: '033-01',
        name: 'Kilgoris',
        wards: [
          { id: '033-01-01', name: 'Kilgoris Central' },
          { id: '033-01-02', name: 'Keyian' },
          { id: '033-01-03', name: 'Angata Barikoi' },
          { id: '033-01-04', name: 'Shankoe' },
        ],
      },
      {
        id: '033-02',
        name: 'Emurua Dikirr',
        wards: [
          { id: '033-02-01', name: 'Ilkerin' },
          { id: '033-02-02', name: 'Ololmasani' },
          { id: '033-02-03', name: 'Mogondo' },
          { id: '033-02-04', name: 'Kapsasian' },
        ],
      },
      {
        id: '033-03',
        name: 'Narok North',
        wards: [
          { id: '033-03-01', name: 'Olokurto' },
          { id: '033-03-02', name: 'Narok Town' },
          { id: '033-03-03', name: 'Nkareta' },
          { id: '033-03-04', name: 'Olorropil' },
        ],
      },
      {
        id: '033-04',
        name: 'Narok East',
        wards: [
          { id: '033-04-01', name: 'Mosiro' },
          { id: '033-04-02', name: 'Ildamat' },
          { id: '033-04-03', name: 'Keekonyokie' },
        ],
      },
      {
        id: '033-05',
        name: 'Narok South',
        wards: [
          { id: '033-05-01', name: 'Majimoto/Naroosura' },
          { id: '033-05-02', name: 'Ololulung\'a' },
          { id: '033-05-03', name: 'Melelo' },
          { id: '033-05-04', name: 'Loita' },
        ],
      },
      {
        id: '033-06',
        name: 'Narok West',
        wards: [
          { id: '033-06-01', name: 'Ilmotiok' },
          { id: '033-06-02', name: 'Mara' },
          { id: '033-06-03', name: 'Siana' },
          { id: '033-06-04', name: 'Naikarra' },
        ],
      },
    ],
  },
  {
    id: '034',
    name: 'Kajiado',
    code: '034',
    capital: 'Kajiado',
    coordinates: { latitude: -1.8524, longitude: 36.7820 },
    subCounties: [
      {
        id: '034-01',
        name: 'Kajiado North',
        wards: [
          { id: '034-01-01', name: 'Olkeri' },
          { id: '034-01-02', name: 'Ongata Rongai' },
          { id: '034-01-03', name: 'Nkaimurunya' },
          { id: '034-01-04', name: 'Oloolua' },
        ],
      },
      {
        id: '034-02',
        name: 'Kajiado Central',
        wards: [
          { id: '034-02-01', name: 'Purko' },
          { id: '034-02-02', name: 'Ildamat' },
          { id: '034-02-03', name: 'Dalalekutuk' },
          { id: '034-02-04', name: 'Matapato North' },
        ],
      },
      {
        id: '034-03',
        name: 'Kajiado East',
        wards: [
          { id: '034-03-01', name: 'Kaputiei North' },
          { id: '034-03-02', name: 'Kitengela' },
          { id: '034-03-03', name: 'Oloosirkon/Sholinke' },
          { id: '034-03-04', name: 'Kenyawa-Poka' },
        ],
      },
      {
        id: '034-04',
        name: 'Kajiado West',
        wards: [
          { id: '034-04-01', name: 'Keekonyokie' },
          { id: '034-04-02', name: 'Iloodokilani' },
          { id: '034-04-03', name: 'Magadi' },
          { id: '034-04-04', name: 'Ewuaso Oonkidong\'i' },
        ],
      },
      {
        id: '034-05',
        name: 'Kajiado South',
        wards: [
          { id: '034-05-01', name: 'Entonet/Lenkism' },
          { id: '034-05-02', name: 'Mbirikani/Eselenkei' },
          { id: '034-05-03', name: 'Kuku' },
          { id: '034-05-04', name: 'Rombo' },
        ],
      },
    ],
  },
  {
    id: '035',
    name: 'Kericho',
    code: '035',
    capital: 'Kericho',
    coordinates: { latitude: -0.3676, longitude: 35.2839 },
    subCounties: [
      {
        id: '035-01',
        name: 'Kipkelion East',
        wards: [
          { id: '035-01-01', name: 'Londiani' },
          { id: '035-01-02', name: 'Kedowa/Kimugul' },
          { id: '035-01-03', name: 'Chepseon' },
          { id: '035-01-04', name: 'Tendeno/Sorget' },
        ],
      },
      {
        id: '035-02',
        name: 'Kipkelion West',
        wards: [
          { id: '035-02-01', name: 'Kunyak' },
          { id: '035-02-02', name: 'Kamasian' },
          { id: '035-02-03', name: 'Kipkelion' },
          { id: '035-02-04', name: 'Chilchila' },
        ],
      },
      {
        id: '035-03',
        name: 'Ainamoi',
        wards: [
          { id: '035-03-01', name: 'Ainamoi' },
          { id: '035-03-02', name: 'Kapkugerwet' },
          { id: '035-03-03', name: 'Kapsoit' },
          { id: '035-03-04', name: 'Kipchebor' },
        ],
      },
      {
        id: '035-04',
        name: 'Bureti',
        wards: [
          { id: '035-04-01', name: 'Kisiara' },
          { id: '035-04-02', name: 'Tebesonik' },
          { id: '035-04-03', name: 'Cheboin' },
          { id: '035-04-04', name: 'Chemosot' },
        ],
      },
      {
        id: '035-05',
        name: 'Belgut',
        wards: [
          { id: '035-05-01', name: 'Waldai' },
          { id: '035-05-02', name: 'Kabianga' },
          { id: '035-05-03', name: 'Cheptororiet/Seretut' },
          { id: '035-05-04', name: 'Chaik' },
        ],
      },
      {
        id: '035-06',
        name: 'Sigowet/Soin',
        wards: [
          { id: '035-06-01', name: 'Sigowet' },
          { id: '035-06-02', name: 'Kaplelartet' },
          { id: '035-06-03', name: 'Soliat' },
          { id: '035-06-04', name: 'Soin' },
        ],
      },
    ],
  },
  {
    id: '036',
    name: 'Bomet',
    code: '036',
    capital: 'Bomet',
    coordinates: { latitude: -0.7833, longitude: 35.3167 },
    subCounties: [
      {
        id: '036-01',
        name: 'Sotik',
        wards: [
          { id: '036-01-01', name: 'Ndanai/Abosi' },
          { id: '036-01-02', name: 'Chemagel' },
          { id: '036-01-03', name: 'Kipsonoi' },
          { id: '036-01-04', name: 'Kapletundo' },
        ],
      },
      {
        id: '036-02',
        name: 'Chepalungu',
        wards: [
          { id: '036-02-01', name: 'Kong\'asis' },
          { id: '036-02-02', name: 'Nyangores' },
          { id: '036-02-03', name: 'Sigor' },
          { id: '036-02-04', name: 'Chebunyo' },
        ],
      },
      {
        id: '036-03',
        name: 'Bomet East',
        wards: [
          { id: '036-03-01', name: 'Merigi' },
          { id: '036-03-02', name: 'Kembu' },
          { id: '036-03-03', name: 'Longisa' },
          { id: '036-03-04', name: 'Kipreres' },
        ],
      },
      {
        id: '036-04',
        name: 'Bomet Central',
        wards: [
          { id: '036-04-01', name: 'Silibwet Township' },
          { id: '036-04-02', name: 'Ndaraweta' },
          { id: '036-04-03', name: 'Singorwet' },
          { id: '036-04-04', name: 'Chesoen' },
        ],
      },
      {
        id: '036-05',
        name: 'Konoin',
        wards: [
          { id: '036-05-01', name: 'Kimulot' },
          { id: '036-05-02', name: 'Mogogosiek' },
          { id: '036-05-03', name: 'Boito' },
          { id: '036-05-04', name: 'Embomos' },
        ],
      },
    ],
  },
  {
    id: '037',
    name: 'Kakamega',
    code: '037',
    capital: 'Kakamega',
    coordinates: { latitude: 0.2827, longitude: 34.7519 },
    subCounties: [
      {
        id: '037-01',
        name: 'Lugari',
        wards: [
          { id: '037-01-01', name: 'Mautuma' },
          { id: '037-01-02', name: 'Lugari' },
          { id: '037-01-03', name: 'Lumakanda' },
          { id: '037-01-04', name: 'Chekalini' },
        ],
      },
      {
        id: '037-02',
        name: 'Likuyani',
        wards: [
          { id: '037-02-01', name: 'Likuyani' },
          { id: '037-02-02', name: 'Sango' },
          { id: '037-02-03', name: 'Kongoni' },
          { id: '037-02-04', name: 'Nzoia' },
        ],
      },
      {
        id: '037-03',
        name: 'Malava',
        wards: [
          { id: '037-03-01', name: 'West Kabras' },
          { id: '037-03-02', name: 'Chemuche' },
          { id: '037-03-03', name: 'East Kabras' },
          { id: '037-03-04', name: 'Butali/Chegulo' },
        ],
      },
      {
        id: '037-04',
        name: 'Lurambi',
        wards: [
          { id: '037-04-01', name: 'Butsotso East' },
          { id: '037-04-02', name: 'Butsotso South' },
          { id: '037-04-03', name: 'Butsotso Central' },
          { id: '037-04-04', name: 'Sheywe' },
        ],
      },
      {
        id: '037-05',
        name: 'Navakholo',
        wards: [
          { id: '037-05-01', name: 'Ingostse-Mathia' },
          { id: '037-05-02', name: 'Shinoyi-Shikomari-Esumeyia' },
          { id: '037-05-03', name: 'Bunyala West' },
          { id: '037-05-04', name: 'Bunyala East' },
        ],
      },
      {
        id: '037-06',
        name: 'Mumias West',
        wards: [
          { id: '037-06-01', name: 'Mumias Central' },
          { id: '037-06-02', name: 'Mumias North' },
          { id: '037-06-03', name: 'Etenje' },
          { id: '037-06-04', name: 'Musanda' },
        ],
      },
      {
        id: '037-07',
        name: 'Mumias East',
        wards: [
          { id: '037-07-01', name: 'Lusheya/Lubinu' },
          { id: '037-07-02', name: 'Malaha/Isongo/Makunga' },
          { id: '037-07-03', name: 'East Wanga' },
        ],
      },
      {
        id: '037-08',
        name: 'Matungu',
        wards: [
          { id: '037-08-01', name: 'Koyonzo' },
          { id: '037-08-02', name: 'Kholera' },
          { id: '037-08-03', name: 'Khalaba' },
          { id: '037-08-04', name: 'Mayoni' },
        ],
      },
      {
        id: '037-09',
        name: 'Butere',
        wards: [
          { id: '037-09-01', name: 'Marama West' },
          { id: '037-09-02', name: 'Marama Central' },
          { id: '037-09-03', name: 'Marenyo-Shianda' },
          { id: '037-09-04', name: 'Marama North' },
        ],
      },
      {
        id: '037-10',
        name: 'Khwisero',
        wards: [
          { id: '037-10-01', name: 'Kisa North' },
          { id: '037-10-02', name: 'Kisa East' },
          { id: '037-10-03', name: 'Kisa West' },
          { id: '037-10-04', name: 'Kisa Central' },
        ],
      },
      {
        id: '037-11',
        name: 'Shinyalu',
        wards: [
          { id: '037-11-01', name: 'Isukha North' },
          { id: '037-11-02', name: 'Murhanda' },
          { id: '037-11-03', name: 'Isukha Central' },
          { id: '037-11-04', name: 'Isukha South' },
        ],
      },
      {
        id: '037-12',
        name: 'Ikolomani',
        wards: [
          { id: '037-12-01', name: 'Idakho South' },
          { id: '037-12-02', name: 'Idakho East' },
          { id: '037-12-03', name: 'Idakho North' },
          { id: '037-12-04', name: 'Idakho Central' },
        ],
      },
    ],
  },
  {
    id: '038',
    name: 'Vihiga',
    code: '038',
    capital: 'Vihiga',
    coordinates: { latitude: 0.0667, longitude: 34.7167 },
    subCounties: [
      {
        id: '038-01',
        name: 'Vihiga',
        wards: [
          { id: '038-01-01', name: 'Lugaga-Wamuluma' },
          { id: '038-01-02', name: 'South Maragoli' },
          { id: '038-01-03', name: 'Central Maragoli' },
          { id: '038-01-04', name: 'Mungoma' },
        ],
      },
      {
        id: '038-02',
        name: 'Sabatia',
        wards: [
          { id: '038-02-01', name: 'Busali' },
          { id: '038-02-02', name: 'Lyaduywa/Izava' },
          { id: '038-02-03', name: 'West Sabatia' },
          { id: '038-02-04', name: 'Chavakali' },
        ],
      },
      {
        id: '038-03',
        name: 'Hamisi',
        wards: [
          { id: '038-03-01', name: 'Shiru' },
          { id: '038-03-02', name: 'Muhudu' },
          { id: '038-03-03', name: 'Banja' },
          { id: '038-03-04', name: 'Tambua' },
        ],
      },
      {
        id: '038-04',
        name: 'Luanda',
        wards: [
          { id: '038-04-01', name: 'Luanda Township' },
          { id: '038-04-02', name: 'Wemilabi' },
          { id: '038-04-03', name: 'Mwibona' },
          { id: '038-04-04', name: 'Luanda South' },
        ],
      },
      {
        id: '038-05',
        name: 'Emuhaya',
        wards: [
          { id: '038-05-01', name: 'North East Bunyore' },
          { id: '038-05-02', name: 'Central Bunyore' },
          { id: '038-05-03', name: 'West Bunyore' },
        ],
      },
    ],
  },
  {
    id: '039',
    name: 'Bungoma',
    code: '039',
    capital: 'Bungoma',
    coordinates: { latitude: 0.5635, longitude: 34.5606 },
    subCounties: [
      {
        id: '039-01',
        name: 'Mt Elgon',
        wards: [
          { id: '039-01-01', name: 'Kaptama' },
          { id: '039-01-02', name: 'Elgon' },
          { id: '039-01-03', name: 'Cheptais' },
          { id: '039-01-04', name: 'Chesikaki' },
        ],
      },
      {
        id: '039-02',
        name: 'Sirisia',
        wards: [
          { id: '039-02-01', name: 'Namwela' },
          { id: '039-02-02', name: 'Malakisi/South Kulisiru' },
          { id: '039-02-03', name: 'Lwandanyi' },
          { id: '039-02-04', name: 'Sirisia' },
        ],
      },
      {
        id: '039-03',
        name: 'Kabuchai',
        wards: [
          { id: '039-03-01', name: 'Kabuchai/Chwele' },
          { id: '039-03-02', name: 'West Nalondo' },
          { id: '039-03-03', name: 'Bwake/Luuya' },
          { id: '039-03-04', name: 'Mukuyuni' },
        ],
      },
      {
        id: '039-04',
        name: 'Bumula',
        wards: [
          { id: '039-04-01', name: 'South Bukusu' },
          { id: '039-04-02', name: 'Bumula' },
          { id: '039-04-03', name: 'Khasoko' },
          { id: '039-04-04', name: 'Kabula' },
        ],
      },
      {
        id: '039-05',
        name: 'Kanduyi',
        wards: [
          { id: '039-05-01', name: 'Bukembe West' },
          { id: '039-05-02', name: 'Bukembe East' },
          { id: '039-05-03', name: 'Township' },
          { id: '039-05-04', name: 'Khalaba' },
        ],
      },
      {
        id: '039-06',
        name: 'Webuye East',
        wards: [
          { id: '039-06-01', name: 'Ndivisi' },
          { id: '039-06-02', name: 'Maraka' },
          { id: '039-06-03', name: 'Mihuu' },
        ],
      },
      {
        id: '039-07',
        name: 'Webuye West',
        wards: [
          { id: '039-07-01', name: 'Bokoli' },
          { id: '039-07-02', name: 'Ndivisi' },
          { id: '039-07-03', name: 'Maraka' },
        ],
      },
      {
        id: '039-08',
        name: 'Kimilili',
        wards: [
          { id: '039-08-01', name: 'Kimilili' },
          { id: '039-08-02', name: 'Maeni' },
          { id: '039-08-03', name: 'Kamukuywa' },
        ],
      },
      {
        id: '039-09',
        name: 'Tongaren',
        wards: [
          { id: '039-09-01', name: 'Mbakalo' },
          { id: '039-09-02', name: 'Naitiri/Kabuyefwe' },
          { id: '039-09-03', name: 'Milima' },
          { id: '039-09-04', name: 'Ndalu/Tabani' },
        ],
      },
    ],
  },
  {
    id: '040',
    name: 'Busia',
    code: '040',
    capital: 'Busia',
    coordinates: { latitude: 0.4600, longitude: 34.1117 },
    subCounties: [
      {
        id: '040-01',
        name: 'Teso North',
        wards: [
          { id: '040-01-01', name: 'Malaba North' },
          { id: '040-01-02', name: 'Malaba South' },
          { id: '040-01-03', name: 'Ang\'urai North' },
          { id: '040-01-04', name: 'Ang\'urai South' },
        ],
      },
      {
        id: '040-02',
        name: 'Teso South',
        wards: [
          { id: '040-02-01', name: 'Ang\'orom' },
          { id: '040-02-02', name: 'Chakol South' },
          { id: '040-02-03', name: 'Chakol North' },
          { id: '040-02-04', name: 'Amukura West' },
        ],
      },
      {
        id: '040-03',
        name: 'Nambale',
        wards: [
          { id: '040-03-01', name: 'Nambale Township' },
          { id: '040-03-02', name: 'Bukhayo North/Walatsi' },
          { id: '040-03-03', name: 'Bukhayo East' },
          { id: '040-03-04', name: 'Bukhayo Central' },
        ],
      },
      {
        id: '040-04',
        name: 'Matayos',
        wards: [
          { id: '040-04-01', name: 'Burumba' },
          { id: '040-04-02', name: 'Marachi West' },
          { id: '040-04-03', name: 'Marachi Central' },
          { id: '040-04-04', name: 'Marachi East' },
        ],
      },
      {
        id: '040-05',
        name: 'Butula',
        wards: [
          { id: '040-05-01', name: 'Marachi North' },
          { id: '040-05-02', name: 'Kingandole' },
          { id: '040-05-03', name: 'Marachi Central' },
          { id: '040-05-04', name: 'Elugulu' },
        ],
      },
      {
        id: '040-06',
        name: 'Funyula',
        wards: [
          { id: '040-06-01', name: 'Namboboto Nambuku' },
          { id: '040-06-02', name: 'Ageng\'a Nanguba' },
          { id: '040-06-03', name: 'Bwiri' },
        ],
      },
      {
        id: '040-07',
        name: 'Budalangi',
        wards: [
          { id: '040-07-01', name: 'Bunyala Central' },
          { id: '040-07-02', name: 'Bunyala North' },
          { id: '040-07-03', name: 'Bunyala South' },
          { id: '040-07-04', name: 'Bunyala West' },
        ],
      },
    ],
  },
  {
    id: '041',
    name: 'Siaya',
    code: '041',
    capital: 'Siaya',
    coordinates: { latitude: -0.0635, longitude: 34.2864 },
    subCounties: [
      {
        id: '041-01',
        name: 'Ugenya',
        wards: [
          { id: '041-01-01', name: 'Ukwala' },
          { id: '041-01-02', name: 'North Ugenya' },
          { id: '041-01-03', name: 'South Ugenya' },
          { id: '041-01-04', name: 'East Ugenya' },
        ],
      },
      {
        id: '041-02',
        name: 'Ugunja',
        wards: [
          { id: '041-02-01', name: 'Sidindi' },
          { id: '041-02-02', name: 'Sigomere' },
          { id: '041-02-03', name: 'Ugunja' },
        ],
      },
      {
        id: '041-03',
        name: 'Alego Usonga',
        wards: [
          { id: '041-03-01', name: 'Siaya Township' },
          { id: '041-03-02', name: 'North Alego' },
          { id: '041-03-03', name: 'Central Alego' },
          { id: '041-03-04', name: 'South East Alego' },
        ],
      },
      {
        id: '041-04',
        name: 'Gem',
        wards: [
          { id: '041-04-01', name: 'North Gem' },
          { id: '041-04-02', name: 'West Gem' },
          { id: '041-04-03', name: 'Central Gem' },
          { id: '041-04-04', name: 'Yala Township' },
        ],
      },
      {
        id: '041-05',
        name: 'Bondo',
        wards: [
          { id: '041-05-01', name: 'West Yimbo' },
          { id: '041-05-02', name: 'Central Sakwa' },
          { id: '041-05-03', name: 'South Sakwa' },
          { id: '041-05-04', name: 'Yimbo East' },
        ],
      },
      {
        id: '041-06',
        name: 'Rarieda',
        wards: [
          { id: '041-06-01', name: 'West Asembo' },
          { id: '041-06-02', name: 'North Uyoma' },
          { id: '041-06-03', name: 'South Uyoma' },
          { id: '041-06-04', name: 'West Uyoma' },
        ],
      },
    ],
  },
  {
    id: '042',
    name: 'Kisumu',
    code: '042',
    capital: 'Kisumu',
    coordinates: { latitude: -0.0917, longitude: 34.7680 },
    subCounties: [
      {
        id: '042-01',
        name: 'Kisumu East',
        wards: [
          { id: '042-01-01', name: 'Kajulu' },
          { id: '042-01-02', name: 'Kolwa East' },
          { id: '042-01-03', name: 'Manyatta B' },
          { id: '042-01-04', name: 'Nyalenda A' },
        ],
      },
      {
        id: '042-02',
        name: 'Kisumu West',
        wards: [
          { id: '042-02-01', name: 'Central Kisumu' },
          { id: '042-02-02', name: 'Kisumu North' },
          { id: '042-02-03', name: 'West Kisumu' },
          { id: '042-02-04', name: 'North West Kisumu' },
        ],
      },
      {
        id: '042-03',
        name: 'Kisumu Central',
        wards: [
          { id: '042-03-01', name: 'Railways' },
          { id: '042-03-02', name: 'Migosi' },
          { id: '042-03-03', name: 'Shaurimoyo Kaloleni' },
          { id: '042-03-04', name: 'Market Milimani' },
        ],
      },
      {
        id: '042-04',
        name: 'Seme',
        wards: [
          { id: '042-04-01', name: 'West Seme' },
          { id: '042-04-02', name: 'Central Seme' },
          { id: '042-04-03', name: 'East Seme' },
          { id: '042-04-04', name: 'North Seme' },
        ],
      },
      {
        id: '042-05',
        name: 'Nyando',
        wards: [
          { id: '042-05-01', name: 'West Kano/Wawidhi' },
          { id: '042-05-02', name: 'North Nyakach' },
          { id: '042-05-03', name: 'South West Nyakach' },
          { id: '042-05-04', name: 'South East Nyakach' },
        ],
      },
      {
        id: '042-06',
        name: 'Muhoroni',
        wards: [
          { id: '042-06-01', name: 'Miwani' },
          { id: '042-06-02', name: 'Ombeyi' },
          { id: '042-06-03', name: 'Masogo/Nyang\'oma' },
          { id: '042-06-04', name: 'Chemelil' },
        ],
      },
      {
        id: '042-07',
        name: 'Nyakach',
        wards: [
          { id: '042-07-01', name: 'South West Nyakach' },
          { id: '042-07-02', name: 'North Nyakach' },
          { id: '042-07-03', name: 'Central Nyakach' },
          { id: '042-07-04', name: 'South East Nyakach' },
        ],
      },
    ],
  },
  {
    id: '043',
    name: 'Homa Bay',
    code: '043',
    capital: 'Homa Bay',
    coordinates: { latitude: -0.5273, longitude: 34.4569 },
    subCounties: [
      {
        id: '043-01',
        name: 'Kasipul',
        wards: [
          { id: '043-01-01', name: 'West Kasipul' },
          { id: '043-01-02', name: 'South Kasipul' },
          { id: '043-01-03', name: 'Central Kasipul' },
          { id: '043-01-04', name: 'East Kamagak' },
        ],
      },
      {
        id: '043-02',
        name: 'Kabondo Kasipul',
        wards: [
          { id: '043-02-01', name: 'Kabondo East' },
          { id: '043-02-02', name: 'Kabondo West' },
          { id: '043-02-03', name: 'Kokwanyo/Kakelo' },
          { id: '043-02-04', name: 'Kojwach' },
        ],
      },
      {
        id: '043-03',
        name: 'Karachuonyo',
        wards: [
          { id: '043-03-01', name: 'West Karachuonyo' },
          { id: '043-03-02', name: 'North Karachuonyo' },
          { id: '043-03-03', name: 'Central' },
          { id: '043-03-04', name: 'Kanyaluo' },
        ],
      },
      {
        id: '043-04',
        name: 'Rangwe',
        wards: [
          { id: '043-04-01', name: 'West Gem' },
          { id: '043-04-02', name: 'East Gem' },
          { id: '043-04-03', name: 'Kagan' },
          { id: '043-04-04', name: 'Kochia' },
        ],
      },
      {
        id: '043-05',
        name: 'Homa Bay Town',
        wards: [
          { id: '043-05-01', name: 'Homa Bay Central' },
          { id: '043-05-02', name: 'Homa Bay Arujo' },
          { id: '043-05-03', name: 'Homa Bay West' },
          { id: '043-05-04', name: 'Homa Bay East' },
        ],
      },
      {
        id: '043-06',
        name: 'Ndhiwa',
        wards: [
          { id: '043-06-01', name: 'Kwabwai' },
          { id: '043-06-02', name: 'Kanyadoto' },
          { id: '043-06-03', name: 'Kanyikela' },
          { id: '043-06-04', name: 'Kabuoch North' },
        ],
      },
      {
        id: '043-07',
        name: 'Suba North',
        wards: [
          { id: '043-07-01', name: 'Mfangano Island' },
          { id: '043-07-02', name: 'Rusinga Island' },
          { id: '043-07-03', name: 'Kasgunga' },
          { id: '043-07-04', name: 'Gembe' },
        ],
      },
      {
        id: '043-08',
        name: 'Suba South',
        wards: [
          { id: '043-08-01', name: 'Gwassi South' },
          { id: '043-08-02', name: 'Gwassi North' },
          { id: '043-08-03', name: 'Kaksingri West' },
          { id: '043-08-04', name: 'Ruma-Kaksingri East' },
        ],
      },
    ],
  },
  {
    id: '044',
    name: 'Migori',
    code: '044',
    capital: 'Migori',
    coordinates: { latitude: -1.0634, longitude: 34.4731 },
    subCounties: [
      {
        id: '044-01',
        name: 'Rongo',
        wards: [
          { id: '044-01-01', name: 'North Kamagambo' },
          { id: '044-01-02', name: 'Central Kamagambo' },
          { id: '044-01-03', name: 'East Kamagambo' },
          { id: '044-01-04', name: 'South Kamagambo' },
        ],
      },
      {
        id: '044-02',
        name: 'Awendo',
        wards: [
          { id: '044-02-01', name: 'North Sakwa' },
          { id: '044-02-02', name: 'South Sakwa' },
          { id: '044-02-03', name: 'West Sakwa' },
          { id: '044-02-04', name: 'Central Sakwa' },
        ],
      },
      {
        id: '044-03',
        name: 'Suna East',
        wards: [
          { id: '044-03-01', name: 'God Jope' },
          { id: '044-03-02', name: 'Suna Central' },
          { id: '044-03-03', name: 'Kakrao' },
          { id: '044-03-04', name: 'Kwa' },
        ],
      },
      {
        id: '044-04',
        name: 'Suna West',
        wards: [
          { id: '044-04-01', name: 'Wiga' },
          { id: '044-04-02', name: 'Wasweta II' },
          { id: '044-04-03', name: 'Ragana-Oruba' },
          { id: '044-04-04', name: 'Wasimbete' },
        ],
      },
      {
        id: '044-05',
        name: 'Uriri',
        wards: [
          { id: '044-05-01', name: 'West Kanyamkago' },
          { id: '044-05-02', name: 'North Kanyamkago' },
          { id: '044-05-03', name: 'Central Kanyamkago' },
          { id: '044-05-04', name: 'South Kanyamkago' },
        ],
      },
      {
        id: '044-06',
        name: 'Nyatike',
        wards: [
          { id: '044-06-01', name: 'Karungu' },
          { id: '044-06-02', name: 'Kaler' },
          { id: '044-06-03', name: 'Got Kachola' },
          { id: '044-06-04', name: 'Muhuru' },
        ],
      },
      {
        id: '044-07',
        name: 'Kuria West',
        wards: [
          { id: '044-07-01', name: 'Bukira East' },
          { id: '044-07-02', name: 'Bukira Central/Ikerege' },
          { id: '044-07-03', name: 'Isibania' },
          { id: '044-07-04', name: 'Makerero' },
        ],
      },
      {
        id: '044-08',
        name: 'Kuria East',
        wards: [
          { id: '044-08-01', name: 'Nyabasi East' },
          { id: '044-08-02', name: 'Nyabasi West' },
          { id: '044-08-03', name: 'Kegonga' },
          { id: '044-08-04', name: 'Ntimaru West' },
        ],
      },
    ],
  },
  {
    id: '045',
    name: 'Kisii',
    code: '045',
    capital: 'Kisii',
    coordinates: { latitude: -0.6774, longitude: 34.7797 },
    subCounties: [
      {
        id: '045-01',
        name: 'Bonchari',
        wards: [
          { id: '045-01-01', name: 'Bomariba' },
          { id: '045-01-02', name: 'Bogiakumu' },
          { id: '045-01-03', name: 'Bomorenda' },
        ],
      },
      {
        id: '045-02',
        name: 'South Mugirango',
        wards: [
          { id: '045-02-01', name: 'Tabaka' },
          { id: '045-02-02', name: 'Boikanga' },
          { id: '045-02-03', name: 'Bogetenga' },
          { id: '045-02-04', name: 'Borabu/Chitago' },
        ],
      },
      {
        id: '045-03',
        name: 'Bomachoge Borabu',
        wards: [
          { id: '045-03-01', name: 'Bombaba Borabu' },
          { id: '045-03-02', name: 'Boochi/Tendere' },
          { id: '045-03-03', name: 'Bosoti/Sengera' },
        ],
      },
      {
        id: '045-04',
        name: 'Bobasi',
        wards: [
          { id: '045-04-01', name: 'Masige West' },
          { id: '045-04-02', name: 'Masige East' },
          { id: '045-04-03', name: 'Basi Central' },
          { id: '045-04-04', name: 'Nyacheki' },
        ],
      },
      {
        id: '045-05',
        name: 'Bomachoge Chache',
        wards: [
          { id: '045-05-01', name: 'Majoge Basi' },
          { id: '045-05-02', name: 'Bomariba' },
          { id: '045-05-03', name: 'Bosoti/Sengera' },
        ],
      },
      {
        id: '045-06',
        name: 'Nyaribari Masaba',
        wards: [
          { id: '045-06-01', name: 'Ichuni' },
          { id: '045-06-02', name: 'Nyamasibi' },
          { id: '045-06-03', name: 'Masimba' },
          { id: '045-06-04', name: 'Gesusu' },
        ],
      },
      {
        id: '045-07',
        name: 'Nyaribari Chache',
        wards: [
          { id: '045-07-01', name: 'Bobaracho' },
          { id: '045-07-02', name: 'Kisii Central' },
          { id: '045-07-03', name: 'Keumbu' },
          { id: '045-07-04', name: 'Kiogoro' },
        ],
      },
      {
        id: '045-08',
        name: 'Kitutu Chache North',
        wards: [
          { id: '045-08-01', name: 'Monyerero' },
          { id: '045-08-02', name: 'Sensi' },
          { id: '045-08-03', name: 'Marani' },
          { id: '045-08-04', name: 'Kegogi' },
        ],
      },
      {
        id: '045-09',
        name: 'Kitutu Chache South',
        wards: [
          { id: '045-09-01', name: 'Bogusero' },
          { id: '045-09-02', name: 'Bogeka' },
          { id: '045-09-03', name: 'Nyakoe' },
          { id: '045-09-04', name: 'Kitutu Central' },
        ],
      },
    ],
  },
  {
    id: '046',
    name: 'Nyamira',
    code: '046',
    capital: 'Nyamira',
    coordinates: { latitude: -0.5667, longitude: 34.9333 },
    subCounties: [
      {
        id: '046-01',
        name: 'Kitutu Masaba',
        wards: [
          { id: '046-01-01', name: 'Rigoma' },
          { id: '046-01-02', name: 'Gachuba' },
          { id: '046-01-03', name: 'Kemera' },
          { id: '046-01-04', name: 'Magombo' },
        ],
      },
      {
        id: '046-02',
        name: 'West Mugirango',
        wards: [
          { id: '046-02-01', name: 'Bonyamatuta' },
          { id: '046-02-02', name: 'Township' },
          { id: '046-02-03', name: 'Bogichora' },
          { id: '046-02-04', name: 'Bosamaro' },
        ],
      },
      {
        id: '046-03',
        name: 'North Mugirango',
        wards: [
          { id: '046-03-01', name: 'Itibo' },
          { id: '046-03-02', name: 'Bomwagamo' },
          { id: '046-03-03', name: 'Bokeira' },
          { id: '046-03-04', name: 'Magwagwa' },
        ],
      },
      {
        id: '046-04',
        name: 'Borabu',
        wards: [
          { id: '046-04-01', name: 'Mekenene' },
          { id: '046-04-02', name: 'Nyansiongo' },
          { id: '046-04-03', name: 'Esise' },
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
  return kenyanCountiesComplete;
};

export const getCountyById = (id: string): County | undefined => {
  return kenyanCountiesComplete.find(county => county.id === id || county.code === id);
};

export const getCountyByName = (name: string): County | undefined => {
  return kenyanCountiesComplete.find(
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

  kenyanCountiesComplete.forEach(county => {
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
  return kenyanCountiesComplete.map(county => county.name);
};

export const getCountyCoordinates = (countyId: string) => {
  const county = getCountyById(countyId);
  return county?.coordinates;
};

export const formatLocationString = (
  county?: string,
  subCounty?: string,
  ward?: string
): string => {
  const parts = [ward, subCounty, county].filter(Boolean);
  return parts.join(', ');
};

export const getLocationHierarchy = (wardId: string): {
  county?: County;
  subCounty?: SubCounty;
  ward?: Ward;
} | null => {
  for (const county of kenyanCountiesComplete) {
    for (const subCounty of county.subCounties) {
      const ward = subCounty.wards.find(w => w.id === wardId);
      if (ward) {
        return { county, subCounty, ward };
      }
    }
  }
  return null;
};
