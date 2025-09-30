import * as React from 'react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { mapSchema, previewMapping } from '@/api/notion'
import { useAuthStore } from '@/stores/authStore'

type MappingForm = {
    title_field: string
    due_date_field: string
    duration_field: string
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
            />
        </label>
    )
}

export default function NotionMappingPreview() {
    const [params] = useSearchParams()
    const dbId = params.get('db') || ''
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)

    const { data, isLoading, isError } = useQuery({
        enabled: !!dbId,
        queryKey: ['notion', 'preview-mapping', dbId],
        queryFn: async () => {
            const res = await previewMapping(dbId)
            return res
        },
        staleTime: 300_000,
    })

    // Try to pull suggested fields if present; otherwise start blank (user can type the property names)
    const initial: MappingForm = useMemo(() => {
        const s = (data as any)?.suggested ?? (data as any)?.suggestions ?? {}
        const pick = (k: string) => {
            const v = s[k]
            if (!v) return ''
            if (Array.isArray(v)) return String(v[0] ?? '')
            return String(v)
        }
        return {
            title_field: pick('title_field') || pick('title') || '',
            due_date_field: pick('due_date_field') || pick('date') || '',
            duration_field: pick('duration_field') || '',
        }
    }, [data])

    const [form, setForm] = useState<MappingForm>(initial)

    React.useEffect(() => {
        setForm(initial)
    }, [initial])

    const { mutateAsync, isLoading: isSaving, error: saveError } = useMutation({
        mutationKey: ['notion', 'map-schema', dbId],
        mutationFn: async () => {
            if (!user?.id) throw new Error('Not signed in')
            // NOTE: Keep payload keys exactly as your backend expects.
            return await mapSchema({
                user_id: user.id,
                notion_db_id: dbId,
                title_field: form.title_field.trim(),
                due_date_field: form.due_date_field.trim(),
                duration_field: form.duration_field.trim(),
            } as any)
        },
        onSuccess: () => {
            navigate(`/notion/candidates?db=${encodeURIComponent(dbId)}`)
        },
    })

    return (
        <div className="mx-auto max-w-2xl p-6">
            <h1 className="mb-2 text-2xl font-semibold">Map Fields</h1>
            <p className="mb-6 text-gray-600">
                Confirm which Notion properties map to <em>Title</em>, <em>Due date</em>, and <em>Duration</em>.
            </p>

            {isLoading && (
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-11 w-full animate-pulse rounded-xl bg-gray-100" />
                    ))}
                </div>
            )}

            {isError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    Failed to load mapping suggestions. You can still enter property names manually below.
                </div>
            )}

            <div className="grid gap-4">
                <Field label="Title field" value={form.title_field} onChange={(v) => setForm((f) => ({ ...f, title_field: v }))} placeholder="e.g., Name or Task" />
                <Field
                    label="Due date field"
                    value={form.due_date_field}
                    onChange={(v) => setForm((f) => ({ ...f, due_date_field: v }))}
                    placeholder="e.g., Due or Date"
                />
                <Field
                    label="Duration field (optional)"
                    value={form.duration_field}
                    onChange={(v) => setForm((f) => ({ ...f, duration_field: v }))}
                    placeholder="e.g., Duration (minutes)"
                />
            </div>

            <div className="mt-6 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
                >
                    Back
                </button>
                <button
                    onClick={() => void mutateAsync()}
                    disabled={isSaving || !form.title_field}
                    className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                    {isSaving ? 'Saving…' : 'Continue'}
                </button>
                {saveError && <span className="text-sm text-red-600">Failed to save mapping.</span>}
            </div>

            {/* Raw preview block (collapsible) */}
            <details className="mt-8 rounded-xl border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer text-sm font-medium">See raw suggestion payload</summary>
                <pre className="mt-3 overflow-auto rounded-lg bg-gray-50 p-3 text-[11px] leading-5 text-gray-700">
{JSON.stringify(data, null, 2)}
        </pre>
            </details>
        </div>
    )
}
