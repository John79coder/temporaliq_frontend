// src/components/notion/TaskPreviewTable.tsx
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

    // Helpers for safe display
    const fmtPct = (n: number | null | undefined) =>
        n == null ? '—' : `${Math.round(n * 100)}%`
    const short = (s: string | null | undefined, n = 8) =>
        s ? (s.length > n ? `${s.slice(0, n)}…` : s) : '—'
    const show = (v: any) =>
        v == null || v === '' ? '—' : Array.isArray(v) ? (v.length ? v.join(', ') : '—') : String(v)

    return (
        <div className="overflow-auto rounded-xl border border-gray-200 bg-white">
            {/* Header */}
            <div
                className="
          min-w-[960px]
          grid grid-cols-[auto,1fr,auto,auto,auto,auto,auto,auto,auto,auto,auto]
          gap-0 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600
        "
            >
                <div className="py-1">#</div>
                <div className="py-1">Title</div>
                <div className="py-1">Due</div>
                <div className="py-1">Duration</div>
                <div className="py-1">Confidence</div>
                <div className="py-1">Priority</div>
                <div className="py-1">Status</div>
                <div className="py-1">Tags</div>
                <div className="py-1">Issues</div>
                <div className="py-1">Page</div>
                <div className="py-1">Blocks</div>
            </div>

            {/* Rows */}
            <ul className="divide-y divide-gray-100">
                {local.length === 0 && (
                    <li className="p-4 text-sm text-gray-500">No candidates generated.</li>
                )}
                {local.map((r, i) => {
                    // prefer normalized fields first; fall back to _raw
                    const raw = r._raw ?? {}
                    const due = r.due ?? r.due_date ?? raw.due_date ?? raw.date ?? null
                    const duration = r.duration ?? raw.duration
                    const priority = r.priority ?? raw.priority
                    const status = r.status ?? raw.status
                    const tags = r.tags ?? raw.tags
                    const issues: string[] = r.issues ?? raw.issues ?? []
                    const pageId = r.page_id ?? raw.page_id
                    const blocks = r.source_block_ids ?? raw.source_block_ids

                    return (
                        <li
                            key={r.id ?? i}
                            className="
                min-w-[960px]
                grid grid-cols-[auto,1fr,auto,auto,auto,auto,auto,auto,auto,auto,auto]
                items-center gap-3 px-4 py-2
              "
                        >
                            <div className="text-xs text-gray-500">{i + 1}</div>

                            {/* Title remains editable; everything else is read-only preview */}
                            <input
                                value={r.title ?? ''}
                                onChange={(e) => update(i, { title: e.target.value })}
                                className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm outline-none focus:border-gray-300"
                            />

                            <div className="text-xs text-gray-600">{show(due)}</div>
                            <div className="text-xs text-gray-600">{show(duration)}</div>
                            <div className="text-xs text-gray-600">{fmtPct(r.confidence)}</div>
                            <div className="text-xs text-gray-600">{show(priority)}</div>
                            <div className="text-xs text-gray-600">{show(status)}</div>
                            <div className="text-xs text-gray-600">{show(tags)}</div>
                            <div
                                className="text-xs text-gray-600"
                                title={issues && issues.length ? issues.join('\n') : undefined}
                            >
                                {Array.isArray(issues) ? issues.length || '—' : show(issues)}
                            </div>
                            <div className="text-xs text-gray-600">{short(pageId)}</div>
                            <div className="text-xs text-gray-600">
                                {Array.isArray(blocks) ? blocks.length : show(blocks)}
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
