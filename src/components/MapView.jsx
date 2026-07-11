import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { cropMetaFile, PROVINCES, provinceFile } from '../config'

const BASEMAPS = {
  light: {
    version: 8,
    sources: { carto: { type: 'raster', tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png','https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'], tileSize: 512, attribution: '© OpenStreetMap contributors © CARTO' } },
    layers: [{ id: 'basemap', type: 'raster', source: 'carto', paint: { 'raster-opacity': 0.92 } }]
  },
  satellite: {
    version: 8,
    sources: { imagery: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, attribution: 'Esri World Imagery' } },
    layers: [{ id: 'basemap', type: 'raster', source: 'imagery' }]
  }
}

const provincesFor = province => province === 'all' ? ['ontario','alberta','saskatchewan'] : [province]
const sourceId = (layer, province) => `${layer.id}-${province}`

function titleFor(props, fallback) {
  const preferred = ['NAME','province','PRENAME','ENAME','ENGLISH_NAME','TREATY_NAME','MUNICIPAL_NAME','MUNICIPALI','RM_NAME','ADDRESS','LABEL','TWP']
  const key = preferred.find(name => props?.[name] !== undefined)
  return key ? String(props[key]) : fallback
}

export default function MapView({ province, layers, basemap, onSelect }) {
  const container = useRef(null)
  const mapRef = useRef(null)
  const [loading, setLoading] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const map = new maplibregl.Map({ container: container.current, style: BASEMAPS[basemap], center: PROVINCES[province].center, zoom: PROVINCES[province].zoom, minZoom: 3, maxZoom: 15, attributionControl: false })
    mapRef.current = map
    return () => map.remove()
  }, [basemap])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.flyTo({ center: PROVINCES[province].center, zoom: PROVINCES[province].zoom, duration: 1000, essential: true })
  }, [province, basemap])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    let cancelled = false

    const render = async () => {
      if (!map.isStyleLoaded()) { map.once('load', render); return }
      setError('')
      const desired = new Set()
      const tasks = []

      for (const layer of layers) for (const prov of (layer.file ? ['national'] : provincesFor(province))) {
        if (layer.provinces && prov !== 'national' && !layer.provinces.includes(prov)) continue
        const id = sourceId(layer, prov)
        desired.add(id)
        if (map.getSource(id)) continue
        tasks.push((async () => {
          setLoading(n => n + 1)
          try {
            if (layer.kind === 'raster') {
              const meta = await fetch(cropMetaFile(prov, layer.year)).then(r => { if (!r.ok) throw new Error('Crop overlay unavailable'); return r.json() })
              if (cancelled) return
              const imageUrl = new URL(meta.image.replace(/^\//,''), window.location.href).href
              map.addSource(id, { type: 'image', url: imageUrl, coordinates: meta.coordinates })
              map.addLayer({ id, type: 'raster', source: id, paint: { 'raster-opacity': 0.68, 'raster-resampling': 'nearest' } })
            } else {
              const file = layer.file || provinceFile(layer.id, prov)
              map.addSource(id, { type: 'geojson', data: file, generateId: true })
              const spec = layer.kind === 'fill'
                ? { id, type: 'fill', source: id, paint: { 'fill-color': layer.id === 'farmlandValue' ? ['interpolate',['linear'],['get','dollars_per_acre'],0,'#f4eadf',3000,'#dca46d',6000,'#c56f48',12000,'#9d3f31',22000,'#64251f'] : layer.color, 'fill-opacity': layer.id === 'farmlandValue' ? 0.62 : 0.24, 'fill-outline-color': layer.color } }
                : { id, type: layer.id === 'parcels' && prov === 'alberta' ? 'circle' : 'line', source: id, paint: layer.id === 'parcels' && prov === 'alberta' ? { 'circle-radius': ['interpolate',['linear'],['zoom'],3,1,11,3], 'circle-color': layer.color, 'circle-opacity': 0.55 } : { 'line-color': layer.color, 'line-width': ['interpolate',['linear'],['zoom'],3,0.7,10,1.8], 'line-opacity': 0.8, ...(layer.id === 'treaties' ? { 'line-dasharray': [3,2] } : {}) } }
              map.addLayer(spec)
              map.on('click', id, e => {
                const feature = e.features?.[0]
                if (!feature) return
                onSelect({ title: titleFor(feature.properties, layer.label), properties: feature.properties || {}, note: layer.note })
              })
              map.on('mouseenter', id, () => { map.getCanvas().style.cursor = 'pointer' })
              map.on('mouseleave', id, () => { map.getCanvas().style.cursor = '' })
            }
          } catch (err) { setError(err.message) }
          finally { if (!cancelled) setLoading(n => Math.max(0, n - 1)) }
        })())
      }

      await Promise.allSettled(tasks)
      if (cancelled) return
      for (const styleLayer of [...map.getStyle().layers].reverse()) {
        if (styleLayer.id === 'basemap' || desired.has(styleLayer.id)) continue
        if (map.getSource(styleLayer.source) && (styleLayer.id.includes('-ontario') || styleLayer.id.includes('-alberta') || styleLayer.id.includes('-saskatchewan') || styleLayer.id.includes('-national'))) map.removeLayer(styleLayer.id)
      }
      for (const id of Object.keys(map.getStyle().sources)) {
        if (id === 'carto' || id === 'imagery' || desired.has(id) || map.getLayer(id)) continue
        map.removeSource(id)
      }
    }
    render()
    return () => { cancelled = true }
  }, [layers, province, basemap, onSelect])

  return <section className="map-wrap" aria-label="Interactive land governance map">
    <div ref={container} className="map" />
    {loading > 0 && <div className="map-loading"><i />Loading {loading} layer{loading > 1 ? 's' : ''}</div>}
    {error && <div className="map-error">{error}</div>}
    <div className="map-credit">© OpenStreetMap contributors · CARTO / Esri</div>
  </section>
}
