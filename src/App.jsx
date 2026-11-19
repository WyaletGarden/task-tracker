import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

const ThemeContext = createContext(null)
const TASKS_KEY = 'tasktrack-tasks-v1'
const THEME_KEY = 'tasktrack-theme-v1'
const priorityLabels = { low: 'Thấp', medium: 'Trung bình', high: 'Cao' }

function localDate(offset = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function starterTasks() {
  return [
    { id: 1, title: 'Hoàn thiện báo cáo tài chính quý 1', priority: 'high', due: localDate(-1), done: false },
    { id: 2, title: 'Thiết kế slide thuyết trình dự án TaskTracker', priority: 'medium', due: localDate(), done: false },
    { id: 3, title: 'Review code Pull Request tính năng Dark Mode', priority: 'medium', due: localDate(1), done: false },
    { id: 4, title: 'Cập nhật tài liệu README và hướng dẫn cài đặt Vite', priority: 'low', due: localDate(6), done: false },
    { id: 5, title: 'Khởi tạo dự án React 18 với Vite & Tailwind CSS', priority: 'low', due: '', done: true, doneAt: Date.now() - 3600000 },
    { id: 6, title: 'Cấu hình React Context cho Light/Dark Mode', priority: 'high', due: '', done: true, doneAt: Date.now() - 1800000 },
  ]
}

function readTasks() {
  try {
    const saved = localStorage.getItem(TASKS_KEY)
    if (!saved) return starterTasks()
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : starterTasks()
  } catch {
    return starterTasks()
  }
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light' } catch { return 'light' }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem(THEME_KEY, theme) } catch { /* Trình duyệt có thể chặn lưu trữ. */ }
  }, [theme])

  const value = useMemo(() => ({ theme, toggleTheme: () => setTheme((current) => current === 'light' ? 'dark' : 'light') }), [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

function useTheme() {
  return useContext(ThemeContext)
}

function Icon({ name, className = 'h-4 w-4' }) {
  const paths = {
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></>,
    moon: <path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z" />,
    book: <path d="M12 7v14m0-14C10.8 6.2 9.2 6 7.5 6S4 6.2 3 7v13c1-.8 2.8-1 4.5-1s3.3.2 4.5 1m0-13c1.2-.8 2.8-1 4.5-1s3.5.2 4.5 1v13c-1-.8-2.8-1-4.5-1s-3.3.2-4.5 1" />,
    chat: <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    chart: <><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-5 5"/></>,
    plus: <path d="M12 5v14m-7-7h14" />,
    calendar: <><path d="M8 2v4m8-4v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    alert: <><path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 3h.01"/></>,
    edit: <><path d="m16 4 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15l-.8 5Z" /></>,
  }
  return <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">{paths[name]}</svg>
}

function Stat({ label, value, suffix, color, progress, icon }) {
  return (
    <article className="flex min-h-[112px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span><span className={color}><Icon name={icon} /></span></div>
      <div className="mt-3 flex items-baseline gap-1.5"><span className={`text-2xl font-bold leading-none ${color}`}>{value}</span><span className="text-xs text-slate-400">{suffix}</span></div>
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${progress >= 100 ? 'w-full' : ''} ${color.replace('text-', 'bg-')}`} style={{ width: `${progress}%` }} /></div>
    </article>
  )
}

function formatDue(due) {
  if (!due) return ''
  const [year, month, day] = due.split('-').map(Number)
  return new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'short' }).format(new Date(year, month - 1, day))
}

function TaskItem({ task, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const inputRef = useRef(null)
  const overdue = !task.done && task.due && task.due < localDate()

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const save = () => {
    const cleaned = title.trim()
    if (!cleaned) { inputRef.current?.focus(); return }
    onUpdate(task.id, cleaned)
    setEditing(false)
  }
  const cancel = () => { setTitle(task.title); setEditing(false) }
  const completionTime = task.doneAt ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(task.doneAt)) : ''

  if (editing) return (
    <article className="rounded-xl border-2 border-indigo-400 bg-white p-4 shadow-sm dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1"><input ref={inputRef} value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') save(); if (event.key === 'Escape') cancel() }} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" aria-label="Sửa tên công việc" />
          <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600"><span className="font-medium">Chế độ sửa</span><span className="text-slate-400">•</span><span className="text-slate-500">Enter để lưu, Esc để hủy</span></div></div>
        <div className="flex items-center gap-2 self-end sm:self-center"><button onClick={save} className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700">Lưu</button><button onClick={cancel} className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">Hủy</button></div>
      </div>
    </article>
  )

  return (
    <article className={`flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 ${task.done ? 'opacity-75' : ''}`}>
      <div className="flex min-w-0 items-start gap-3">
        <input type="checkbox" checked={task.done} onChange={() => onToggle(task.id)} aria-label={`${task.done ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}: ${task.title}`} className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-0 focus:ring-offset-0" />
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onToggle(task.id)} className={`text-left text-xs ${task.done ? 'font-normal text-slate-400 line-through' : 'font-semibold text-slate-900 dark:text-slate-100'}`}>{task.title}</button>
          <span className={`rounded border px-2 py-0.5 text-[10px] font-medium ${task.done ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : task.priority === 'high' ? 'border-rose-100 bg-rose-50 text-rose-600' : task.priority === 'medium' ? 'border-amber-100 bg-amber-50 text-amber-600' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>{task.done ? 'Đã xong' : `Ưu tiên ${priorityLabels[task.priority]}`}</span>
        </div>
          <div className={`mt-1 flex items-center gap-1.5 text-xs ${task.done ? 'text-slate-400' : overdue ? 'font-medium text-rose-600' : 'text-slate-500 dark:text-slate-400'}`}>
            {task.done ? <span>Hoàn thành lúc {completionTime}</span> : task.due ? <><Icon name="calendar" className={`h-3 w-3 ${overdue ? 'text-rose-500' : 'text-slate-400'}`} /><span>{overdue ? `${formatDue(task.due)} (Quá hạn)` : task.due === localDate() ? 'Hôm nay' : task.due === localDate(1) ? 'Ngày mai' : formatDue(task.due)}</span></> : <span>Không có hạn chót</span>}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-slate-300"><button type="button" title="Sửa" aria-label={`Sửa ${task.title}`} onClick={() => { setTitle(task.title); setEditing(true) }} className="p-1 transition-colors hover:text-slate-600 dark:hover:text-slate-200"><Icon name="edit" className="h-3.5 w-3.5" /></button><button type="button" title="Xóa" aria-label={`Xóa ${task.title}`} onClick={() => onDelete(task.id)} className="p-1 transition-colors hover:text-rose-500"><Icon name="trash" className="h-3.5 w-3.5" /></button></div>
    </article>
  )
}

function TaskTracker() {
  const [tasks, setTasks] = useState(readTasks)
  const nextId = useRef(tasks.reduce((largest, task) => Math.max(largest, task.id), 0) + 1)
  const [taskName, setTaskName] = useState('')
  const [priority, setPriority] = useState('medium')
  const [due, setDue] = useState('')
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const inputRef = useRef(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => { try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)) } catch { /* Bỏ qua khi bộ nhớ trình duyệt không khả dụng. */ } }, [tasks])

  const stats = useMemo(() => {
    const done = tasks.filter((task) => task.done).length
    return { total: tasks.length, done, active: tasks.length - done, rate: tasks.length ? Math.round((done / tasks.length) * 100) : 0 }
  }, [tasks])
  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'done' ? task.done : !task.done)
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesSearch = task.title.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi'))
    const matchesOverdue = !overdueOnly || (!task.done && task.due && task.due < localDate())
    return matchesStatus && matchesPriority && matchesSearch && matchesOverdue
  }), [tasks, statusFilter, priorityFilter, search, overdueOnly])

  const addTask = (event) => {
    event.preventDefault()
    const cleaned = taskName.trim()
    if (!cleaned) { setError('Vui lòng nhập tên công việc.'); inputRef.current?.focus(); return }
    setTasks((current) => [{ id: nextId.current++, title: cleaned, priority, due, done: false }, ...current])
    setTaskName(''); setDue(''); setPriority('medium'); setError(''); inputRef.current?.focus()
  }
  const toggleTask = (id) => setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done, doneAt: task.done ? undefined : Date.now() } : task))
  const deleteTask = (id) => setTasks((current) => current.filter((task) => task.id !== id))
  const updateTask = (id, title) => setTasks((current) => current.map((task) => task.id === id ? { ...task, title } : task))

  return (
    <main className="mx-auto flex w-full max-w-[940px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-0">
      <header className="flex flex-col justify-between gap-4 pb-2 sm:flex-row sm:items-center">
        <div><h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý Công việc</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Theo dõi tiến độ, phân loại mức độ ưu tiên và hoàn thành mục tiêu.</p></div>
        <div className="flex items-center gap-2.5"><button type="button" disabled={!stats.done} onClick={() => setTasks((current) => current.filter((task) => !task.done))} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"><Icon name="trash" className="h-3.5 w-3.5" /><span>Dọn việc xong ({stats.done})</span></button><button type="button" onClick={toggleTheme} aria-label={`Chuyển sang giao diện ${theme === 'light' ? 'tối' : 'sáng'}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"><Icon name={theme === 'light' ? 'moon' : 'sun'} className="h-3.5 w-3.5 text-slate-500" /><span>{theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}</span></button></div>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Thống kê công việc">
        <Stat label="Tổng số việc" value={stats.total} suffix="công việc" color="text-indigo-600" progress={stats.total ? 100 : 0} icon="book" />
        <Stat label="Đang thực hiện" value={stats.active} suffix="cần làm" color="text-amber-500" progress={stats.total ? stats.active / stats.total * 100 : 0} icon="chat" />
        <Stat label="Đã hoàn thành" value={stats.done} suffix="đã xong" color="text-emerald-600" progress={stats.total ? stats.done / stats.total * 100 : 0} icon="check" />
        <Stat label="Tỷ lệ hoàn thành" value={`${stats.rate}%`} suffix="tiến độ" color="text-indigo-600" progress={stats.rate} icon="chart" />
      </section>

      <form onSubmit={addTask} className="flex flex-col items-stretch gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center dark:border-slate-700 dark:bg-slate-900">
        <div className="flex min-w-0 flex-1 items-center gap-2 px-2"><Icon name="plus" className="h-4 w-4 shrink-0 text-slate-400" /><div className="min-w-0 flex-1"><input ref={inputRef} value={taskName} onChange={(event) => { setTaskName(event.target.value); if (error) setError('') }} placeholder="Thêm công việc mới... (nhấn Enter để lưu)" aria-label="Tên công việc mới" aria-invalid={Boolean(error)} className="w-full border-0 bg-transparent p-0 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100" />{error && <p className="mt-1 text-xs text-rose-600">{error}</p>}</div></div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"><span className="mr-1 text-slate-500">Độ ưu tiên:</span>{Object.entries(priorityLabels).map(([key, label]) => <button key={key} type="button" onClick={() => setPriority(key)} className={`rounded px-1.5 py-0.5 transition-colors ${priority === key ? `border border-slate-200/60 bg-white font-medium shadow-sm ${key === 'high' ? 'text-rose-600' : key === 'medium' ? 'text-amber-600' : 'text-slate-600'}` : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'}`}>{label === 'Trung bình' ? 'Vừa' : label}</button>)}</div>
          <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-900"><Icon name="calendar" className="h-3.5 w-3.5" /><input type="date" value={due} onChange={(event) => setDue(event.target.value)} aria-label="Hạn chót" className="w-[125px] border-0 bg-transparent p-0 text-xs text-slate-700 focus:outline-none focus:ring-0 dark:text-slate-200" /></label>
          <button type="submit" className="inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"><span>+</span><span>Thêm việc</span></button>
        </div>
      </form>

      <section className="flex flex-col items-stretch justify-between gap-3 pt-1 md:flex-row md:items-center" aria-label="Tìm kiếm và bộ lọc">
        <div className="relative w-full md:w-64"><Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên..." aria-label="Tìm theo tên" className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" /></div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">{[
          ['all', `Tất cả (${stats.total})`], ['active', `Đang làm (${stats.active})`], ['done', `Đã xong (${stats.done})`],
        ].map(([key, label]) => <button key={key} type="button" onClick={() => setStatusFilter(key)} className={`rounded-lg border border-slate-200 bg-white px-3 py-1.5 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 ${statusFilter === key ? 'font-medium text-indigo-600' : 'text-slate-600 dark:text-slate-300'}`}>{label}</button>)}
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} aria-label="Lọc theo độ ưu tiên" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><option value="all">Ưu tiên: Tất cả</option><option value="high">Cao</option><option value="medium">Trung bình</option><option value="low">Thấp</option></select>
          <button type="button" aria-pressed={overdueOnly} onClick={() => setOverdueOnly((current) => !current)} className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 ${overdueOnly ? 'font-medium text-amber-600' : 'text-slate-600 dark:text-slate-300'}`}><Icon name="alert" className="h-3.5 w-3.5 text-amber-500" /><span>Chỉ việc quá hạn</span></button>
        </div>
      </section>

      <section className="space-y-3" aria-label="Danh sách công việc">
        {visibleTasks.length ? visibleTasks.map((task) => <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onUpdate={updateTask} />) : <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">{tasks.length ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có công việc nào'}</div>}
      </section>

      <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-4 text-[11px] text-slate-400 sm:flex-row dark:border-slate-700"><div className="flex flex-wrap items-center justify-center gap-1.5"><span>React 18</span><span>•</span><span>Vite</span><span>•</span><span>Tailwind CSS</span><span>•</span><span className="font-medium text-emerald-600">Tự động lưu LocalStorage</span></div><div>TaskTrack Pro © {new Date().getFullYear()}</div></footer>
    </main>
  )
}

export default function App() {
  return <ThemeProvider><div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100"><TaskTracker /></div></ThemeProvider>
}
