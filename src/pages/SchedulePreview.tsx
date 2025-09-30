// src/pages/SchedulePreview.tsx
import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listCalendars } from '@/api/icloud'
import { previewSchedule, confirmSchedule, type TimeBlock } from '@/api/schedule'
import { useAuthStore } from '@/stores/authStore'

function toISOStart(d: Date): string {
    // normalize to 00:00:00 local then to ISO
    const dt = new Date(d)
    dt.setHours(0, 0, 0, 0)
    return dt.toISOString()
}

function toISOEnd(d: Date): string {
    // normalize to 23:59:59 local then to ISO
    const dt = new Date(d)
    dt.setHours(23, 59, 59, 999)
    return dt.toISOString()
}

export default function SchedulePreview() {
    const [params] = useSearchParams()
    const dbId = params.get('db') || '' // required by backend preview payload
    const navigate = useNavigate()

    const user = useAuthStore((s) => s.user)
    const userId = user?.id
    const [calendarId, setCalendarId] = React.useState<string>('')
    const [startDate, setStartDate] = React.useState<string>(() => new Date().toISOString().slice(0, 10))
    const [endDate, setEndDate] = React.useState<string>(() => {
        const d = new Date()
        d.setDate(d.getDate() + 7)
        return d.toISOString().slice(0, 10)
    })
    const [earliest, setEarliest] = React.useState<string>('09:00')
    const [latest, setLatest] = React.useState<string>('17:00')
    const [blocks, setBlocks] = React.useState<TimeBlock[] | null>(null)
    const [submitting, setSubmitting] = React.useState(false)
    const [loadingPreview, setLoadingPreview] = React.useState(false)
    const [error, setError] = React.useState<string>('')

    // Load calendars
    const { data: calendars, isLoading: calLoading, isError: calError } = useQuery({
        queryKey: ['icloud', 'calendars'],
        queryFn: listCalendars,
        staleTime: 60_000,
    })

    React.useEffect(() => {
        if (calendars && calendars.length && !calendarId) {
            // pick first by default
            setCalendarId(String(calendars[0].id ?? ''))
        }
    }, [calendars, calendarId])

    const handlePreview = async () => {
        setError('')
        setBlocks(null)
        if (!userId) {
            setError('Missing user id')
            return
        }
        if (!dbId) {
            setError('Missing Notion database id')
            return
        }
        if (!calendarId) {
            setError('Please select a calendar')
            return
        }
        setLoadingPreview(true)
        try {
            const startISO = toISOStart(new Date(startDate))
            const endISO = toISOEnd(new Date(endDate))
            const res = await previewSchedule({
                user_id: userId,
                notion_db_id: dbId,
                calendar_id: calendarId,
                start_date: startISO,
                end_date: endISO,
                earliest_time: earliest,
                latest_time: latest,
            })
            setBlocks(Array.isArray(res?.time_blocks) ? res.time_blocks : [])
        } catch (e: any) {
            setError(e?.response?.data?.detail || e?.message || 'Failed to preview')
        } finally {
            setLoadingPreview(false)
        }
    }

    const handleConfirm = async () => {
        setError('')
        if (!userId || !calendarId || !blocks?.length) return
        setSubmitting(true)
        try {
            const res = await confirmSchedule({
                user_id: userId,
                calendar_id: calendarId,
                time_blocks: blocks.map((b) => ({ start: b.start, end: b.end, task_id: b.task_id ?? null })),
            })
            // minimal success UX; you can refine with toast
            alert(res?.message ?? 'Scheduled!')
            navigate('/dashboard')
        } catch (e: any) {
            setError(e?.response?.data?.detail || e?.message || 'Failed to confirm schedule')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1 className="mb-2 text-2xl font-semibold">Schedule Preview</h1>
            <p className="mb-6 text-gray-600">Pick a calendar and window, preview time blocks, then confirm.</p>

            <div className="mb-4 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                >
                    Back
                </button>
            </div>

            {/* Calendar / window controls */}
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="col-span-1">
                    <label className="mb-1 block text-sm text-gray-700">Calendar</label>
                    {calLoading ? (
                        <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
                    ) : calError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                            Failed to load calendars.
                        </div>
                    ) : (
                        <select
                            value={calendarId}
                            onChange={(e) => setCalendarId(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                        >
                            {(calendars ?? []).map((c) => (
                                <option key={String(c.id)} value={String(c.id)}>
                                    {String(c.title ?? c.id)}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="col-span-1 grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1 block text-sm text-gray-700">Start date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-gray-700">End date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <div className="col-span-1 grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1 block text-sm text-gray-700">Earliest time</label>
                        <input
                            type="time"
                            value={earliest}
                            onChange={(e) => setEarliest(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-gray-700">Latest time</label>
                        <input
                            type="time"
                            value={latest}
                            onChange={(e) => setLatest(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="mb-6 flex items-center gap-3">
                <button
                    onClick={handlePreview}
                    disabled={loadingPreview || !calendarId}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                    {loadingPreview ? 'Previewing…' : 'Preview time blocks'}
                </button>
            </div>

            {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            {/* Blocks list */}
            {blocks && (
                <div className="mb-4 rounded-xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 px-4 py-3 text-sm font-medium">Previewed Time Blocks</div>
                    <div className="divide-y divide-gray-100">
                        {blocks.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-600">No available blocks for the selected window.</div>
                        ) : (
                            blocks.map((b, i) => (
                                <div key={i} className="px-4 py-3 text-sm">
                                    <div className="font-medium">
                                        {new Date(b.start).toLocaleString()} → {new Date(b.end).toLocaleString()}
                                    </div>
                                    {b.task_id != null && <div className="text-gray-500">Task #{b.task_id}</div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3">
                <button
                    onClick={handleConfirm}
                    disabled={!blocks?.length || submitting}
                    className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-black disabled:opacity-60"
                >
                    {submitting ? 'Scheduling…' : 'Confirm schedule'}
                </button>
            </div>
        </div>
    )
}
