import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'

/**
 * Accepts either a full Notion page URL or a raw page ID.
 * Returns the canonical 32-hex id (no dashes) or the dashed 36-char id
 * depending on what the user pasted. The backend accepts both.
 */
function extractNotionPageId(input: string): string | null {
    const s = input.trim()

    // If it's a URL, take the trailing "…-<32hex>" segment if present
    try {
        const u = new URL(s)
        // Match last 32 hex chars with optional dashes
        const m = u.pathname.match(/([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i)
        if (m) return m[1]
    } catch {
        /* not a URL */
    }

    // Raw 32-hex or dashed UUID forms
    const raw = s.match(/^([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i)
    if (raw) return raw[1]

    return null
}

export default function NotionPagePicker() {
    const [value, setValue] = React.useState('')
    const [error, setError] = React.useState<string | null>(null)
    const navigate = useNavigate()

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const id = extractNotionPageId(value)
        if (!id) {
            setError('Please paste a valid Notion page URL or ID.')
            return
        }

        navigate(`/notion/page-candidates?pid=${encodeURIComponent(id)}`)
    }

    return (
        <div className="mx-auto max-w-xl p-6">
            <h1 className="mb-2 text-2xl font-semibold">Use a Notion Page</h1>
            <p className="mb-6 text-gray-600">
                Paste a Notion page link (or page ID). We’ll extract task candidates from its content.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Page URL or ID</label>
                    <input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="https://www.notion.so/… or 01234567-89ab-cdef-0123-456789abcdef"
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-300"
                    />
                    {error && <div className="mt-1 text-sm text-red-600">{error}</div>}
                </div>

                <div className="flex items-center gap-3">
                    <Button type="submit">Continue</Button>
                    <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                </div>
            </form>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Tip: make sure you already “Allowed access” to the page in Notion during the connect step.
            </div>
        </div>
    )
}
