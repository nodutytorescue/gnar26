import { useState, useEffect } from 'react'
import { ChevronRight, Target, Calendar, Plus, Trash2, Check, X, Scissors } from './Icons'
import { formatDateRange, formatShortDate, shortMonthNames, monthNames } from '../utils/dateHelpers'
import { getImageForGoal, getSessionColor, getMonthsForGoal } from '../utils/goalHelpers'
import { addDays } from '../utils/dateHelpers'

// Settings icon
const Settings = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export default function GoalDetail({
  goal,
  onSave,
  onBack,
  onNavigateToMonth
}) {
  const [editingData, setEditingData] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [expandedBlock, setExpandedBlock] = useState(null)
  const [splitBlockId, setSplitBlockId] = useState(null)
  const [splitDate, setSplitDate] = useState('')
  const [showBlocks, setShowBlocks] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (goal) {
      setEditingData({
        ...goal,
        blocks: goal.blocks.map(b => ({ ...b, weekStructure: b.weekStructure.map(d => ({...d})) })),
        items: [...goal.items]
      })
      setExpandedBlock(null)
      setHasUnsavedChanges(false)
    }
  }, [goal?.id])

  if (!editingData) return null

  const data = editingData

  const updateField = (f, v) => { setEditingData(p => ({ ...p, [f]: v })); setHasUnsavedChanges(true) }
  const updateItem = (idx, v) => { setEditingData(p => ({ ...p, items: p.items.map((it, i) => i === idx ? v : it) })); setHasUnsavedChanges(true) }
  const addItem = () => { setEditingData(p => ({ ...p, items: [...p.items, 'New goal item'] })); setHasUnsavedChanges(true) }
  const deleteItem = (idx) => { setEditingData(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) })); setHasUnsavedChanges(true) }

  const updateBlockField = (blockId, field, value) => {
    setEditingData(p => ({
      ...p,
      blocks: p.blocks.map(b => b.id === blockId ? { ...b, [field]: value } : b)
    }))
    setHasUnsavedChanges(true)
  }

  const updateBlockWeekday = (blockId, dayIdx, field, value) => {
    setEditingData(p => ({
      ...p,
      blocks: p.blocks.map(b => b.id === blockId ? {
        ...b,
        weekStructure: b.weekStructure.map((d, i) => i === dayIdx ? { ...d, [field]: value } : d)
      } : b)
    }))
    setHasUnsavedChanges(true)
  }

  const splitBlock = (blockId, splitDateStr) => {
    if (!splitDateStr) return
    setEditingData(p => {
      const blockIndex = p.blocks.findIndex(b => b.id === blockId)
      if (blockIndex === -1) return p
      const block = p.blocks[blockIndex]

      if (splitDateStr <= block.startDate || splitDateStr > block.endDate) return p

      const newBlock1 = { ...block, id: block.id, endDate: addDays(splitDateStr, -1) }
      const newBlock2 = {
        id: Date.now().toString(),
        name: '',
        startDate: splitDateStr,
        endDate: block.endDate,
        weekStructure: JSON.parse(JSON.stringify(block.weekStructure))
      }

      const newBlocks = [...p.blocks]
      newBlocks.splice(blockIndex, 1, newBlock1, newBlock2)
      return { ...p, blocks: newBlocks }
    })
    setSplitBlockId(null)
    setSplitDate('')
    setHasUnsavedChanges(true)
  }

  const deleteBlock = (blockId) => {
    setEditingData(p => {
      if (p.blocks.length <= 1) return p
      const blockIndex = p.blocks.findIndex(b => b.id === blockId)
      if (blockIndex === -1) return p

      const newBlocks = [...p.blocks]
      const deletedBlock = newBlocks[blockIndex]

      if (blockIndex > 0) {
        newBlocks[blockIndex - 1] = { ...newBlocks[blockIndex - 1], endDate: deletedBlock.endDate }
      } else if (newBlocks.length > 1) {
        newBlocks[1] = { ...newBlocks[1], startDate: deletedBlock.startDate }
      }

      newBlocks.splice(blockIndex, 1)
      return { ...p, blocks: newBlocks }
    })
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    onSave(editingData)
    setHasUnsavedChanges(false)
  }

  const handleDiscard = () => {
    setEditingData({
      ...goal,
      blocks: goal.blocks.map(b => ({ ...b, weekStructure: b.weekStructure.map(d => ({...d})) })),
      items: [...goal.items]
    })
    setHasUnsavedChanges(false)
  }

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (confirm('Discard changes?')) onBack()
    } else {
      onBack()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen pb-24">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handleBack} className="text-gray-600 hover:text-gray-800 flex items-center gap-2">← Back</button>
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2">
            <button onClick={handleDiscard} className="px-3 py-1 text-gray-600 text-sm">Discard</button>
            <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">Save</button>
          </div>
        )}
      </div>

      {/* Goal Header */}
      <div className="relative h-32 rounded-xl overflow-hidden mb-4">
        <img src={getImageForGoal(data)} alt={data.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <input type="text" value={data.name} onChange={(e) => updateField('name', e.target.value)} className="w-full bg-transparent text-2xl font-bold border-b border-white/30 focus:border-white outline-none" />
          <div className="flex items-center gap-2 text-sm opacity-90 mt-1">
            <Calendar className="w-4 h-4" />
            <span>Season: {formatDateRange(data.startDate, data.endDate)}</span>
          </div>
        </div>
      </div>

      {/* Goal Focus */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Target className="w-5 h-5" />Goal Focus</h2>
        {data.items.length === 0 ? <p className="text-gray-500 mb-3 text-sm">What are you working toward this season?</p> : (
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
        <button onClick={addItem} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus className="w-4 h-4" /> Add focus item</button>
      </div>

      {/* Track Sessions - MOVED UP */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Track Sessions</h2>
        <p className="text-xs text-gray-500 mb-3">Select a month to log your training sessions.</p>
        <div className="grid grid-cols-4 gap-2">
          {getMonthsForGoal(goal).map((m) => {
            const fullMonth = monthNames[shortMonthNames.indexOf(m)]
            return (
              <button
                key={m}
                onClick={() => onNavigateToMonth(fullMonth)}
                className="p-3 rounded-lg text-white text-sm font-semibold"
                style={{ backgroundColor: goal.color }}
              >
                {m}
              </button>
            )
          })}
        </div>
      </div>

      {/* Training Blocks - COLLAPSIBLE */}
      <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
        <button
          onClick={() => setShowBlocks(!showBlocks)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5" />Training Blocks
            <span className="text-sm font-normal text-gray-500">({data.blocks?.length || 1})</span>
          </h2>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showBlocks ? 'rotate-90' : ''}`} />
        </button>

        {showBlocks && (
          <div className="px-4 pb-4 border-t">
            <p className="text-xs text-gray-500 my-3">Divide your season into blocks. Each block has its own weekly plan.</p>

            <div className="space-y-3">
              {data.blocks?.map((block, blockIdx) => (
                <div key={block.id} className="border-2 rounded-lg overflow-hidden" style={{ borderColor: data.color }}>
                  <div
                    className="p-3 flex items-center justify-between cursor-pointer"
                    style={{ backgroundColor: expandedBlock === block.id ? data.color + '20' : 'transparent' }}
                    onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        value={block.name}
                        onChange={(e) => { e.stopPropagation(); updateBlockField(block.id, 'name', e.target.value) }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder={`Block ${blockIdx + 1}`}
                        className="font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {formatShortDate(block.startDate)} → {formatShortDate(block.endDate)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {data.blocks.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); if (confirm('Delete this block? Adjacent block will expand.')) deleteBlock(block.id) }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedBlock === block.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {expandedBlock === block.id && (
                    <div className="p-3 border-t bg-gray-50">
                      {splitBlockId === block.id ? (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-800 mb-2">Split block at date:</p>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={splitDate}
                              onChange={(e) => setSplitDate(e.target.value)}
                              min={addDays(block.startDate, 1)}
                              max={block.endDate}
                              className="flex-1 border rounded px-2 py-1 text-sm"
                            />
                            <button onClick={() => splitBlock(block.id, splitDate)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Split</button>
                            <button onClick={() => { setSplitBlockId(null); setSplitDate('') }} className="px-3 py-1 text-gray-600 text-sm">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setSplitBlockId(block.id); setSplitDate('') }}
                          className="mb-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Scissors className="w-4 h-4" /> Split this block
                        </button>
                      )}

                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Weekly Plan</h4>
                      <div className="space-y-2">
                        {block.weekStructure?.map((d, dayIdx) => (
                          <div key={dayIdx} className={`p-2 rounded-lg border ${getSessionColor(d.intensity)}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold w-12 text-xs">{d.day.slice(0,3)}</span>
                              <input
                                type="text"
                                value={d.session}
                                onChange={(e) => updateBlockWeekday(block.id, dayIdx, 'session', e.target.value)}
                                className="flex-1 bg-transparent border-b border-current/30 focus:border-current outline-none px-1 text-sm"
                              />
                            </div>
                            <div className="flex gap-1 ml-14">
                              {[0,1,2,3,4,5].map((l) => (
                                <button
                                  key={l}
                                  onClick={() => updateBlockWeekday(block.id, dayIdx, 'intensity', l)}
                                  className={`w-8 h-8 rounded text-xs font-bold ${d.intensity === l ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                                  style={{ backgroundColor: l === 0 ? '#e5e7eb' : l <= 2 ? '#22c55e' : l === 3 ? '#eab308' : l === 4 ? '#f97316' : '#ef4444', color: l === 0 ? '#6b7280' : 'white' }}
                                >
                                  {l === 0 ? 'R' : l}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings - COLLAPSIBLE */}
      <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5" />Settings
          </h2>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showSettings ? 'rotate-90' : ''}`} />
        </button>

        {showSettings && (
          <div className="px-4 pb-4 border-t">
            <div className="mt-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Season Dates</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><label className="block text-xs text-gray-500 mb-1">Start</label><input type="date" value={data.startDate} onChange={(e) => updateField('startDate', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">End</label><input type="date" value={data.endDate} onChange={(e) => updateField('endDate', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" /></div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Image URL</label>
                <input type="text" value={data.imageUrl || ''} onChange={(e) => updateField('imageUrl', e.target.value)} placeholder="https://..." className="w-full border rounded px-2 py-1 text-sm" />
              </div>
            </div>
          </div>
        )}
      </div>

      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4">
          <button onClick={handleSave} className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 flex items-center gap-2"><Check className="w-5 h-5" />Save</button>
        </div>
      )}
    </div>
  )
}
