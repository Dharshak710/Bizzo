const toneMap = {
  gray: 'bg-slate-100 text-slate-600',
  green: 'bg-emerald-100 text-emerald-700',
  yellow: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-brand-100 text-brand-700',
  indigo: 'bg-indigo-100 text-indigo-700',
}

export default function Badge({ children, tone = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${toneMap[tone] || toneMap.gray} ${className}`}>
      {children}
    </span>
  )
}

export function conditionTone(condition) {
  switch (condition) {
    case 'Excellent': return 'green'
    case 'Good': return 'blue'
    case 'Fair': return 'yellow'
    case 'Damaged': return 'red'
    case 'Needs Repair': return 'red'
    default: return 'gray'
  }
}

export function statusTone(status) {
  switch (status) {
    case 'upcoming': return 'blue'
    case 'ongoing': return 'green'
    case 'completed': return 'gray'
    case 'cancelled': return 'red'
    case 'reserved': return 'purple'
    case 'allocated': return 'blue'
    case 'returned': return 'green'
    case 'partial-return': return 'yellow'
    default: return 'gray'
  }
}
