export interface Location {
  id: string;
  name: string;
  type: 'town' | 'county' | 'national';
  parent_id?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export const kenyanLocations: Location[] = [
  // National
  { id: 'kenya', name: 'Kenya', type: 'national' },
  
  // Counties
  { id: 'nairobi', name: 'Nairobi', type: 'county', parent_id: 'kenya' },
  { id: 'kiambu', name: 'Kiambu', type: 'county', parent_id: 'kenya' },
  { id: 'nakuru', name: 'Nakuru', type: 'county', parent_id: 'kenya' },
  { id: 'meru', name: 'Meru', type: 'county', parent_id: 'kenya' },
  { id: 'mombasa', name: 'Mombasa', type: 'county', parent_id: 'kenya' },
  { id: 'machakos', name: 'Machakos', type: 'county', parent_id: 'kenya' },
  { id: 'embu', name: 'Embu', type: 'county', parent_id: 'kenya' },
  { id: 'kilifi', name: 'Kilifi', type: 'county', parent_id: 'kenya' },
  { id: 'nyandarua', name: 'Nyandarua', type: 'county', parent_id: 'kenya' },
  { id: 'murang\'a', name: 'Murang\'a', type: 'county', parent_id: 'kenya' },
  
  // Towns in Nairobi
  { id: 'westlands', name: 'Westlands', type: 'town', parent_id: 'nairobi' },
  { id: 'karen', name: 'Karen', type: 'town', parent_id: 'nairobi' },
  { id: 'kasarani', name: 'Kasarani', type: 'town', parent_id: 'nairobi' },
  { id: 'kibera', name: 'Kibera', type: 'town', parent_id: 'nairobi' },
  { id: 'eastleigh', name: 'Eastleigh', type: 'town', parent_id: 'nairobi' },
  
  // Towns in Kiambu
  { id: 'thika', name: 'Thika', type: 'town', parent_id: 'kiambu' },
  { id: 'limuru', name: 'Limuru', type: 'town', parent_id: 'kiambu' },
  { id: 'kikuyu', name: 'Kikuyu', type: 'town', parent_id: 'kiambu' },
  { id: 'ruiru', name: 'Ruiru', type: 'town', parent_id: 'kiambu' },
  
  // Towns in Nakuru
  { id: 'nakuru-town', name: 'Nakuru Town', type: 'town', parent_id: 'nakuru' },
  { id: 'naivasha', name: 'Naivasha', type: 'town', parent_id: 'nakuru' },
  { id: 'gilgil', name: 'Gilgil', type: 'town', parent_id: 'nakuru' },
  
  // Towns in other counties
  { id: 'meru-town', name: 'Meru Town', type: 'town', parent_id: 'meru' },
  { id: 'mombasa-island', name: 'Mombasa Island', type: 'town', parent_id: 'mombasa' },
  { id: 'machakos-town', name: 'Machakos Town', type: 'town', parent_id: 'machakos' },
  { id: 'embu-town', name: 'Embu Town', type: 'town', parent_id: 'embu' },
  { id: 'malindi', name: 'Malindi', type: 'town', parent_id: 'kilifi' },
  { id: 'ol-kalou', name: 'Ol Kalou', type: 'town', parent_id: 'nyandarua' },
  { id: 'kenol', name: 'Kenol', type: 'town', parent_id: 'murang\'a' },
];

export const getLocationsByType = (type: 'town' | 'county' | 'national'): Location[] => {
  return kenyanLocations.filter(location => location.type === type);
};

export const getLocationsByParent = (parentId: string): Location[] => {
  return kenyanLocations.filter(location => location.parent_id === parentId);
};

export const getLocationById = (id: string): Location | undefined => {
  return kenyanLocations.find(location => location.id === id);
};