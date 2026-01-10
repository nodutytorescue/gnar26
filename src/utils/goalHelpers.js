export const defaultWeekStructure = [
  { day: "Sunday", session: "Main session", intensity: 4 },
  { day: "Monday", session: "Easy / recovery", intensity: 1 },
  { day: "Tuesday", session: "Recovery", intensity: 0 },
  { day: "Wednesday", session: "Strength", intensity: 3 },
  { day: "Thursday", session: "Recovery", intensity: 0 },
  { day: "Friday", session: "Secondary session", intensity: 3 },
  { day: "Saturday", session: "Activity / rest", intensity: 2 }
]

export const defaultImages = {
  climb: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
  boulder: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
  bike: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&q=80',
  cycling: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&q=80',
  mountain: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&q=80',
  strength: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  weight: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80'
}

export const goalColors = ['#f97316', '#16a34a', '#9333ea', '#0891b2', '#dc2626', '#ca8a04', '#4f46e5', '#be185d']

export const getImageForGoal = (goal) => {
  if (goal.imageUrl) return goal.imageUrl
  const nameLower = goal.name.toLowerCase()
  for (const [keyword, url] of Object.entries(defaultImages)) {
    if (keyword !== 'default' && nameLower.includes(keyword)) return url
  }
  return defaultImages.default
}

export const createDefaultBlock = (startDate, endDate) => ({
  id: Date.now().toString(),
  name: '',
  startDate,
  endDate,
  weekStructure: JSON.parse(JSON.stringify(defaultWeekStructure))
})

export const migrateGoalToBlocks = (goal) => {
  if (goal.blocks && goal.blocks.length > 0) return goal
  return {
    ...goal,
    blocks: [createDefaultBlock(goal.startDate, goal.endDate)]
  }
}

export const getBlockForDate = (goal, dateStr) => {
  if (!goal.blocks || goal.blocks.length === 0) return null
  return goal.blocks.find(b => dateStr >= b.startDate && dateStr <= b.endDate) || null
}

export const getWeekStructureForDate = (goal, dateStr) => {
  const block = getBlockForDate(goal, dateStr)
  return block?.weekStructure || goal.weekStructure || defaultWeekStructure
}

export const getMonthsForGoal = (goal) => {
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const sm = parseInt(goal.startDate.split('-')[1], 10) - 1
  const em = parseInt(goal.endDate.split('-')[1], 10) - 1
  const months = []
  for (let i = sm; i <= em; i++) months.push(names[i])
  return months
}

export const getSessionColor = (intensity) => {
  const l = parseInt(intensity) || 0
  if (l === 0) return 'bg-gray-50 border-gray-200 text-gray-600'
  if (l <= 2) return 'bg-green-100 border-green-300 text-green-800'
  if (l === 3) return 'bg-yellow-100 border-yellow-300 text-yellow-800'
  if (l === 4) return 'bg-orange-100 border-orange-300 text-orange-800'
  return 'bg-red-100 border-red-300 text-red-800'
}

export const getIntensityDots = (intensity) => {
  const l = parseInt(intensity) || 0
  return '●'.repeat(l) + '○'.repeat(5 - l)
}
