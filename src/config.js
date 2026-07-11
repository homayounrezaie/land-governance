export const PROVINCES = {
  ontario: { label: 'Ontario', center: [-84.5, 49.2], zoom: 4.4 },
  alberta: { label: 'Alberta', center: [-114.5, 54.3], zoom: 5 },
  saskatchewan: { label: 'Saskatchewan', center: [-106, 54.3], zoom: 5 }
}

const asset = path => `${import.meta.env.BASE_URL}${path.replace(/^\//,'')}`

export const LAYERS = [
  { id: 'provinceTerritory', group: 'Reference', label: 'Province boundaries', kind: 'line', color: '#243f35', file: asset('data/national/province_territory_boundaries.geojson'), note: 'Statistics Canada 2021 boundaries for all 10 provinces and 3 territories.' },
  { id: 'crop2011', group: 'Agriculture', label: 'AAFC Crop Inventory · 2011', kind: 'raster', year: 2011, timeline: true, provinces: ['ontario','alberta','saskatchewan'], note: 'AAFC 30 m classification, processed for web display.' },
  { id: 'crop2024', group: 'Agriculture', label: 'AAFC Crop Inventory · 2024', kind: 'raster', year: 2024, timeline: true, provinces: ['ontario','alberta','saskatchewan'], note: 'AAFC 30 m classification, processed for web display.' },
  { id: 'capability', group: 'Agriculture', label: 'Agricultural capability · 1:1M', kind: 'fill', color: '#d48f3f', file: asset('data/national/ag_capability.geojson'), note: 'Generalized 1:1,000,000 Canada Land Inventory.' },
  { id: 'farmlandValue', group: 'Agriculture', label: 'Farmland value · 2025 $/acre', kind: 'fill', color: '#b85c38', file: asset('data/national/farmland_value.geojson'), note: 'Province-level Statistics Canada value of farm land and buildings per acre; not a parcel sale-price layer.' },
  { id: 'boundaries', group: 'Reference', label: 'Municipal & township boundaries', kind: 'line', color: '#344e41', provinces: ['ontario','alberta','saskatchewan'], note: 'Reference geography; boundary type differs by province.' },
  { id: 'parcels', group: 'Reference', label: 'Parcel & lot references', kind: 'line', color: '#685f88', provinces: ['ontario','alberta','saskatchewan'], note: 'Coverage differs: Niagara Falls parcels, Edmonton display sample, Saskatchewan township grid.' },
  { id: 'crown', group: 'Land governance', label: 'Crown & public land', kind: 'fill', color: '#2d7d63', provinces: ['ontario','saskatchewan'], note: 'Public-land records differ by province and are not ownership parcels.' },
  { id: 'crownUnpatented', group: 'Land governance', label: 'Unpatented Crown land', kind: 'fill', color: '#477c65', provinces: ['ontario'], note: 'Ontario unpatented Crown-land reference polygons.' },
  { id: 'crownDispositions', group: 'Land governance', label: 'Crown land dispositions', kind: 'fill', color: '#719b7d', provinces: ['ontario'], note: 'Ontario non-freehold Crown dispositions, including selected leases and licences.' },
  { id: 'landsBranchRegions', group: 'Land governance', label: 'Lands Branch regions', kind: 'line', color: '#25664f', provinces: ['saskatchewan'], note: 'Saskatchewan Lands Branch administrative regions.' },
  { id: 'landsBranchDistricts', group: 'Land governance', label: 'Lands Branch districts', kind: 'line', color: '#5b8b72', provinces: ['saskatchewan'], note: 'Saskatchewan Lands Branch administrative districts.' },
  { id: 'indigenousPaused', group: 'Governance review', label: 'Indigenous layers · paused for COO review', statusOnly: true, note: 'Not displayed or published pending direction from Chiefs of Ontario and participating Nations.' },
  { id: 'ownershipTransfers', group: 'Data access', label: 'Ownership & transfers · restricted', statusOnly: true, note: 'Province-wide owner and historical transfer records require licences, purchases, or research agreements.' }
]

export const provinceFile = (layer, province) => asset(`data/${province}/${layer}.geojson`)
export const cropMetaFile = (province, year) => asset(`data/${province}/crop${year}.json`)

export const CROP_CLASSES = [
  ['#3333ff','Water'], ['#996666','Exposed / barren'], ['#cc6699','Urban / developed'],
  ['#ffff00','Shrubland'], ['#666666','Burned area'], ['#993399','Wetland'],
  ['#cccc00','Grassland'], ['#cc6600','Agriculture'], ['#ff9933','Cropland'],
  ['#ffcc33','Pasture / forage'], ['#660000','Cereals'], ['#dae31d','Barley'],
  ['#d1d52b','Oats'], ['#a7b34d','Wheat'], ['#ffff99','Corn for grain'],
  ['#cc9933','Soybeans'], ['#896e43','Pulses'], ['#009900','Forest']
]
