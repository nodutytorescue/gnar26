import { useState, useEffect } from 'react'
import { supabase, getUserId } from './lib/supabase'

// Icons
const ChevronRight = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>)
const Target = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>)
const Check = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>)
const X = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>)
const Calendar = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>)
const Plus = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>)
const Trash2 = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" /></svg>)
const BarChart = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>)
const Edit = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>)

export default function App() {
  const [view, setView] = useState('annual')
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [trackingData, setTrackingData] = useState({})
  const [workoutStatus, setWorkoutStatus] = useState(null)
  const [actualIntensity, setActualIntensity] = useState(null)
  const [workoutNotes, setWorkoutNotes] = useState('')
  const [customGoals, setCustomGoals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [showNewGoalForm, setShowNewGoalForm] = useState(false)
  const [newGoalName, setNewGoalName] = useState('')
  const [newGoalStartDate, setNewGoalStartDate] = useState('2025-01-01')
  const [newGoalEndDate, setNewGoalEndDate] = useState('2025-12-31')
  const [editingGoalData, setEditingGoalData] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [userId] = useState(getUserId())

  // Load data from Supabase on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load goals
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
      
      if (goals) {
        setCustomGoals(goals.map(g => ({
          id: g.id,
          name: g.name,
          startDate: g.start_date,
          endDate: g.end_date,
          items: g.items || [],
          weekStructure: g.week_structure,
          color: g.color
        })))
      }

      // Load tracking
      const { data: tracking } = await supabase
        .from('tracking')
        .select('*')
        .eq('user_id', userId)
      
      if (tracking) {
        const trackingObj = {}
        tracking.forEach(t => {
          trackingObj[`${t.month}-${t.date}`] = {
            status: t.status,
            actualIntensity: t.actual_intensity,
            plannedIntensity: t.planned_intensity,
            notes: t.notes
          }
        })
        setTrackingData(trackingObj)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setIsLoading(false)
  }

  const saveGoal = async (goal) => {
    try {
      await supabase.from('goals').upsert({
        id: goal.id,
        user_id: userId,
        name: goal.name,
        start_date: goal.startDate,
        end_date: goal.endDate,
        items: goal.items,
        week_structure: goal.weekStructure,
        color: goal.color
      })
    } catch (error) {
      console.error('Error saving goal:', error)
    }
  }

  const deleteGoalFromDb = async (goalId) => {
    try {
      await supabase.from('goals').delete().eq('id', goalId)
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const saveTrackingToDb = async (month, date, status, actInt, planInt, notes) => {
    try {
      await supabase.from('tracking').upsert({
        user_id: userId,
        month,
        date,
        status,
        actual_intensity: actInt,
        planned_intensity: planInt,
        notes
      }, { onConflict: 'user_id,month,date' })
    } catch (error) {
      console.error('Error saving tracking:', error)
    }
  }

  // Helper functions
  const getTracking = (month, date) => trackingData[`${month}-${date}`] || null

  const getMonthMetrics = (month, weekStructure) => {
    const daysInMonth = getDaysInMonth(month)
    const firstDay = getFirstDayOfMonth(month)
    let totalDays = 0, trackedDays = 0, completedOrModified = 0, skipped = 0, totalPlanned = 0, totalActual = 0, daysWithInt = 0
    for (let date = 1; date <= daysInMonth; date++) {
      const dayOfWeek = (firstDay + date - 1) % 7
      const planned = weekStructure[dayOfWeek]?.intensity || 0
      if (planned > 0) {
        totalDays++; totalPlanned += planned
        const t = getTracking(month, date)
        if (t) {
          trackedDays++
          if (t.status === 'completed' || t.status === 'modified') completedOrModified++
          else if (t.status === 'skipped') skipped++
          if (t.actualIntensity != null) { totalActual += t.actualIntensity; daysWithInt++ }
        }
      }
    }
    const adherence = trackedDays > 0 ? Math.round((completedOrModified / trackedDays) * 100) : null
    const avgPlan = totalDays > 0 ? (totalPlanned / totalDays).toFixed(1) : 0
    const avgActual = daysWithInt > 0 ? (totalActual / daysWithInt).toFixed(1) : null
    const diff = avgActual !== null ? (avgActual - avgPlan).toFixed(1) : null
    return { totalDays, trackedDays, completedOrModified, skipped, adherence, avgPlan, avgActual, diff }
  }

  const createGoal = async () => {
    if (!newGoalName.trim()) return
    const defaultWeek = [
      { day: "Sunday", session: "Main session", intensity: 4 },
      { day: "Monday", session: "Easy / recovery", intensity: 1 },
      { day: "Tuesday", session: "Recovery", intensity: 0 },
      { day: "Wednesday", session: "Strength", intensity: 3 },
      { day: "Thursday", session: "Recovery", intensity: 0 },
      { day: "Friday", session: "Secondary session", intensity: 3 },
      { day: "Saturday", session: "Activity / rest", intensity: 2 }
    ]
    const colors = ['#f97316', '#16a34a', '#9333ea', '#0891b2', '#dc2626', '#ca8a04', '#4f46e5', '#be185d']
    const newGoal = { 
      id: Date.now().toString(), 
      name: newGoalName, 
      startDate: newGoalStartDate, 
      endDate: newGoalEndDate, 
      items: [], 
      weekStructure: defaultWeek, 
      color: colors[Math.floor(Math.random() * colors.length)] 
    }
    await saveGoal(newGoal)
    setCustomGoals([...customGoals, newGoal])
    setShowNewGoalForm(false)
    setNewGoalName('')
    setSelectedGoal(newGoal.id)
    setView('goal-detail')
  }

  const startEditing = (goal) => { 
    setEditingGoalData({ ...goal, weekStructure: goal.weekStructure.map(d => ({...d})), items: [...goal.items] })
    setHasUnsavedChanges(false) 
  }
  const updateField = (f, v) => { setEditingGoalData(p => ({ ...p, [f]: v })); setHasUnsavedChanges(true) }
  const updateWeekday = (idx, f, v) => { setEditingGoalData(p => ({ ...p, weekStructure: p.weekStructure.map((d, i) => i === idx ? { ...d, [f]: v } : d) })); setHasUnsavedChanges(true) }
  const updateItem = (idx, v) => { setEditingGoalData(p => ({ ...p, items: p.items.map((it, i) => i === idx ? v : it) })); setHasUnsavedChanges(true) }
  const addItem = () => { setEditingGoalData(p => ({ ...p, items: [...p.items, 'New goal item'] })); setHasUnsavedChanges(true) }
  const deleteItem = (idx) => { setEditingGoalData(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) })); setHasUnsavedChanges(true) }
  
  const saveEditing = async () => { 
    if (!editingGoalData) return
    await saveGoal(editingGoalData)
    setCustomGoals(customGoals.map(g => g.id === editingGoalData.id ? editingGoalData : g))
    setHasUnsavedChanges(false) 
  }
  
  const discardEditing = () => { 
    const orig = customGoals.find(g => g.id === editingGoalData?.id)
    if (orig) startEditing(orig) 
  }
  
  const deleteGoal = async (id) => { 
    await deleteGoalFromDb(id)
    setCustomGoals(customGoals.filter(g => g.id !== id))
    if (selectedGoal === id) { setSelectedGoal(null); setView('goals-list') } 
  }

  const formatDateRange = (s, e) => {
    const start = new Date(s + 'T00:00:00'), end = new Date(e + 'T00:00:00')
    const opts = { month: 'short', day: 'numeric' }
    return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}`
  }

  const getGoalsForMonth = (monthName) => {
    const mi = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11 }[monthName]
    return customGoals.filter(g => { 
      const sm = parseInt(g.startDate.split('-')[1], 10) - 1
      const em = parseInt(g.endDate.split('-')[1], 10) - 1
      return mi >= sm && mi <= em 
    })
  }
  
  const getMonthsForGoal = (g) => { 
    const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const sm = parseInt(g.startDate.split('-')[1], 10) - 1
    const em = parseInt(g.endDate.split('-')[1], 10) - 1
    const m = []
    for (let i = sm; i <= em; i++) m.push(names[i])
    return m 
  }
  
  const getDaysInMonth = (m) => { 
    const mi = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11 }[m]
    return new Date(2025, mi + 1, 0).getDate() 
  }
  
  const getFirstDayOfMonth = (m) => { 
    const mi = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11 }[m]
    return new Date(2025, mi, 1).getDay() 
  }
  
  const getSessionColor = (i) => { 
    const l = parseInt(i) || 0
    if (l === 0) return 'bg-gray-50 border-gray-200 text-gray-600'
    if (l <= 2) return 'bg-green-100 border-green-300 text-green-800'
    if (l === 3) return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    if (l === 4) return 'bg-orange-100 border-orange-300 text-orange-800'
    return 'bg-red-100 border-red-300 text-red-800' 
  }
  
  const getIntensityDots = (i) => { 
    const l = parseInt(i) || 0
    return '●'.repeat(l) + '○'.repeat(5 - l) 
  }
  
  const getColorForMonth = (idx) => { 
    const names = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const goals = getGoalsForMonth(names[idx])
    return goals.length > 0 ? goals[0].color : '#cbd5e1' 
  }

  const createPieSlice = (startAngle, endAngle, color) => {
    const cx = 250, cy = 250, r = 200, ir = 80
    const s = (startAngle - 90) * Math.PI / 180, e = (endAngle - 90) * Math.PI / 180
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s), x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e)
    const x3 = cx + ir * Math.cos(e), y3 = cy + ir * Math.sin(e), x4 = cx + ir * Math.cos(s), y4 = cy + ir * Math.sin(s)
    const la = endAngle - startAngle > 180 ? 1 : 0
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2} L ${x3} ${y3} A ${ir} ${ir} 0 ${la} 0 ${x4} ${y4} Z`} fill={color} />
  }

  const handleSaveTracking = async () => {
    if (!workoutStatus) return
    const goals = getGoalsForMonth(selectedMonth)
    const goal = goals.length > 0 ? goals[0] : null
    const firstDay = getFirstDayOfMonth(selectedMonth)
    const dow = (firstDay + selectedDate - 1) % 7
    const planned = goal?.weekStructure?.[dow]?.intensity || 0
    const actInt = workoutStatus === 'skipped' ? 0 : actualIntensity
    
    await saveTrackingToDb(selectedMonth, selectedDate, workoutStatus, actInt, planned, workoutNotes)
    setTrackingData(prev => ({
      ...prev,
      [`${selectedMonth}-${selectedDate}`]: {
        status: workoutStatus,
        actualIntensity: actInt,
        plannedIntensity: planned,
        notes: workoutNotes
      }
    }))
    setView('monthly')
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Annual View
  if (view === 'annual') {
    const monthAngle = 30
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const fullNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return (
      <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-1 text-gray-800">Training Calendar</h1>
          <p className="text-gray-600 text-sm">Tap months for plans • Manage goals below</p>
        </div>
        <div className="flex justify-center mb-8">
          <svg width="300" height="300" viewBox="0 0 500 500" className="drop-shadow-lg">
            {Array.from({ length: 12 }).map((_, idx) => <g key={idx}>{createPieSlice(idx * monthAngle, (idx + 1) * monthAngle, getColorForMonth(idx))}</g>)}
            {monthNames.map((month, idx) => {
              const angle = (idx * monthAngle - 90) * Math.PI / 180
              const x = 250 + 220 * Math.cos(angle), y = 250 + 220 * Math.sin(angle)
              const goals = getGoalsForMonth(fullNames[idx])
              const hasGoals = goals.length > 0
              return (
                <g key={idx} onClick={() => { setSelectedMonth(fullNames[idx]); setView('monthly') }} style={{ cursor: 'pointer' }}>
                  <circle cx={x} cy={y} r="20" fill="white" stroke={hasGoals ? goals[0].color : "#cbd5e1"} strokeWidth={hasGoals ? "3" : "2"} />
                  {hasGoals && <circle cx={x + 14} cy={y - 14} r="6" fill={goals[0].color} />}
                  <text x={x} y={y + 4} textAnchor="middle" className="text-xs font-semibold" fill="#374151" style={{ pointerEvents: 'none' }}>{month}</text>
                </g>
              )
            })}
            <circle cx="250" cy="250" r="70" fill="white" stroke="#cbd5e1" strokeWidth="2" />
            <text x="250" y="245" textAnchor="middle" className="text-sm font-bold" fill="#374151">2025</text>
            <text x="250" y="260" textAnchor="middle" className="text-xs" fill="#6b7280">Training Year</text>
          </svg>
        </div>
        <div className="flex justify-center">
          <button onClick={() => setView('goals-list')} className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-4 hover:shadow-lg transition-all text-left w-full max-w-md">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-800">Goals</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">{customGoals.length === 0 ? 'Create and track your training goals' : `${customGoals.length} goal${customGoals.length !== 1 ? 's' : ''} defined`}</p>
            <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
              <ChevronRight className="w-4 h-4" /> Manage Goals
            </div>
          </button>
        </div>
      </div>
    )
  }

  // Goals List
  if (view === 'goals-list') {
    return (
      <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
        <button onClick={() => setView('annual')} className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2">← Back</button>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Goals</h1>
          <button onClick={() => setShowNewGoalForm(true)} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-5 h-5" /> New
          </button>
        </div>
        {showNewGoalForm && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-2 border-blue-200">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Create New Goal</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input type="text" value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} placeholder="e.g., Build climbing endurance" className="w-full border rounded-lg px-3 py-2" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Start</label><input type="date" value={newGoalStartDate} onChange={(e) => setNewGoalStartDate(e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">End</label><input type="date" value={newGoalEndDate} onChange={(e) => setNewGoalEndDate(e.target.value)} className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowNewGoalForm(false); setNewGoalName('') }} className="px-4 py-2 text-gray-600">Cancel</button>
                <button onClick={createGoal} disabled={!newGoalName.trim()} className={`px-4 py-2 rounded-lg ${newGoalName.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400'}`}>Create</button>
              </div>
            </div>
          </div>
        )}
        {customGoals.length === 0 && !showNewGoalForm ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No goals yet</h2>
            <p className="text-gray-500 mb-4">Create your first goal to start</p>
            <button onClick={() => setShowNewGoalForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Create Goal</button>
          </div>
        ) : (
          <div className="space-y-3">
            {customGoals.map((goal) => (
              <div key={goal.id} className="bg-white rounded-lg shadow-md border-l-4 overflow-hidden" style={{ borderLeftColor: goal.color }}>
                <div className="p-4 cursor-pointer" onClick={() => { setSelectedGoal(goal.id); setView('goal-detail') }}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{goal.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4" />{formatDateRange(goal.startDate, goal.endDate)}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {getMonthsForGoal(goal).map((m) => (
                          <span key={m} className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: goal.color }}>{m}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this goal?')) deleteGoal(goal.id) }} className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Goal Detail
  if (view === 'goal-detail' && selectedGoal) {
    const goal = customGoals.find(g => g.id === selectedGoal)
    if (!goal) { setView('goals-list'); return null }
    if (!editingGoalData || editingGoalData.id !== goal.id) { startEditing(goal); return null }
    const data = editingGoalData
    return (
      <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen pb-24">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => { if (hasUnsavedChanges) { if (confirm('Discard changes?')) { setEditingGoalData(null); setHasUnsavedChanges(false); setView('goals-list') } } else { setEditingGoalData(null); setView('goals-list') } }} className="text-gray-600 hover:text-gray-800 flex items-center gap-2">← Back</button>
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <button onClick={discardEditing} className="px-3 py-1 text-gray-600 text-sm">Discard</button>
              <button onClick={saveEditing} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">Save</button>
            </div>
          )}
        </div>
        <div className="p-4 rounded-lg mb-4 text-white" style={{ backgroundColor: data.color }}>
          <input type="text" value={data.name} onChange={(e) => updateField('name', e.target.value)} className="w-full bg-transparent text-2xl font-bold mb-2 border-b border-white/30 focus:border-white outline-none" />
          <div className="flex items-center gap-2 text-sm opacity-90 mb-2"><Calendar className="w-4 h-4" />{formatDateRange(data.startDate, data.endDate)}</div>
          <div className="flex gap-3">
            <div><label className="text-xs opacity-70">Start</label><input type="date" value={data.startDate} onChange={(e) => updateField('startDate', e.target.value)} className="block bg-white/20 border border-white/40 rounded px-2 py-1 text-white text-sm" /></div>
            <div><label className="text-xs opacity-70">End</label><input type="date" value={data.endDate} onChange={(e) => updateField('endDate', e.target.value)} className="block bg-white/20 border border-white/40 rounded px-2 py-1 text-white text-sm" /></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Target className="w-5 h-5" />Goal Items</h2>
          {data.items.length === 0 ? <p className="text-gray-500 mb-3 text-sm">No items yet.</p> : (
            <ul className="space-y-2 mb-3">
              {data.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <ChevronRight className="w-4 h-4 mt-2 text-blue-600 flex-shrink-0" />
                  <input type="text" value={item} onChange={(e) => updateItem(idx, e.target.value)} className="flex-1 border rounded px-2 py-1 text-sm" />
                  <button onClick={() => deleteItem(idx)} className="p-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
          )}
          <button onClick={addItem} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus className="w-4 h-4" /> Add item</button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><Calendar className="w-5 h-5" />Weekly Plan</h2>
          <p className="text-xs text-gray-500 mb-3">Schedule for all weeks in this goal</p>
          <div className="space-y-2">
            {data.weekStructure?.map((d, idx) => (
              <div key={idx} className={`p-3 rounded-lg border-2 ${getSessionColor(d.intensity)}`}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold w-16 text-sm">{d.day.slice(0,3)}</span>
                    <input type="text" value={d.session} onChange={(e) => updateWeekday(idx, 'session', e.target.value)} className="flex-1 bg-transparent border-b border-current/30 focus:border-current outline-none px-1 text-sm" />
                  </div>
                  <div className="flex items-center gap-1 ml-16">
                    {[0,1,2,3,4,5].map((l) => (
                      <button key={l} onClick={() => updateWeekday(idx, 'intensity', l)} className={`w-7 h-7 rounded text-xs font-bold ${d.intensity === l ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`} style={{ backgroundColor: l === 0 ? '#e5e7eb' : l <= 2 ? '#22c55e' : l === 3 ? '#eab308' : l === 4 ? '#f97316' : '#ef4444', color: l === 0 ? '#6b7280' : 'white' }}>{l === 0 ? 'R' : l}</button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {hasUnsavedChanges && (
          <div className="fixed bottom-4 right-4">
            <button onClick={saveEditing} className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 flex items-center gap-2"><Check className="w-5 h-5" />Save</button>
          </div>
        )}
      </div>
    )
  }

  // Monthly View
  if (view === 'monthly' && selectedMonth) {
    const daysInMonth = getDaysInMonth(selectedMonth)
    const firstDay = getFirstDayOfMonth(selectedMonth)
    const goals = getGoalsForMonth(selectedMonth)
    const goal = goals.length > 0 ? goals[0] : null
    const week = goal?.weekStructure
    const metrics = week ? getMonthMetrics(selectedMonth, week) : null
    return (
      <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
        <button onClick={() => setView('annual')} className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2">← Back</button>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">{selectedMonth} 2025</h1>
          {goal && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm" style={{ backgroundColor: goal.color }}>
              <Target className="w-4 h-4" />{goal.name}
            </div>
          )}
        </div>
        {!goal && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No goal for {selectedMonth}</h2>
            <p className="text-gray-500 mb-4">Create a goal that covers this month</p>
            <button onClick={() => setView('goals-list')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Create Goal</button>
          </div>
        )}
        {goal && week && (
          <>
            {goal.items.length > 0 && (
              <div className="mb-4 p-3 rounded-lg border-l-4 bg-white shadow-sm cursor-pointer" style={{ borderLeftColor: goal.color }} onClick={() => { setSelectedGoal(goal.id); setView('goal-detail') }}>
                <h3 className="font-semibold text-gray-800 mb-1 text-sm">Goal Focus</h3>
                <ul className="space-y-1">
                  {goal.items.slice(0, 2).map((item, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: goal.color }} />{item}
                    </li>
                  ))}
                  {goal.items.length > 2 && <li className="text-xs text-gray-400">+{goal.items.length - 2} more</li>}
                </ul>
              </div>
            )}
            
            {metrics && metrics.trackedDays > 0 && (
              <div className="mb-4 p-4 rounded-lg bg-white shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2"><BarChart className="w-4 h-4" /> Monthly Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Plan Adherence</div>
                    <div className="flex items-end gap-2">
                      <span className={`text-2xl font-bold ${metrics.adherence >= 80 ? 'text-green-600' : metrics.adherence >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{metrics.adherence}%</span>
                      <span className="text-xs text-gray-500 mb-1">{metrics.completedOrModified}/{metrics.trackedDays} days</span>
                    </div>
                    {metrics.skipped > 0 && <div className="text-xs text-red-500 mt-1">{metrics.skipped} skipped</div>}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Intensity Alignment</div>
                    {metrics.avgActual !== null ? (
                      <>
                        <div className="flex items-end gap-2">
                          <span className={`text-2xl font-bold ${Math.abs(parseFloat(metrics.diff)) <= 0.5 ? 'text-green-600' : Math.abs(parseFloat(metrics.diff)) <= 1 ? 'text-yellow-600' : 'text-red-600'}`}>{parseFloat(metrics.diff) > 0 ? '+' : ''}{metrics.diff}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Plan: {metrics.avgPlan} → Actual: {metrics.avgActual}</div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-400">No data yet</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Training Plan</h2>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {week.map((d, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="font-semibold text-xs text-gray-700 mb-1">{d.day.slice(0, 2)}</span>
                    <div className={`p-1 rounded border-2 ${getSessionColor(d.intensity)} min-h-14 w-full flex flex-col`}>
                      <p className="text-[9px] leading-tight flex-1">{d.session}</p>
                      <span className="text-[8px] opacity-60">{getIntensityDots(d.intensity)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4">
                <h2 className="text-lg font-bold text-gray-800 mb-3">Track Workouts</h2>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, idx) => <div key={`e-${idx}`} className="aspect-square" />)}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const date = idx + 1
                    const t = getTracking(selectedMonth, date)
                    const dow = (firstDay + date - 1) % 7
                    const di = week[dow]
                    const isRest = di?.intensity === 0
                    return (
                      <button key={date} onClick={() => { setSelectedDate(date); setWorkoutStatus(t?.status || null); setActualIntensity(t?.actualIntensity ?? di?.intensity ?? 0); setWorkoutNotes(t?.notes || ''); setView('tracking') }}
                        className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-xs transition-all ${t?.status === 'completed' ? 'bg-green-100 border-green-400' : t?.status === 'modified' ? 'bg-yellow-100 border-yellow-400' : t?.status === 'skipped' ? 'bg-red-100 border-red-400' : isRest ? 'bg-gray-100 border-gray-200' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="font-bold">{date}</span>
                        {t?.status && (
                          <span className="mt-0.5">
                            {t.status === 'completed' && <Check className="w-2 h-2 text-green-600" />}
                            {t.status === 'modified' && <Edit className="w-2 h-2 text-yellow-600" />}
                            {t.status === 'skipped' && <X className="w-2 h-2 text-red-600" />}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-3 flex gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-600" /> Done</span>
                  <span className="flex items-center gap-1"><Edit className="w-3 h-3 text-yellow-600" /> Modified</span>
                  <span className="flex items-center gap-1"><X className="w-3 h-3 text-red-600" /> Skipped</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Tracking View
  if (view === 'tracking' && selectedDate && selectedMonth) {
    const goals = getGoalsForMonth(selectedMonth)
    const goal = goals.length > 0 ? goals[0] : null
    const firstDay = getFirstDayOfMonth(selectedMonth)
    const dow = (firstDay + selectedDate - 1) % 7
    const di = goal?.weekStructure?.[dow]
    const planned = di?.intensity || 0
    return (
      <div className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen">
        <button onClick={() => setView('monthly')} className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2">← Back</button>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{selectedMonth} {selectedDate}</h1>
          {di && (
            <div>
              <p className="text-gray-600">{di.day} - {di.session}</p>
              <p className="text-sm text-gray-500">Planned intensity: {getIntensityDots(planned)}</p>
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 space-y-5">
          <div>
            <h2 className="font-bold text-gray-800 mb-2">How did it go?</h2>
            <div className="flex gap-2">
              {[
                { s: 'completed', l: 'Completed', bg: 'bg-green-100', bd: 'border-green-400', tx: 'text-green-700' },
                { s: 'modified', l: 'Modified', bg: 'bg-yellow-100', bd: 'border-yellow-400', tx: 'text-yellow-700' },
                { s: 'skipped', l: 'Skipped', bg: 'bg-red-100', bd: 'border-red-400', tx: 'text-red-700' }
              ].map(({ s, l, bg, bd, tx }) => (
                <button key={s} onClick={() => setWorkoutStatus(s)} className={`flex-1 p-3 rounded-lg border-2 transition-all ${workoutStatus === s ? `${bg} ${bd}` : 'bg-gray-50 border-gray-200'}`}>
                  <span className={`text-sm font-medium ${workoutStatus === s ? tx : 'text-gray-600'}`}>{l}</span>
                </button>
              ))}
            </div>
          </div>
          {workoutStatus && workoutStatus !== 'skipped' && (
            <div>
              <h2 className="font-bold text-gray-800 mb-2">Actual Intensity</h2>
              <div className="flex gap-2">
                {[0,1,2,3,4,5].map((l) => (
                  <button key={l} onClick={() => setActualIntensity(l)} className={`flex-1 h-12 rounded-lg text-sm font-bold transition-all ${actualIntensity === l ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`} style={{ backgroundColor: l === 0 ? '#e5e7eb' : l <= 2 ? '#22c55e' : l === 3 ? '#eab308' : l === 4 ? '#f97316' : '#ef4444', color: l === 0 ? '#6b7280' : 'white' }}>{l === 0 ? 'Rest' : l}</button>
                ))}
              </div>
              {planned > 0 && actualIntensity !== null && actualIntensity !== planned && (
                <p className="text-xs text-gray-500 mt-2">{actualIntensity > planned ? '↑' : '↓'} {Math.abs(actualIntensity - planned)} from planned ({planned})</p>
              )}
            </div>
          )}
          <div>
            <h2 className="font-bold text-gray-800 mb-2">Notes</h2>
            <textarea value={workoutNotes} onChange={(e) => setWorkoutNotes(e.target.value)} placeholder="How did you feel? Any modifications?" className="w-full p-3 border rounded-lg resize-none h-24" />
          </div>
          <button onClick={handleSaveTracking} disabled={!workoutStatus} className={`w-full p-3 rounded-lg font-semibold ${workoutStatus ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>Save</button>
        </div>
      </div>
    )
  }

  return null
}