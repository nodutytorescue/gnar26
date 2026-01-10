import { useState } from "react"
import { Calendar, Plus, Trash2 } from './Icons'
import { formatDateRange, addDays, addMonths, getToday } from '../utils/dateHelpers'
import { getImageForGoal, goalColors, createDefaultBlock } from '../utils/goalHelpers'

export default function GoalsList({ 
  customGoals, 
  onSelectGoal, 
  onDeleteGoal, 
  onCreateGoal 
}) {
  const [showNewGoalForm, setShowNewGoalForm] = useState(false)
  const [newGoalName, setNewGoalName] = useState('')
  const [newGoalStartDate, setNewGoalStartDate] = useState(getToday())
  const [newGoalEndDate, setNewGoalEndDate] = useState(addMonths(getToday(), 3))
  const [newGoalImageUrl, setNewGoalImageUrl] = useState('')

  const getDefaultNewGoalDates = () => {
    if (customGoals.length === 0) {
      return { start: getToday(), end: addMonths(getToday(), 3) }
    }
    const latestGoal = customGoals.reduce((latest, goal) => {
      return goal.endDate > latest.endDate ? goal : latest
    }, customGoals[0])
    const newStart = addDays(latestGoal.endDate, 1)
    const newEnd = addMonths(newStart, 3)
    return { start: newStart, end: newEnd }
  }

  const openNewGoalForm = () => {
    const defaults = getDefaultNewGoalDates()
    setNewGoalStartDate(defaults.start)
    setNewGoalEndDate(defaults.end)
    setNewGoalImageUrl('')
    setShowNewGoalForm(true)
  }

  const closeNewGoalForm = () => {
    setShowNewGoalForm(false)
    setNewGoalName('')
    setNewGoalImageUrl('')
  }

  const handleCreateGoal = () => {
    if (!newGoalName.trim()) return
    const newGoal = {
      id: Date.now().toString(),
      name: newGoalName,
      startDate: newGoalStartDate,
      endDate: newGoalEndDate,
      items: [],
      weekStructure: null,
      color: goalColors[Math.floor(Math.random() * goalColors.length)],
      imageUrl: newGoalImageUrl,
      blocks: [createDefaultBlock(newGoalStartDate, newGoalEndDate)]
    }
    onCreateGoal(newGoal)
    closeNewGoalForm()
  }

  const getYearGlanceData = () => {
    const months = Array.from({ length: 12 }).map(() => null)
    customGoals.forEach(goal => {
      const startMonth = parseInt(goal.startDate.split('-')[1], 10) - 1
      const endMonth = parseInt(goal.endDate.split('-')[1], 10) - 1
      for (let i = startMonth; i <= endMonth; i++) {
        months[i] = { color: goal.color, name: goal.name }
      }
    })
    return months
  }

  const yearData = getYearGlanceData()

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Training Goals</h1>
        <p className="text-gray-600 text-sm">Tap a goal to view its season and track sessions</p>
      </div>

      {customGoals.length > 0 && (
        <div className="space-y-4 mb-6">
          {[...customGoals].sort((a, b) => a.startDate.localeCompare(b.startDate)).map((goal) => (
            <div
              key={goal.id}
              className="relative h-40 rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-transform hover:scale-[1.02]"
              onClick={() => onSelectGoal(goal.id)}
            >
              <img
                src={getImageForGoal(goal)}
                alt={goal.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-xl font-bold mb-1">{goal.name}</h3>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <Calendar className="w-4 h-4" />
                  <span>Season: {formatDateRange(goal.startDate, goal.endDate)}</span>
                  {goal.blocks && goal.blocks.length > 1 && (
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{goal.blocks.length} blocks</span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); if (confirm('Delete this goal?')) onDeleteGoal(goal.id) }}
                className="absolute top-3 right-3 p-2 bg-black/30 rounded-full text-white/80 hover:text-white hover:bg-black/50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {customGoals.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Year at a Glance</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-1 text-xs text-gray-500 mb-1">
              {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m, i) => (
                <div key={i} className="text-center">{m}</div>
              ))}
            </div>
            <div className="grid grid-cols-12 gap-1 h-8">
              {yearData.map((data, monthIdx) => (
                <div
                  key={monthIdx}
                  className={`rounded ${data ? '' : 'bg-gray-100'}`}
                  style={data ? { backgroundColor: data.color } : {}}
                  title={data ? data.name : 'No goal'}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {showNewGoalForm ? (
        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-blue-200">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Create New Goal</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
              <input
                type="text"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                placeholder="e.g., Build climbing endurance"
                className="w-full border rounded-lg px-3 py-2"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start</label>
                  <input type="date" value={newGoalStartDate} onChange={(e) => setNewGoalStartDate(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End</label>
                  <input type="date" value={newGoalEndDate} onChange={(e) => setNewGoalEndDate(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
              <input
                type="text"
                value={newGoalImageUrl}
                onChange={(e) => setNewGoalImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border rounded-lg px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank to auto-select based on goal name</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={closeNewGoalForm} className="px-4 py-2 text-gray-600">Cancel</button>
              <button
                onClick={handleCreateGoal}
                disabled={!newGoalName.trim()}
                className={`px-4 py-2 rounded-lg ${newGoalName.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400'}`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={openNewGoalForm}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add New Goal
        </button>
      )}
    </div>
  )
}
