import { useState } from "react"
import { formatDateRange } from '../utils/dateHelpers'
import { getIntensityDots } from '../utils/goalHelpers'

export default function TrackingView({
  selectedMonth,
  selectedDate,
  sessionInfo,
  block,
  initialStatus,
  initialIntensity,
  initialNotes,
  onSave,
  onBack
}) {
  const [workoutStatus, setWorkoutStatus] = useState(initialStatus)
  const [actualIntensity, setActualIntensity] = useState(initialIntensity)
  const [workoutNotes, setWorkoutNotes] = useState(initialNotes)

  const planned = sessionInfo?.intensity || 0

  const handleSave = () => {
    if (!workoutStatus) return
    const actInt = workoutStatus === 'skipped' ? 0 : actualIntensity
    onSave(workoutStatus, actInt, workoutNotes)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen">
      <button onClick={onBack} className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2">← Back</button>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">{selectedMonth} {selectedDate}</h1>
        {sessionInfo && (
          <div>
            <p className="text-gray-600">{sessionInfo.day} - {sessionInfo.session}</p>
            <p className="text-sm text-gray-500">Planned intensity: {getIntensityDots(planned)}</p>
            {block && (
              <p className="text-xs text-gray-400 mt-1">Block: {block.name || formatDateRange(block.startDate, block.endDate)}</p>
            )}
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 space-y-5">
        <div>
          <h2 className="font-bold text-gray-800 mb-2">Session Status</h2>
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
        <button onClick={handleSave} disabled={!workoutStatus} className={`w-full p-3 rounded-lg font-semibold ${workoutStatus ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>Save Session</button>
      </div>
    </div>
  )
}
