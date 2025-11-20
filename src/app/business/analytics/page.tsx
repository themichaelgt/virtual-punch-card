'use client'

import { useEffect, useState } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { showSuccess, showError } from '@/lib/toast'
import { downloadCSV } from '@/lib/csv-export'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts'

interface Event {
    id: string
    name: string
}

interface PunchData {
    date: string
    count: number
}

interface CompletionData {
    totalCards: number
    completedCards: number
    completionRate: number
    avgDaysToComplete: number
}

interface RetentionData {
    totalCustomers: number
    returningCustomers: number
    loyalCustomers: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true)
    const [events, setEvents] = useState<Event[]>([])
    const [selectedEvent, setSelectedEvent] = useState<string>('')
    const [dateRange, setDateRange] = useState('30') // days

    const [punchData, setPunchData] = useState<PunchData[]>([])
    const [completionData, setCompletionData] = useState<CompletionData | null>(null)
    const [retentionData, setRetentionData] = useState<RetentionData | null>(null)

    const supabase = createClientSupabase()
    const router = useRouter()

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser()
                if (authError || !user) {
                    router.push('/business/login')
                    return
                }

                // Load events for filter
                const response = await fetch('/api/business/events')
                if (response.ok) {
                    const data = await response.json()
                    setEvents(data.events)
                }

                await loadAnalytics()
            } catch (error) {
                console.error('Error loading analytics:', error)
            } finally {
                setLoading(false)
            }
        }

        loadInitialData()
    }, [router, supabase])

    useEffect(() => {
        if (!loading) {
            loadAnalytics()
        }
    }, [selectedEvent, dateRange])

    const loadAnalytics = async () => {
        try {
            const endDate = new Date()
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - parseInt(dateRange))

            const queryParams = new URLSearchParams({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            })

            if (selectedEvent) {
                queryParams.append('eventId', selectedEvent)
            }

            // Fetch Punch Trends
            const punchesRes = await fetch(`/api/business/analytics/punches?${queryParams.toString()}`)
            const punchesData = await punchesRes.json()
            setPunchData(punchesData.data || [])

            // Fetch Completion Stats
            const completionRes = await fetch(`/api/business/analytics/completion?${queryParams.toString()}`)
            const completionData = await completionRes.json()
            setCompletionData(completionData)

            // Fetch Retention Stats
            const retentionRes = await fetch(`/api/business/analytics/retention?${queryParams.toString()}`)
            const retentionData = await retentionRes.json()
            setRetentionData(retentionData)

        } catch (error) {
            console.error('Error fetching analytics data:', error)
            showError('Failed to load analytics data')
        }
    }

    const handleExport = () => {
        if (punchData.length > 0) {
            downloadCSV(punchData, `punch-trends-${new Date().toISOString().split('T')[0]}.csv`)
            showSuccess('Exported punch trends')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    const retentionChartData = retentionData ? [
        { name: 'One-time', value: retentionData.totalCustomers - retentionData.returningCustomers },
        { name: 'Returning', value: retentionData.returningCustomers - retentionData.loyalCustomers },
        { name: 'Loyal', value: retentionData.loyalCustomers }
    ] : []

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                            <p className="text-sm text-gray-500">Insights into your punch card campaigns</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/business/dashboard')}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-8 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4">
                        <select
                            value={selectedEvent}
                            onChange={(e) => setSelectedEvent(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">All Campaigns</option>
                            {events.map(event => (
                                <option key={event.id} value={event.id}>{event.name}</option>
                            ))}
                        </select>

                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 3 Months</option>
                            <option value="365">Last Year</option>
                        </select>
                    </div>

                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                    >
                        Export CSV
                    </button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-500">Total Punches</div>
                        <div className="text-2xl font-bold text-gray-900">
                            {punchData.reduce((sum, item) => sum + item.count, 0)}
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-500">Completion Rate</div>
                        <div className="text-2xl font-bold text-green-600">
                            {completionData?.completionRate}%
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-500">Avg Time to Complete</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {completionData?.avgDaysToComplete} days
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-500">Loyal Customers</div>
                        <div className="text-2xl font-bold text-purple-600">
                            {retentionData?.loyalCustomers}
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Punch Trends */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Punch Activity</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={punchData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        labelFormatter={(str) => new Date(str).toLocaleDateString()}
                                    />
                                    <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Customer Retention */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Retention</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={retentionChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {retentionChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
