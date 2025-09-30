import * as React from 'react'

export type TaskRow = {
    id?: string
    title?: string
    due?: string | null
    confidence?: number | null
    [k: string]: any
}

type Props = {
    rows: TaskRow[]
    onChange?: (rows: TaskRow[]) => void
}

export default function TaskPreviewTable({ rows, onChange }: Props) {
    const [local, setLocal] = React.useState<TaskRow[]>(rows)

    React.useEffect(() => {
        setLocal(rows)
    }, [rows])

    const update = (idx: number, patch: Partial<TaskRow>) => {
        const next = [...local]
        next[idx] = { ...next[idx], ...patch }
        setLocal(next)
        onChange?.(next)
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="grid grid-cols-[auto,1fr,auto,auto] gap-0 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
                <div className="py-1">#</div>
                <div className="py-1">Title</div>
                <div className="py-1">Due</div>
                <div className="py-1">Confidence</div>
            </div>
            <ul className="divide-y divide-gray-100">
                {local.length === 0 && <li className="p-4 text-sm text-gray-500">No candidates generated.</li>}
                {local.map((r, i) => (
                    <li key={r.id ?? i} className="grid grid-cols-[auto,1fr,auto,auto] items-center gap-3 px-4 py-2">
                        <div className="text-xs text-gray-500">{i + 1}</div>
                        <input
                            value={r.title ?? ''}
                            onChange={(e) => update(i, { title: e.target.value })}
                            className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm outline-none focus:border-gray-300"
                        />
                        <div className="text-xs text-gray-600">{r.due ?? '—'}</div>
                        <div className="text-xs text-gray-600">{r.confidence != null ? `${Math.round(r.confidence * 100)}%` : '—'}</div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
