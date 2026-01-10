import { Target, Check, Edit, X, BarChart } from './Icons'
import { formatDateRange, currentYear, monthNameToIndex, getDaysInMonth, getFirstDayOfMonth } from '../utils/dateHelpers'
import { getWeekStructureForDate, getBlockForDate, getSessionColor, getIntensityDots } from '../utils/goalHelpers'

export default function MonthlyView({
  goal,
  selectedMonth,
  trackingData,
  onBack,
  onSelectDate
}) {
  const monthIndex = monthNameToIndex[selectedMonth]
  const daysInMonth = getDaysInMonth(selectedMonth)
  const firstDay = getFirstDayOfMonth(selectedMonth)

  const getTracking = (date) => trackingData[`${selectedMonth}-${date}`] || null

  const getMonthMetrics = () => {
    let totalDays = 0, trackedDays = 0, completedOrModified = 0, skipped = 0
    let totalPlanned = 0, totalActual = 0, daysWithInt = 0

    for (let date = 1; date <= daysInMonth; date++) {
      const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
      const weekStructure = getWeekStructureForDate(goal, dateStr)
      const dayOfWeek = (firstDay + date - 1) % 7
      const planned = weekStructure[dayOfWeek]?.intensity || 0

      if (planned > 0) {
        totalDays++
        totalPlanned += planned
        const t = getTracking(date)
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

  const firstDateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-01`
  const displayWeekStructure = goal ? getWeekStructureForDate(goal, firstDateStr) : null
  const currentBlock = goal ? getBlockForDate(goal, firstDateStr) : null
  const metrics = goal ? getMonthMetrics() : null

  if (!goal) {
    return (
      <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
        <button onClick={onBack} className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2">← Back to Goal</button>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No goal for {selectedMonth}</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
      <button onClick={onBack} className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-2">← Back to Goal</button>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{selectedMonth} {currentYear}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm" style={{ backgroundColor: goal.color }}>
            <Target className="w-4 h-4" />{goal.name}
          </div>
          {currentBlock && (
            <span className="text-sm text-gray-500">
              Block: {currentBlock.name || formatDateRange(currentBlock.startDate, currentBlock.endDate)}
            </span>
          )}
        </div>
      </div>

      {goal.items.length > 0 && (
        <div className="mb-4 p-3 rounded-lg border-l-4 bg-white shadow-sm" style={{ borderLeftColor: goal.color }}>
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
                <span className="text-xs text-gray-500 mb-1">{metrics.completedOrModified}/{metrics.trackedDays} sessions</span>
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
        {displayWeekStructure && (
          <>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Weekly Plan</h2>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {displayWeekStructure.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="font-semibold text-xs text-gray-700 mb-1">{d.day.slice(0, 2)}</span>
                  <div className={`p-1 rounded border-2 ${getSessionColor(d.intensity)} min-h-14 w-full flex flex-col`}>
                    <p className="text-[9px] leading-tight flex-1">{d.session}</p>
                    <span className="text-[8px] opacity-60">{getIntensityDots(d.intensity)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Sessions</h2>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, idx) => <div key={`e-${idx}`} className="aspect-square" />)}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const date = idx + 1
              const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
              const weekStructure = getWeekStructureForDate(goal, dateStr)
              const t = getTracking(date)
              const dow = (firstDay + date - 1) % 7
              const di = weekStructure[dow]
              const isRest = di?.intensity === 0

              return (
                <button
                  key={date}
                  onClick={() => onSelectDate(date, t, di)}
                  className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-xs transition-all ${t?.status === 'completed' ? 'bg-green-100 border-green-400' : t?.status === 'modified' ? 'bg-yellow-100 border-yellow-400' : t?.status === 'skipped' ? 'bg-red-100 border-red-400' : isRest ? 'bg-gray-100 border-gray-200' : 'bg-gray-50 border-gray-200'}`}
                >
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
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-600" /> Completed</span>
            <span className="flex items-center gap-1"><Edit className="w-3 h-3 text-yellow-600" /> Modified</span>
            <span className="flex items-center gap-1"><X className="w-3 h-3 text-red-600" /> Skipped</span>
          </div>
        </div>
      </div>
    </div>
  )
}
