/**
 * Timeline Feature - Phase 4: Navigation & Jump-to-date
 *
 * JumpToDatePicker Component - Month/Year selector for jumping to specific dates
 */

import React, { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'

const MONTHS = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
]

const JumpToDatePicker = ({ onDateSelect, availableYears = [] }) => {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)

  // Generate years list (current year - 10 years back, or use available years)
  const years = availableYears.length > 0
    ? availableYears
    : Array.from({ length: 10 }, (_, i) => currentYear - i)

  // Reset year if not in available list
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(String(year))) {
      setYear(Number(availableYears[0]))
    }
  }, [availableYears, year])

  const handleJumpToDate = () => {
    const selectedDate = new Date(year, month, 1)
    console.log('🎯 Jump to date:', selectedDate, `(${MONTHS[month]} ${year})`)

    if (onDateSelect) {
      onDateSelect(selectedDate)
    }
  }

  return (
    <div className="jump-to-date-picker bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <Calendar className="w-5 h-5 text-purple-400" />
        <h3 className="font-bold text-sm">Gå til dato</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Month Selector */}
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="flex-1 px-3 py-2 bg-gray-700/50 rounded-lg border border-white/10 focus:border-purple-500 focus:outline-none transition"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>

        {/* Year Selector */}
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="flex-1 px-3 py-2 bg-gray-700/50 rounded-lg border border-white/10 focus:border-purple-500 focus:outline-none transition"
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Go Button */}
        <button
          onClick={handleJumpToDate}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          <span>Gå til</span>
        </button>
      </div>
    </div>
  )
}

export default JumpToDatePicker
