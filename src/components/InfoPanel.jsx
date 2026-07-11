import { useRef, useState } from 'react'
import { PROVINCES } from '../config'
import { LAND_TENURE_2021, TENURE_LABELS } from '../data/landTenure'
import PARTNER_INDICATORS from '../data/partnerIndicators.json'

const THEME_INFO = {
  agriculture: { title:'Agricultural evidence', answer:'Shows crop classification and broad agricultural capability—not ownership or farm operators.', cards:[['2024','crop inventory'],['1:1M','capability scale']] },
  governance: { title:'Governance evidence', answer:'Shows selected cadastral references and Crown/public-land records. Coverage is not comparable across provinces.', cards:[['Partial','parcel coverage'],['Open','public records']] },
  indigenous: { title:'Indigenous data paused', answer:'No Indigenous boundary data is displayed pending governance direction from Chiefs of Ontario and participating Nations.', cards:[['Paused','COO review'],['Community','direction required']] },
  access: { title:'Data availability', answer:'Open contextual data is mapped. Province-wide ownership, buyer/seller, price, mortgage, and transfer history remain restricted.', cards:[['Open','context layers'],['Restricted','ownership core']] }
}

const pretty = value => value === null || value === undefined || value === '' ? '—' : String(value)

export default function InfoPanel({ selected, province, theme, cropYear, activeLayers, onClose }) {
  const baseInfo = THEME_INFO[theme]
  const info = theme === 'agriculture' ? { ...baseInfo, cards:[[cropYear ? String(cropYear) : 'None','crop inventory'],['1:1M','capability scale']] } : baseInfo
  const tenure = LAND_TENURE_2021[province]
  const partner = PARTNER_INDICATORS.provinces[province]
  const number = value => new Intl.NumberFormat('en-CA',{maximumFractionDigits:1,notation:'compact'}).format(value)
  const [offset, setOffset] = useState({x:0,y:0})
  const drag = useRef(null)
  const startDrag = event => {
    if (event.target.closest('button')) return
    drag.current = {x:event.clientX,y:event.clientY,offsetX:offset.x,offsetY:offset.y}
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const moveDrag = event => {
    if (!drag.current) return
    setOffset({x:drag.current.offsetX + event.clientX - drag.current.x,y:drag.current.offsetY + event.clientY - drag.current.y})
  }
  const endDrag = event => {
    drag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  return <aside className={`insight-drawer ${selected ? 'selected' : ''}`} style={{transform:`translate(${offset.x}px, ${offset.y}px)`}}>
    <button className="close-button" onClick={onClose} aria-label="Close information">×</button>
    {selected ? <>
      <div className="draggable-heading" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
        <p className="eyebrow">Selected map feature</p><h2>{selected.title}</h2>
      </div>
      <div className="drawer-body">
        <div className="detail-list">
          {Object.entries(selected.properties).slice(0, 10).map(([key,value]) => <div key={key}><dt>{key.replaceAll('_',' ')}</dt><dd>{pretty(value)}</dd></div>)}
        </div>
        <div className="interpretation"><strong>Dataset context</strong><p>{selected.note}</p><span>Do not interpret this feature as proof of legal ownership, title, or Indigenous jurisdiction.</span></div>
      </div>
    </> : <>
      <div className="drawer-heading draggable-heading" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}><div><p className="eyebrow">What this view shows</p><h2>{info.title}</h2></div><span className="coverage-badge">{PROVINCES[province].label}</span></div>
      <div className="drawer-overview">
        <p>{info.answer}</p>
        {theme === 'agriculture' && tenure && <div className="tenure-summary">
          <div className="tenure-title"><strong>{PROVINCES[province].label} farm tenure · 2021</strong><span>{number(tenure.total)} ha total farm area</span></div>
          <p className="tenure-explainer">Province-level Statistics Canada totals—not a map layer or parcel ownership data. The bars show hectares reported by farm operations under each tenure arrangement.</p>
          {TENURE_LABELS.map(([key,label,color]) => <div className="tenure-row" key={key}>
            <span>{label}</span><b>{number(tenure[key])} ha · {Math.round(tenure[key]/tenure.total*100)}%</b>
            <i><em style={{width:`${Math.min(100,tenure[key]/tenure.total*100)}%`,background:color}} /></i>
          </div>)}
          <small>Statistics Canada Table 32-10-0234-01. Categories are reported measures and should not be summed as a simple ownership share.</small>
        </div>}
        {theme === 'agriculture' && partner && <>
          <section className="indicator-section">
            <div className="indicator-heading"><strong>Average farm size trend</strong><span>Statistics Canada · acres</span></div>
            <div className="trend-bars">{partner.farmSizeTrend.map(point => <div key={point.year}><span>{point.averageAcres}</span><i><em style={{height:`${Math.max(12,point.averageAcres/Math.max(...partner.farmSizeTrend.map(p=>p.averageAcres))*100)}%`}}/></i><small>{point.year}</small></div>)}</div>
            <p>Average farm size is total farm acres divided by the reported number of farms. It is a regional consolidation indicator, not proof of common ownership.</p>
          </section>
          <section className="indicator-section indicator-cards">
            <div><span>Farmland value · {partner.latestFarmlandValue.year}</span><strong>${new Intl.NumberFormat('en-CA').format(partner.latestFarmlandValue.dollarsPerAcre)}</strong><small>per acre · provincial estimate</small></div>
            <div><span>Farm operators · 2021</span><strong>{Math.round(partner.operators.female/partner.operators.total*100)}% women</strong><small>{Math.round(partner.operators.age55plus/partner.operators.total*100)}% age 55+</small></div>
            <div><span>Succession · 2021</span><strong>{Math.round(partner.succession.written/partner.succession.total*100)}% written</strong><small>{new Intl.NumberFormat('en-CA').format(partner.succession.written)} farms</small></div>
          </section>
          <small className="indicator-source">Sources: Statistics Canada tables 32-10-0156-01, 32-10-0153-01, 32-10-0047-01, 32-10-0381-01 and 32-10-0244-01.</small>
        </>}
      </div>
    </>}
  </aside>
}
