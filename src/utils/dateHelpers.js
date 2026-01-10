export const formatDate = (date) => date.toISOString().split('T')[0]

export const getToday = () => formatDate(new Date())

export const addDays = (dateStr, days) => {
  const date = new Date(dateStr + 'T00:00:00')
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

export const addMonths = (dateStr, months) => {
  const date = new Date(dateStr + 'T00:00:00')
  date.setMonth(date.getMonth() + months)
  return formatDate(date)
}

export const formatDateRange = (s, e) => {
  const start = new Date(s + 'T00:00:00')
  const end = new Date(e + 'T00:00:00')
  const opts = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}`
}

export const formatShortDate = (s) => {
  const date = new Date(s + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const currentYear = new Date().getFullYear()

export const monthNameToIndex = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
}

export const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December']

export const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const getDaysInMonth = (month) => {
  const mi = monthNameToIndex[month]
  return new Date(currentYear, mi + 1, 0).getDate()
}

export const getFirstDayOfMonth = (month) => {
  const mi = monthNameToIndex[month]
  return new Date(currentYear, mi, 1).getDay()
}
