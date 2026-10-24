import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import Plotly from 'plotly.js-dist-min'
import { api } from './api/client'
import type { Answer, Dashboard, Dataset, Health, History, TableResponse } from './api/types'
import { downloadCsv, formatNumber } from './utils'
import './App.css'
import './auth.css'

type Tab = 'Dashboard' | 'Ask AI' | 'Data Explorer' | 'Data Quality' | 'Query History'
type IconName =
  | 'ask'
  | 'dashboard'
  | 'table'
  | 'history'
  | 'quality'
  | 'upload'
  | 'database'
  | 'chevron'
  | 'menu'
  | 'bell'
  | 'sparkles'
  | 'download'
  | 'refresh'
  | 'rows'
  | 'columns'
  | 'missing'
  | 'search'
  | 'check'

const tabs: Tab[] = ['Dashboard', 'Ask AI', 'Data Explorer', 'Data Quality', 'Query History']

const iconPaths: Record<IconName, string[]> = {
  ask: ['M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6a2.5 2.5 0 0 1-2.5 2.5H12l-4.5 3v-3.2A2.5 2.5 0 0 1 5 12.5z'],
  dashboard: ['M5 5.5h5v5H5z', 'M14 5.5h5v5h-5z', 'M5 14.5h5v5H5z', 'M14 14.5h5v5h-5z'],
  table: ['M4.5 5.5h15v13h-15z', 'M4.5 10h15', 'M10 5.5v13', 'M15 5.5v13'],
  history: ['M5 10a7 7 0 1 0 2-4.9', 'M5 4.5v5h5', 'M12 7v5l3 2'],
  quality: ['M12 3.8 19 6.5v5.2c0 4.2-2.8 7.5-7 8.7-4.2-1.2-7-4.5-7-8.7V6.5z', 'm8.8 12 2.1 2.1 4.4-4.5'],
  upload: ['M12 16V4', 'm7 9 5-5 5 5', 'M5 19.5h14'],
  database: ['M5 6.5c0-1.4 3.1-2.5 7-2.5s7 1.1 7 2.5-3.1 2.5-7 2.5-7-1.1-7-2.5', 'M5 6.5v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5', 'M5 11.5v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5'],
  chevron: ['m7 9 5 5 5-5'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  bell: ['M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8.5h18C21 16 18 16 18 9', 'M10 20h4'],
  sparkles: ['m12 3 1.1 4.1L17 8.2l-3.9 1.1L12 13.5l-1.1-4.2L7 8.2l3.9-1.1z', 'm19 14 .6 2.1 2.1.6-2.1.6L19 19.5l-.6-2.2-2.1-.6 2.1-.6z', 'm5 14 .6 2.1 2.1.6-2.1.6L5 19.5l-.6-2.2-2.1-.6 2.1-.6z'],
  download: ['M12 4v10', 'm8 10 4 4 4-4', 'M5 19h14'],
  refresh: ['M19 8a7 7 0 0 0-12.2-2L5 8', 'M5 4v4h4', 'M5 16a7 7 0 0 0 12.2 2L19 16', 'M19 20v-4h-4'],
  rows: ['M5 6h14', 'M5 12h14', 'M5 18h14'],
  columns: ['M5 5v14', 'M12 5v14', 'M19 5v14'],
  missing: ['M12 4v8', 'M12 16h.01'],
  search: ['M10.8 5a5.8 5.8 0 1 0 0 11.6A5.8 5.8 0 0 0 10.8 5', 'm15 15 4 4'],
  check: ['m5 12 4 4L19 6'],
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg aria-hidden="true" className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {iconPaths[name].map((path, index) => <path key={`${name}-${index}`} d={path} />)}
    </svg>
  )
}

function Brand() {
  return (
    <div className="brand-lockup">
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
      <span className="brand-name">QueryPilot <b>AI</b></span>
    </div>
  )
}

function Sidebar({ dataset, active, onSelect, onChangeDataset }: { dataset?: Dataset; active?: Tab; onSelect: (tab: Tab) => void; onChangeDataset: () => void }) {
  return (
    <aside className="app-sidebar">
      <Brand />
      <div className="sidebar-scroll">
        <span className="sidebar-label">WORKSPACE</span>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          {tabs.map(tab => (
            <button key={tab} type="button" disabled={!dataset} className={`sidebar-link ${active === tab ? 'active' : ''}`} onClick={() => onSelect(tab)}>
              <Icon name={tab === 'Ask AI' ? 'ask' : tab === 'Dashboard' ? 'dashboard' : tab === 'Data Explorer' ? 'table' : tab === 'Data Quality' ? 'quality' : 'history'} />
              <span>{tab}</span>
            </button>
          ))}
        </nav>

        <span className="sidebar-label sidebar-label-spaced">DATA MANAGEMENT</span>
        <button type="button" className={`sidebar-link ${!dataset ? 'active' : ''}`} onClick={onChangeDataset}>
          <Icon name="upload" />
          <span>Upload dataset</span>
        </button>
      </div>

      <div className="sidebar-dataset">
        <div className="dataset-icon"><Icon name="database" size={19} /></div>
        <div className="dataset-copy">
          <span>Current dataset</span>
          <strong>{dataset?.name ?? 'No dataset selected'}</strong>
        </div>
        {dataset && <button type="button" className="sidebar-more" onClick={onChangeDataset} aria-label="Change dataset"><Icon name="chevron" size={16} /></button>}
      </div>
    </aside>
  )
}

function PageTopbar({ title, dataset, health, onChangeDataset, onLogout }: { title: string; dataset?: Dataset; health?: Health; onChangeDataset: () => void; onLogout: () => void }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <span className="mobile-menu" aria-hidden="true"><Icon name="menu" /></span>
        <div className="topbar-heading-icon"><Icon name={title === 'Ask AI' ? 'ask' : title === 'Dashboard' ? 'dashboard' : title === 'Data Explorer' ? 'table' : title === 'Data Quality' ? 'quality' : 'history'} size={20} /></div>
        <div>
          <span className="topbar-kicker">WORKSPACE</span>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="topbar-actions">
        {dataset && <button type="button" className="dataset-switcher" onClick={onChangeDataset}>
          <Icon name="database" size={16} />
          <span>Dataset:</span>
          <strong>{dataset.name}</strong>
          <Icon name="chevron" size={15} />
        </button>}
        <span className={`connection-pill ${health?.online ? 'online' : 'offline'}`}><i />{health?.online ? 'Connected' : 'Offline'}</span>
        <span className="topbar-icon" title="Notifications"><Icon name="bell" size={19} /></span>
        <div className="user-menu"><span className="avatar">A</span><span className="user-name">Admin</span><Icon name="chevron" size={15} /></div>
        <button type="button" className="logout-link" onClick={onLogout}>Log out</button>
      </div>
    </header>
  )
}

function Table({ rows, columns }: { rows: Record<string, unknown>[]; columns?: string[] }) {
  const keys = columns?.length ? columns : Object.keys(rows[0] ?? {})
  return (
    <div className="table-wrap">
      {rows.length > 0 ? <table><thead><tr>{keys.map(key => <th key={key}>{key}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{keys.map(key => <td key={key}>{String(row[key] ?? '—')}</td>)}</tr>)}</tbody></table> : <div className="empty-state"><Icon name="table" size={22} /><strong>No data available</strong><span>Results will appear here when records match.</span></div>}
    </div>
  )
}

function Pagination({ page, pages, total, pageSize, onChange }: { page: number; pages: number; total: number; pageSize: number; onChange: (page: number) => void }) {
  if (total <= pageSize) return null
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  return <div className="pagination"><span className="pagination-copy">Showing <strong>{start}–{end}</strong> of <strong>{total}</strong> rows</span><div className="pagination-actions"><button type="button" className="page-button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button><span className="page-status">Page {page} of {pages}</span><button type="button" className="page-button" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button></div></div>
}

function PaginatedTable({ rows, columns, pageSize = 25 }: { rows: Record<string, unknown>[]; columns?: string[]; pageSize?: number }) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(rows.length / pageSize))
  const currentPage = Math.min(page, pages)
  const visibleRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  return <><Table rows={visibleRows} columns={columns} /><Pagination page={currentPage} pages={pages} total={rows.length} pageSize={pageSize} onChange={setPage} /></>
}

type PlotlyFigure = {
  data: Plotly.Data[]
  layout?: Partial<Plotly.Layout>
  config?: Partial<Plotly.Config>
}

function parsePlotlyFigure(value: string): PlotlyFigure {
  const parsed: unknown = JSON.parse(value)
  if (!parsed || typeof parsed !== 'object' || !('data' in parsed) || !Array.isArray(parsed.data)) {
    throw new Error('The dashboard returned an invalid chart.')
  }
  return parsed as PlotlyFigure
}

function PlotlyChart({ figure }: { figure: string }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [renderError, setRenderError] = useState<{ figure: string; message: string }>()
  let parseError = ''
  try {
    parsePlotlyFigure(figure)
  } catch (caught) {
    parseError = caught instanceof Error ? caught.message : 'Could not read this chart.'
  }

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    let parsed: PlotlyFigure
    try {
      parsed = parsePlotlyFigure(figure)
    } catch {
      return
    }

    let mounted = true
    const layout: Partial<Plotly.Layout> = {
      ...parsed.layout,
      autosize: true,
      height: 300,
      margin: { ...parsed.layout?.margin, t: 38, r: 18, b: 52, l: 56 },
    }
    const config: Partial<Plotly.Config> = {
      ...parsed.config,
      responsive: true,
      displaylogo: false,
    }

    void Plotly.react(chart, parsed.data, layout, config).catch(caught => {
      if (mounted) setRenderError({ figure, message: caught instanceof Error ? caught.message : 'Could not render this chart.' })
    })

    return () => {
      mounted = false
      Plotly.purge(chart)
    }
  }, [figure, parseError])

  const error = parseError || (renderError?.figure === figure ? renderError.message : '')
  return <div ref={chartRef} className="chart-plot" aria-label="Data visualization">{error && <div className="chart-error">{error}</div>}</div>
}

type FilterEntry = [string, string[]]

const filterPriority = ['STATUS', 'PRODUCTLINE', 'YEAR_ID', 'MONTH_ID', 'REGION', 'CATEGORY', 'COUNTRY', 'TERRITORY', 'CLASS', 'SUBJECT', 'DATE', 'TYPE']

function sortFilterEntries(entries: FilterEntry[]) {
  return [...entries].sort(([first], [second]) => {
    const firstRank = filterPriority.findIndex(item => first.toUpperCase().includes(item))
    const secondRank = filterPriority.findIndex(item => second.toUpperCase().includes(item))
    return (firstRank < 0 ? filterPriority.length : firstRank) - (secondRank < 0 ? filterPriority.length : secondRank)
  })
}

function FilterDropdown({ name, values, selected, onChange }: { name: string; values: string[]; selected: string[]; onChange: (values: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const filteredValues = values.filter(value => value.toLowerCase().includes(query.trim().toLowerCase()))
  const selectedSet = new Set(selected)

  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const toggleValue = (value: string) => {
    const next = selectedSet.has(value) ? selected.filter(item => item !== value) : [...selected, value]
    onChange(next)
  }

  return (
    <div ref={dropdownRef} className={`filter-dropdown ${open ? 'open' : ''}`}>
      <button type="button" className="filter-dropdown-trigger" aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen(value => !value)}>
        <span className="filter-dropdown-copy"><strong>{name}</strong><small>{selected.length ? `${selected.length} selected` : 'All values'}</small></span>
        <span className="filter-dropdown-chevron"><Icon name="chevron" size={15} /></span>
      </button>
      {open && <div className="filter-dropdown-menu">
        <div className="filter-search-wrap"><Icon name="search" size={15} /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${name}`} aria-label={`Search ${name}`} /></div>
        <div className="filter-menu-meta"><span>{filteredValues.length} values</span><button type="button" onClick={() => onChange([])} disabled={!selected.length}>Clear</button></div>
        <div className="filter-options" role="listbox" aria-label={`${name} values`} aria-multiselectable="true">
          {filteredValues.length ? filteredValues.map(value => {
            const checked = selectedSet.has(value)
            return <button type="button" role="option" aria-selected={checked} className={`filter-option ${checked ? 'selected' : ''}`} key={value} onClick={() => toggleValue(value)}><span className="filter-option-check">{checked && <Icon name="check" size={13} />}</span><span>{value}</span></button>
          }) : <span className="filter-empty">No matching values</span>}
        </div>
      </div>}
    </div>
  )
}

function Login({ done }: { done: (email: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password to continue.')
      return
    }
    done(email.trim())
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <Brand />
          <div className="login-copy"><span className="eyebrow">PRIVATE DATA WORKSPACE</span><h1>Data answers, without the complexity.</h1><p>Upload your data, explore dashboards, and ask natural-language questions with proof-backed results.</p></div>
          <div className="login-points"><span>Verified answers from your data</span><span>Private local data processing</span><span>English, Hindi &amp; Hinglish support</span></div>
        </div>
        <form onSubmit={submit} className="login-form">
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to QueryPilot</h2>
          <p>Use your workspace details to continue.</p>
          <label>Email address<input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@company.com" /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" /></label>
          {error && <div className="notice">{error}</div>}
          <button className="primary-button login-submit" type="submit">Sign in <span>→</span></button>
          <small>This local frontend session does not authenticate against the server.</small>
        </form>
      </section>
    </main>
  )
}

function Upload({ go }: { go: (dataset: Dataset) => void }) {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (request: Promise<Dataset>) => {
    setBusy(true)
    setError('')
    try { go(await request) } catch (caught) { setError(caught instanceof Error ? caught.message : 'Request failed') } finally { setBusy(false) }
  }

  return (
    <section className="upload-content">
      <div className="welcome-banner"><div><span className="eyebrow">DATA ANALYTICS, MADE CLEAR</span><h2>Start with your data</h2><p>Upload a CSV or Excel file and turn raw records into clear, useful answers.</p></div><div className="welcome-art"><Icon name="sparkles" size={44} /></div></div>
      <div className="upload-grid">
        <div className="upload-card panel-card">
          <div className="panel-heading"><div><span className="heading-icon"><Icon name="upload" /></span><div><h2>Upload a dataset</h2><p>CSV and Excel files are combined into one searchable workspace.</p><small className="sanitization-note">Headers, spaces, blank rows and duplicate columns are cleaned automatically.</small></div></div></div>
          <label className="drop-zone"><input aria-label="CSV or Excel files" type="file" accept=".csv,.xlsx,.xlsm,.xls" multiple onChange={event => setFiles(Array.from(event.target.files ?? []))} /><span className="drop-icon"><Icon name="upload" size={24} /></span><strong>{files.length ? `${files.length} file(s) selected` : 'Choose CSV or Excel files'}</strong><small>Drag and drop or browse from your computer</small><em>CSV • XLSX • XLSM • XLS</em></label>
          <button className="primary-button full-button" type="button" disabled={!files.length || busy} onClick={() => run(api.upload(files))}>{busy ? 'Uploading…' : 'Upload and explore'} <span>→</span></button>
          {error && <div className="notice">{error}</div>}
        </div>
        <div className="demo-card panel-card"><div className="panel-heading"><div><span className="heading-icon accent"><Icon name="sparkles" /></span><div><h2>Explore a demo</h2><p>See the workspace with ready-to-use sample data.</p></div></div></div><button type="button" className="demo-option" onClick={() => run(api.demo('sales'))}><span className="demo-symbol">$</span><span><strong>Sales data</strong><small>Regions, categories and revenue</small></span><span>→</span></button><button type="button" className="demo-option" onClick={() => run(api.demo('school'))}><span className="demo-symbol">A</span><span><strong>School enrolment</strong><small>Students, subjects and scores</small></span><span>→</span></button></div>
      </div>
    </section>
  )
}

function DashboardPanel({ dataset }: { dataset: Dataset }) {
  const [slicers, setSlicers] = useState<Record<string, string[]>>({})
  const [selection, setSelection] = useState<Record<string, string[]>>({})
  const [dashboard, setDashboard] = useState<Dashboard>()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  useEffect(() => {
    api.slicers(dataset.id).then(setSlicers).catch(caught => setError(caught instanceof Error ? caught.message : 'Could not load filters'))
  }, [dataset.id])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true)
      api.dashboard(dataset.id, selection).then(setDashboard).catch(caught => setError(caught instanceof Error ? caught.message : 'Could not load dashboard')).finally(() => setLoading(false))
    }, 180)
    return () => clearTimeout(timeout)
  }, [dataset.id, selection])

  const orderedFilters = sortFilterEntries(Object.entries(slicers))
  const primaryFilters = orderedFilters.slice(0, Math.min(6, orderedFilters.length))
  const advancedFilters = orderedFilters.slice(primaryFilters.length)
  const activeFilters = Object.entries(selection).flatMap(([key, values]) => values.map(value => ({ key, value })))
  const updateFilter = (key: string, values: string[]) => setSelection(previous => {
    const next = { ...previous }
    if (values.length) next[key] = values
    else delete next[key]
    return next
  })
  const removeActiveFilter = (key: string, value: string) => setSelection(previous => {
    const nextValues = (previous[key] ?? []).filter(item => item !== value)
    const next = { ...previous }
    if (nextValues.length) next[key] = nextValues
    else delete next[key]
    return next
  })
  const renderFilter = ([key, values]: FilterEntry) => <FilterDropdown key={key} name={key} values={values} selected={selection[key] ?? []} onChange={nextValues => updateFilter(key, nextValues)} />

  return (
    <section className="content-stack">
      <div className="section-intro"><div><span className="eyebrow">OVERVIEW</span><h2>Explore your data</h2><p>Use filters to see the records, trends and summaries that matter.</p></div><button type="button" className="secondary-button" onClick={() => setSelection({})}><Icon name="refresh" size={16} /> Reset filters</button></div>
      {error && <div className="notice">{error}</div>}
      <div className="filter-bar">
        <div className="filter-bar-header"><div className="filter-title"><span className="heading-icon soft"><Icon name="dashboard" /></span><div><strong>Filters</strong><span>Search and select values to refine your dashboard.</span></div></div><span className="filter-count">{Object.keys(slicers).length} available</span></div>
        <div className="active-filters" aria-live="polite"><div className="active-filters-heading"><span>Active filters</span>{activeFilters.length > 0 && <button type="button" onClick={() => setSelection({})}>Clear all</button>}</div>{activeFilters.length > 0 ? <div className="active-filter-chips">{activeFilters.map(({ key, value }) => <span className="active-filter-chip" key={`${key}-${value}`}><strong>{key}</strong><span>{value}</span><button type="button" aria-label={`Remove ${key} filter ${value}`} onClick={() => removeActiveFilter(key, value)}>×</button></span>)}</div> : <span className="active-filter-empty">No filters applied. Choose a value below to update the dashboard.</span>}</div>
        {primaryFilters.length > 0 && <div className="filter-controls primary-filter-grid">{primaryFilters.map(renderFilter)}</div>}
        {advancedFilters.length > 0 && <div className={`advanced-filters ${advancedOpen ? 'open' : ''}`}><button type="button" className="advanced-toggle" aria-expanded={advancedOpen} onClick={() => setAdvancedOpen(value => !value)}><span><Icon name="chevron" size={15} /> Advanced Filters</span><small>{advancedFilters.length} more fields</small></button>{advancedOpen && <div className="filter-controls advanced-filter-grid">{advancedFilters.map(renderFilter)}</div>}</div>}
      </div>
      {loading && !dashboard ? <div className="loading-card"><span className="loading-orb" /><strong>Building your dashboard…</strong><span>Reading the latest dataset.</span></div> : dashboard && <>
        <div className="kpi-grid"><article className="kpi-card"><span className="kpi-icon blue"><Icon name="rows" /></span><div><small>Rows</small><strong>{formatNumber(dashboard.kpis.rows)}</strong></div></article><article className="kpi-card"><span className="kpi-icon purple"><Icon name="columns" /></span><div><small>Columns</small><strong>{formatNumber(dashboard.kpis.columns)}</strong></div></article><article className="kpi-card"><span className="kpi-icon orange"><Icon name="missing" /></span><div><small>Missing values</small><strong>{formatNumber(dashboard.kpis.missing)}</strong></div></article></div>
        {dashboard.kpis.rows === 0 && <div className="notice">No records match the current filters. Try resetting the filters.</div>}
         <div className="chart-grid">{dashboard.figures.map((figure, index) => <article className="chart-card" key={index}><div className="card-title"><div><span className="eyebrow">VISUALIZATION {String(index + 1).padStart(2, '0')}</span><h3>Data distribution</h3></div><span className="chart-dot" /></div><PlotlyChart figure={figure} /><small>Interactive visualization generated from the filtered data</small></article>)}</div>
        <details className="results-card"><summary><span><Icon name="table" size={17} /> Filtered data</span><b>{dashboard.table.length} rows shown</b></summary><div className="results-actions"><span>Preview of the first 500 filtered records</span><button type="button" className="secondary-button" onClick={() => downloadCsv(dashboard.table, 'filtered.csv', dashboard.columns)}><Icon name="download" size={16} /> Download CSV</button></div><PaginatedTable rows={dashboard.table} columns={dashboard.columns} /></details>
      </>}
    </section>
  )
}

function AskPanel({ dataset }: { dataset: Dataset }) {
  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const controller = useRef<AbortController | null>(null)
  const examples = ['How many rows are there?', 'Show columns', 'What is the average sales?', 'कितने records हैं?']

  const ask = async (event: FormEvent) => {
    event.preventDefault()
    const value = question.trim()
    if (!value || busy) return
    setBusy(true)
    setError('')
    controller.current = new AbortController()
    try {
      const answer = await api.ask(dataset.id, value, answers.map(item => ({ status: item.status, answer: item.answer, sql: item.sql })), controller.current.signal)
      setAnswers(previous => [...previous, answer])
      setQuestion('')
    } catch (caught) {
      if ((caught as Error).name !== 'AbortError') setError(caught instanceof Error ? caught.message : 'Could not answer the question')
    } finally { setBusy(false) }
  }

  return (
    <section className="ask-layout">
      <div className="ask-card panel-card">
        <div className="ask-heading"><div className="ask-title-icon"><Icon name="ask" size={23} /></div><div><span className="eyebrow">ASK AI</span><h2>Ask anything about your data</h2><p>Ask in natural language and get clear, verified insights from <strong>{dataset.name}</strong>.</p></div><span className="quick-tip"><Icon name="sparkles" size={15} /> Quick tips</span></div>
        <form onSubmit={ask}>
          <div className="question-wrap"><div className="question-icon"><Icon name="ask" size={20} /></div><textarea aria-label="Question" maxLength={1000} value={question} onChange={event => setQuestion(event.target.value)} placeholder="Type your question here…" /><span className="character-count">{question.length}/1000</span><button className="primary-button ask-submit" type="submit" disabled={busy || !question.trim()}>{busy ? 'Thinking…' : 'Ask'} <span>↗</span></button></div>
        </form>
        <div className="question-helper"><Icon name="sparkles" size={16} /><span>Try one of these questions</span></div>
        <div className="example-list">{examples.map(example => <button type="button" key={example} onClick={() => setQuestion(example)}><Icon name="sparkles" size={14} />{example}</button>)}</div>
        {error && <div className="notice">{error}</div>}
        {busy && <div className="ask-progress"><span className="loading-orb small" /><span>QueryPilot is checking the data and preparing a verified response…</span><button type="button" className="text-button" onClick={() => controller.current?.abort()}>Cancel</button></div>}
      </div>
      {answers.length > 0 && <div className="answer-stack">{answers.map((answer, index) => <article className="answer-card" aria-live="polite" key={`${answer.status}-${index}`}><div className="answer-meta"><span className={`status ${answer.status.replaceAll(' ', '-')}`}>{answer.status}</span>{answer.model_used && <span className="answer-engine">engine: {answer.model_used}</span>}</div><p className="answer-text">{answer.answer}</p>{answer.table && <Table rows={answer.table} />}<details className="proof-details"><summary>Proof &amp; SQL</summary><div className="proof-grid"><div><small>Generated SQL</small><pre>{answer.sql ?? 'No SQL was generated.'}</pre></div><div><small>Verification details</small><pre>{JSON.stringify(answer.proof, null, 2)}</pre></div></div></details></article>)}</div>}
    </section>
  )
}

function ExplorerPanel({ dataset }: { dataset: Dataset }) {
  const [table, setTable] = useState<TableResponse>()
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 50
  useEffect(() => { api.table(dataset.id, dataset.table, page, pageSize).then(setTable).catch(caught => setError(caught instanceof Error ? caught.message : 'Could not load table')) }, [dataset.id, dataset.table, page])
  return <section className="content-stack"><div className="section-intro"><div><span className="eyebrow">DATA EXPLORER</span><h2>Browse your records</h2><p>{formatNumber(dataset.profile.rows)} rows · {formatNumber(dataset.profile.columns)} columns in <strong>{dataset.table}</strong>.</p></div></div>{error && <div className="notice">{error}</div>}{table ? <div className="table-card panel-card"><div className="results-actions"><span>Showing page {table.page} of {table.pages || 1} · {table.total} total rows</span><button type="button" className="secondary-button" onClick={() => downloadCsv(table.rows, `dataset-page-${table.page}.csv`, table.columns)}><Icon name="download" size={16} /> Download page</button></div><Table rows={table.rows} columns={table.columns} /><Pagination page={table.page} pages={table.pages} total={table.total} pageSize={table.page_size} onChange={setPage} /></div> : <div className="loading-card"><span className="loading-orb" /><strong>Loading records…</strong></div>}</section>
}

function HistoryPanel() {
  const [history, setHistory] = useState<History[]>([])
  useEffect(() => { api.history().then(items => setHistory([...items].reverse())).catch(() => undefined) }, [])
  const rows = history as unknown as Record<string, unknown>[]
  return <section className="content-stack"><div className="section-intro"><div><span className="eyebrow">QUERY HISTORY</span><h2>Review previous questions</h2><p>Your latest questions and verification status are listed here.</p></div></div><div className="table-card panel-card"><Table rows={rows} /></div></section>
}

function QualityPanel({ dataset }: { dataset: Dataset }) {
  return <section className="content-stack"><div className="section-intro"><div><span className="eyebrow">DATA QUALITY</span><h2>Understand your dataset</h2><p>A quick profile of the records currently connected to your workspace.</p></div></div><div className="kpi-grid quality-kpis"><article className="kpi-card"><span className="kpi-icon blue"><Icon name="database" /></span><div><small>Tables</small><strong>1</strong></div></article><article className="kpi-card"><span className="kpi-icon orange"><Icon name="missing" /></span><div><small>Missing values</small><strong>{formatNumber(dataset.profile.missing)}</strong></div></article><article className="kpi-card"><span className="kpi-icon purple"><Icon name="columns" /></span><div><small>Columns</small><strong>{formatNumber(dataset.profile.columns)}</strong></div></article></div><div className="table-card panel-card"><div className="card-title"><div><span className="eyebrow">SCHEMA</span><h3>Column types</h3></div></div><Table rows={Object.entries(dataset.profile.dtypes).map(([column, dtype]) => ({ column, dtype }))} /></div></section>
}

function Workspace({ dataset, onChangeDataset, onLogout }: { dataset: Dataset; onChangeDataset: () => void; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('Ask AI')
  const [health, setHealth] = useState<Health>()

  useEffect(() => {
    const load = () => api.health().then(setHealth).catch(() => undefined)
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  let content: ReactNode
  if (tab === 'Dashboard') content = <DashboardPanel dataset={dataset} />
  else if (tab === 'Data Explorer') content = <ExplorerPanel dataset={dataset} />
  else if (tab === 'Data Quality') content = <QualityPanel dataset={dataset} />
  else if (tab === 'Query History') content = <HistoryPanel />
  else content = <AskPanel dataset={dataset} />

  return <div className="app-shell"><Sidebar dataset={dataset} active={tab} onSelect={setTab} onChangeDataset={onChangeDataset} /><main className="workspace-main"><PageTopbar title={tab} dataset={dataset} health={health} onChangeDataset={onChangeDataset} onLogout={onLogout} />{health && !health.ollama && <div className="basic-banner"><span className="status-dot" /><div><strong>Basic mode is active.</strong><span>Simple questions use the rules engine. Connect Ollama for complex questions.</span></div></div>}<div className="workspace-content">{content}</div></main></div>
}

export default function App() {
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('qp_user'))
  const [dataset, setDataset] = useState<Dataset>()

  useEffect(() => {
    const id = location.pathname.match(/^\/d\/([^/]+)/)?.[1]
    if (id) api.dataset(id).then(setDataset).catch(() => location.assign('/'))
  }, [])

  const go = (item: Dataset) => { history.pushState({}, '', `/d/${item.id}`); setDataset(item) }
  const changeDataset = () => { history.pushState({}, '', '/'); setDataset(undefined) }
  const login = (email: string) => { localStorage.setItem('qp_user', email); setUser(email) }
  const logout = () => { localStorage.removeItem('qp_user'); history.pushState({}, '', '/'); setDataset(undefined); setUser(null) }

  if (!user) return <Login done={login} />
  if (!dataset) return <div className="app-shell upload-shell"><Sidebar onSelect={() => undefined} onChangeDataset={changeDataset} /><main className="workspace-main"><PageTopbar title="Upload dataset" onChangeDataset={changeDataset} onLogout={logout} /><div className="workspace-content"><Upload go={go} /></div></main></div>
  return <Workspace dataset={dataset} onChangeDataset={changeDataset} onLogout={logout} />
}
