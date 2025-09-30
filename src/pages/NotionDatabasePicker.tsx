import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { listNotionDatabases, type NotionDatabase } from '@/api/notion'

export default function NotionDatabasePicker() {
    const navigate = useNavigate()
    const [filter, setFilter] = React.useState('')

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['notion', 'databases'],
        queryFn: async () => {
            const dbs = await listNotionDatabases()
            return dbs.map((d: NotionDatabase) => ({
                id: (d.id as string) ?? '',
                title:
                    (d as any).title ??
                    (d as any).name ??
                    (typeof (d as any).title === 'object' ? JSON.stringify((d as any).title) : String((d as any).title ?? 'Untitled')),
                raw: d,
            }))
        },
        retry: false,
        staleTime: 60_000,
    })

    const missingConnection =
        !!isError &&
        (error as any)?.response?.status === 404 &&
        ((error as any)?.response?.data?.title === 'NotionError' ||
            (error as any)?.response?.data?.detail?.toString()?.includes('No Notion connection'))

    const onSelect = (dbId: string) => navigate(`/notion/mapping?db=${encodeURIComponent(dbId)}`)

    const list = React.useMemo(() => {
        if (!data) return []
        const q = filter.trim().toLowerCase()
        if (!q) return data
        return data.filter((d) => d.title.toLowerCase().includes(q) || d.id.toLowerCase().includes(q))
    }, [data, filter])

    return (
        <div className="mx-auto max-w-2xl p-6">
            <h1 className="mb-2 text-2xl font-semibold">Select a Notion Database</h1>
            <p className="mb-6 text-gray-600">Choose the database you’d like SmartScheduler to read tasks from.</p>

            <div className="mb-4 flex items-center gap-3">
                <input
                    type="text"
                    placeholder="Search databases…"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-gray-300"
                />
                <button
                    onClick={() => refetch()}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                >
                    Refresh
                </button>
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
                    <div className="mb-3">Connect or reconnect Notion, then return here to choose a database.</div>
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
                    Failed to load databases. Check your Notion connection and try again.
                </div>
            )}

            {!isLoading && !isError && (
                <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
                    {list.length === 0 && <li className="p-4 text-sm text-gray-500">No databases found.</li>}
                    {list.map((d) => (
                        <li
                            key={d.id}
                            className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-50"
                            onClick={() => onSelect(d.id)}
                            role="button"
                        >
                            <div>
                                <div className="text-sm font-medium">{d.title}</div>
                                <div className="text-xs text-gray-500">{d.id}</div>
                            </div>
                            <span className="text-xs text-blue-600">Select</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
