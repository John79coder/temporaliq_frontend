import * as React from 'react'
import { useMemo } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { generateCandidatesFromPage } from '@/api/notion'
import TaskPreviewTable, { type TaskRow } from '@/components/notion/TaskPreviewTable'

export default function NotionPageCandidates() {
    const [params] = useSearchParams()
    const pageId = params.get('pid') || ''
    const navigate = useNavigate()

    const { data, isLoading, isError, error, refetch } = useQuery({
        enabled: !!pageId,
        queryKey: ['notion', 'page-candidates', pageId],
        queryFn: async () => {
            const res = await generateCandidatesFromPage(pageId, false)
            return Array.isArray(res) ? res : []
        },
        retry: false,
        staleTime: 30_000,
    })

    // Special-case “No Notion connection found”
    const missingConnection =
        !!isError &&
        (error as any)?.response?.status === 404 &&
        ((error as any)?.response?.data?.title === 'NotionError' ||
            (error as any)?.response?.data?.detail?.toString()?.includes('No Notion connection'))

    const rows: TaskRow[] = useMemo(() => {
        return (data ?? []).map((d: any, i: number) => ({
            id: d.id ?? d.key ?? String(i),
            title: d.title ?? d.name ?? '',
            due: d.due ?? d.date ?? null,
            confidence: typeof d.confidence === 'number' ? d.confidence : null,
            _raw: d,
        }))
    }, [data])

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1 className="mb-2 text-2xl font-semibold">Task Candidates</h1>
            <p className="mb-6 text-gray-600">Review AI-generated tasks from your Notion page.</p>

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
                <div className="ml-auto text-xs text-gray-500">Source Page: {pageId}</div>
            </div>

            {isLoading && (
                <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-11 w-full animate-pulse rounded-xl bg-gray-100" />
                    ))}
                </div>
            )}

            {missingConnection && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <div className="font-medium mb-1">Notion isn’t connected for this account.</div>
                    <div className="mb-3">
                        Please connect Notion (or reconnect if you recently reset your environment), then try again.
                    </div>
                    <Link
                        to="/onboarding"
                        className="inline-block rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs hover:bg-gray-50"
                    >
                        Go to Onboarding
                    </Link>
                </div>
            )}

            {isError && !missingConnection && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    Failed to generate candidates. Check page access, then try again.
                </div>
            )}

            {!isLoading && !isError && <TaskPreviewTable rows={rows} />}
        </div>
    )
}
