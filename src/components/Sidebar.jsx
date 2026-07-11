import { useState } from 'react'
import { CROP_CLASSES } from '../config'

const THEMES = [
  { id:'agriculture', icon:'A', title:'Agricultural change', question:'Where is farmland, and how is its use changing?', layers:['provinceTerritory','crop2011','crop2024','capability','farmlandValue'] },
  { id:'governance', icon:'G', title:'Land governance', question:'How are parcels, Crown land, and administrative systems organized?', layers:['provinceTerritory','boundaries','parcels','crown','crownUnpatented','crownDispositions','landsBranchRegions','landsBranchDistricts'] },
  { id:'indigenous', icon:'T', title:'Indigenous data · paused', question:'Public Indigenous layers are paused pending governance direction.', layers:['indigenousPaused'] },
  { id:'access', icon:'D', title:'Data access', question:'What can this evidence answer—and what remains restricted?', layers:['provinceTerritory','boundaries','parcels','ownershipTransfers'] }
]

export default function Sidebar({ open, province, layers, active, onToggle, theme, onTheme }) {
  const [layersOpen, setLayersOpen] = useState(true)
  const current = THEMES.find(item => item.id === theme) || THEMES[0]
  const isAvailable = layer => !layer.statusOnly && (!layer.provinces || layer.provinces.includes(province))
  const relevant = layers.filter(layer => current.layers.includes(layer.id))

  return <aside className={`map-controls ${open ? 'open' : ''}`}>
    <div className="panel-brand"><span>LG</span><div><strong>Land Governance</strong></div></div>
    <div className="theme-card">
      <button className="layers-toggle" onClick={() => setLayersOpen(v => !v)}>
        <span>Map layers</span><i>{layersOpen ? '−' : '+'}</i>
      </button>
      {layersOpen && <>
        <div className="theme-tabs">
          {THEMES.map(item => {
            const toggleable = item.layers.filter(id => {
              const layer = layers.find(layer => layer.id === id)
              return layer && isAvailable(layer) && !layer.timeline
            })
            const checked = toggleable.length > 0 && toggleable.every(id => active.has(id))
            return <label key={item.id} className={theme === item.id ? 'active' : ''} title={`Toggle ${item.title}`}>
              <strong>{item.title}</strong>
              <input className="switch-input" type="checkbox" checked={checked} disabled={!toggleable.length} onChange={event => onTheme(item, event.target.checked)} />
            </label>
          })}
        </div>
        <div className="compact-layers">
          {relevant.map(layer => {
            const available = isAvailable(layer)
            const reason = layer.statusOnly ? 'Paused' : !available ? 'Other province' : ''
            return <label className={!available ? 'disabled' : ''} key={layer.id} title={reason || layer.note}>
              <span><strong>{layer.label}</strong>{reason && <small>{reason}</small>}</span>
              <input className="switch-input" type="checkbox" checked={active.has(layer.id) && available} disabled={!available} onChange={() => onToggle(layer.id)} />
            </label>
          })}
        </div>
      </>}
    </div>
    {(active.has('crop2011') || active.has('crop2024')) && <div className="sidebar-legend">
      <div>{CROP_CLASSES.map(([color,label]) => <span key={label}><i style={{background:color}} />{label}</span>)}</div>
    </div>}
  </aside>
}

export { THEMES }
