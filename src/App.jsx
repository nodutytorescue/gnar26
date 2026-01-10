import { useState, useEffect } from 'react'
import { supabase, getUserId } from './lib/supabase'
import { currentYear, monthNameToIndex, getFirstDayOfMonth } from './utils/dateHelpers'
import { migrateGoalToBlocks, getWeekStructureForDate, getBlockForDate } from './utils/goalHelpers'

import GoalsList from './components/GoalsList'
import GoalDetail from './components/GoalDetail'
import MonthlyView from './components/MonthlyView'
import TrackingView from './components/TrackingView'

export default function App() {
  const [view, setView] = useState('goals-list')
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSessionInfo, setSelectedSessionInfo] = useState(null)
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [trackingData, setTrackingData] = useState({})
  const [customGoals, setCustomGoals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [initialTrackingState, setInitialTrackingState] = useState({ status: null, intensity: 0, notes: '' })
  const [userId] = useState(getUserId())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)

      if (goals) {
        setCustomGoals(goals.map(g => {
          const goal = {
            id: g.id,
            name: g.name,
            startDate: g.start_date,
            endDate: g.end_date,
            items: g.items || [],
            weekStructure: g.week_structure,
            color: g.color,
            imageUrl: g.image_url || '',
            blocks: g.blocks || null
          }
          return migrateGoalToBlocks(goal)
        }))
      }

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
        color: goal.color,
        image_url: goal.imageUrl || '',
        blocks: goal.blocks || null
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

  // Handlers for GoalsList
  const handleSelectGoal = (goalId) => {
    setSelectedGoal(goalId)
    setView('goal-detail')
  }

  const handleDeleteGoal = async (goalId) => {
    await deleteGoalFromDb(goalId)
    setCustomGoals(customGoals.filter(g => g.id !== goalId))
    if (selectedGoal === goalId) {
      setSelectedGoal(null)
      setView('goals-list')
    }
  }

  const handleCreateGoal = async (newGoal) => {
    await saveGoal(newGoal)
    setCustomGoals([...customGoals, newGoal])
    setSelectedGoal(newGoal.id)
    setView('goal-detail')
  }

  // Handlers for GoalDetail
  const handleSaveGoal = async (updatedGoal) => {
    await saveGoal(updatedGoal)
    setCustomGoals(customGoals.map(g => g.id === updatedGoal.id ? updatedGoal : g))
  }

  const handleNavigateToMonth = (month) => {
    setSelectedMonth(month)
    setView('monthly')
  }

  // Handlers for MonthlyView
  const handleSelectDate = (date, tracking, dayInfo) => {
    const goal = customGoals.find(g => g.id === selectedGoal)
    const monthIndex = monthNameToIndex[selectedMonth]
    const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    const block = goal ? getBlockForDate(goal, dateStr) : null

    setSelectedDate(date)
    setSelectedSessionInfo(dayInfo)
    setSelectedBlock(block)
    setInitialTrackingState({
      status: tracking?.status || null,
      intensity: tracking?.actualIntensity ?? dayInfo?.intensity ?? 0,
      notes: tracking?.notes || ''
    })
    setView('tracking')
  }

  // Handlers for TrackingView
  const handleSaveTracking = async (status, actualIntensity, notes) => {
    const goal = customGoals.find(g => g.id === selectedGoal)
    const monthIndex = monthNameToIndex[selectedMonth]
    const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
    const weekStructure = getWeekStructureForDate(goal, dateStr)
    const firstDay = getFirstDayOfMonth(selectedMonth)
    const dow = (firstDay + selectedDate - 1) % 7
    const planned = weekStructure[dow]?.intensity || 0

    await saveTrackingToDb(selectedMonth, selectedDate, status, actualIntensity, planned, notes)
    setTrackingData(prev => ({
      ...prev,
      [`${selectedMonth}-${selectedDate}`]: {
        status,
        actualIntensity,
        plannedIntensity: planned,
        notes
      }
    }))
    setView('monthly')
  }

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

  if (view === 'goals-list') {
    return (
      <GoalsList
        customGoals={customGoals}
        onSelectGoal={handleSelectGoal}
        onDeleteGoal={handleDeleteGoal}
        onCreateGoal={handleCreateGoal}
      />
    )
  }

  if (view === 'goal-detail' && selectedGoal) {
    const goal = customGoals.find(g => g.id === selectedGoal)
    if (!goal) { setView('goals-list'); return null }
    return (
      <GoalDetail
        goal={goal}
        onSave={handleSaveGoal}
        onBack={() => setView('goals-list')}
        onNavigateToMonth={handleNavigateToMonth}
      />
    )
  }

  if (view === 'monthly' && selectedMonth) {
    const goal = customGoals.find(g => g.id === selectedGoal)
    return (
      <MonthlyView
        goal={goal}
        selectedMonth={selectedMonth}
        trackingData={trackingData}
        onBack={() => setView('goal-detail')}
        onSelectDate={handleSelectDate}
      />
    )
  }

  if (view === 'tracking' && selectedDate && selectedMonth) {
    return (
      <TrackingView
        selectedMonth={selectedMonth}
        selectedDate={selectedDate}
        sessionInfo={selectedSessionInfo}
        block={selectedBlock}
        initialStatus={initialTrackingState.status}
        initialIntensity={initialTrackingState.intensity}
        initialNotes={initialTrackingState.notes}
        onSave={handleSaveTracking}
        onBack={() => setView('monthly')}
      />
    )
  }

  return null
}
