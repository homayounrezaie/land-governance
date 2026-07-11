import { useCallback, useMemo, useState } from 'react'
import MapView from './components/MapView'
import Sidebar, { THEMES } from './components/Sidebar'
import InfoPanel from './components/InfoPanel'
import { LAYERS, PROVINCES } from './config'

export default function App() {
  const [province, setProvince] = useState('ontario')
  const [activeLayers, setActiveLayers] = useState(new Set(['provinceTerritory', 'crop2024', 'capability']))
  const [selected, setSelected] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [basemap, setBasemap] = useState('light')
  const [theme, setTheme] = useState('agriculture')
  const [cropYear, setCropYear] = useState(2024)
  const [infoOpen, setInfoOpen] = useState(true)

  const visibleLayers = useMemo(() => LAYERS.filter(layer => {
    if (layer.statusOnly) return false
    if (!activeLayers.has(layer.id)) return false
    return !layer.provinces || province === 'all' || layer.provinces.includes(province)
  }), [activeLayers, province])

  const toggleLayer = useCallback(id => setActiveLayers(current => {
    const next = new Set(current)
    if (id === 'crop2011' || id === 'crop2024') {
      const wasActive = next.has(id)
      next.delete('crop2011'); next.delete('crop2024')
      if (!wasActive) next.add(id)
      setCropYear(wasActive ? null : Number(id.replace('crop','')))
    } else next.has(id) ? next.delete(id) : next.add(id)
    return next
  }), [])

  return <main className="app-shell">
    <section className="workspace">
      <a className="help-button" href={`${import.meta.env.BASE_URL}help.html`} target="_blank" rel="noreferrer" aria-label="Open map help" title="Map help">?</a>
      <nav className="floating-map-nav" aria-label="Map settings">
        <button className="mobile-menu-button" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle research themes">☰</button>
        <label><span>Area</span><select value={province} onChange={e => { setProvince(e.target.value); setSelected(null) }}>
          {Object.entries(PROVINCES).map(([id, item]) => <option value={id} key={id}>{item.label}</option>)}
        </select></label>
        <div className="nav-divider" />
        <div className="basemap-buttons" aria-label="Basemap style">
          {['light','satellite'].map(id => <button key={id} className={basemap === id ? 'active' : ''} onClick={() => setBasemap(id)}>{id}</button>)}
        </div>
      </nav>
      <Sidebar open={sidebarOpen} province={province} layers={LAYERS} active={activeLayers} onToggle={toggleLayer} theme={theme} onTheme={(item, enabled) => {
        setTheme(item.id)
        setActiveLayers(current => {
          const next = new Set(current)
          item.layers.filter(id => {
            const layer = LAYERS.find(layer => layer.id === id)
            return layer && !layer.statusOnly && !layer.timeline && (!layer.provinces || layer.provinces.includes(province))
          }).forEach(id => enabled ? next.add(id) : next.delete(id))
          return next
        })
        setSelected(null)
      }} />
      <MapView province={province} layers={visibleLayers} basemap={basemap} onSelect={feature => { setSelected(feature); setInfoOpen(true) }} />
      {infoOpen ? <InfoPanel selected={selected} province={province} theme={theme} cropYear={cropYear} activeLayers={visibleLayers} onClose={() => { setSelected(null); setInfoOpen(false) }} /> : <button className="info-open-button" onClick={() => setInfoOpen(true)} aria-label="Open map information" title="Open map information">i</button>}
    </section>
  </main>
}
