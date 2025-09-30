import * as React from 'react'
import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { generateCandidates } from '@/api/notion'
import TaskPreviewTable, { type TaskRow } from '@/components/notion/TaskPreviewTable'
import { Link } from 'react-router-dom'


export default function NotionTaskCandidates() {
    const [params] = useSearchParams()
    const dbId = params.get('db') || ''
    const navigate = useNavigate()

    const { data, isLoading, isError, refetch } = useQuery({
        enabled: !!dbId,
        queryKey: ['notion', 'candidates', dbId],
        queryFn: async () => {
            const res = await generateCandidates(dbId)
            return Array.isArray(res) ? res : []
        },
        staleTime: 30_000,
    })

    const rows: TaskRow[] = useMemo(() => {
        return (data ?? []).map((d: any) => ({
            id: d.id ?? d.key ?? undefined,
            title: d.title ?? d.name ?? '',
            due: d.due ?? d.date ?? null,
            confidence: typeof d.confidence === 'number' ? d.confidence : null,
            _raw: d,
        }))
    }, [data])

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1 className="mb-2 text-2xl font-semibold">Task Candidates</h1>
            <p className="mb-6 text-gray-600">Review AI-generated tasks from your Notion database.</p>

            <div className="mb-4 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                >
                    Back
                </button>
                <button
                    onClick={() => refetch()}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                >
                    Refresh
                </button>
                <Link
                    to={`/schedule/preview?db=${encodeURIComponent(dbId)}`}
                    className="ml-auto rounded-xl bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black"
                >
                    Schedule from this database
                </Link>

                <div className="ml-auto text-xs text-gray-500">Source DB: {dbId}</div>
            </div>

            {isLoading && (
                <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-11 w-full animate-pulse rounded-xl bg-gray-100" />
                    ))}
                </div>
            )}

            {isError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    Failed to generate candidates. Check your mapping and try again.
                </div>
            )}

            {!isLoading && !isError && <TaskPreviewTable rows={rows} />}
        </div>
    )
}
