'use client'

import React, { useState, useEffect } from 'react'
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart } from "react-google-charts"

interface Task {
    id: string
    title: string
    start: string
    end: string
    resources: string[]
    dependencies: string[]
    progress: number
}

interface GanttData {
    tasks: Task[]
    projectStart: string
    projectEnd: string
}

interface GanttChartProps {
    refreshKey: number
}

// Define the correct type for column definitions
type ColumnType = 'string' | 'number' | 'date'
interface ColumnDef {
    type: ColumnType
    label: string
}

export function GanttChart({ refreshKey }: GanttChartProps) {
    const [chartData, setChartData] = useState<GanttData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchGanttData = async () => {
            setLoading(true)
            setError(null)

            try {
                const response = await fetch('/api/v1/gantt-chart')
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                const data: GanttData = await response.json()
                setChartData(data)
            } catch (err) {
                console.error('Error fetching Gantt chart data:', err)
                setError(err instanceof Error ? err.message : 'An unknown error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchGanttData()
    }, [refreshKey])

    const getRandomColor = () => {
        const colors = ['#ffffff', '#ffa07a', '#98fb98', '#ffff00', '#ff69b4', '#20b2aa']
        return colors[Math.floor(Math.random() * colors.length)]
    }

    const formatChartData = (data: GanttData): (ColumnDef | string | Date | number | null)[][] => {
        const columns: ColumnDef[] = [
            { type: 'string', label: 'Task ID' },
            { type: 'string', label: 'Task Name' },
            { type: 'date', label: 'Start Date' },
            { type: 'date', label: 'End Date' },
            { type: 'number', label: 'Duration' },
            { type: 'number', label: 'Percent Complete' },
            { type: 'string', label: 'Dependencies' },
        ]

        const rows: (string | Date | number | null)[][] = data.tasks.map((task) => [
            task.id,
            task.title,
            new Date(task.start),
            new Date(task.end),
            null,
            task.progress,
            task.dependencies.join(','),
        ])

        return [columns, ...rows]
    }

    if (loading) {
        return (
            <Card className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 border-none shadow-lg">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 border-none shadow-lg">
                <CardContent className="pt-6">
                    <p className="text-white">Error loading Gantt chart: {error}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 border-none shadow-lg overflow-hidden">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Gantt Chart</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="gantt-container" style={{ padding: '20px' }}>
                    {chartData && (
                        <Chart
                            width={'100%'}
                            height={'400px'}
                            chartType="Gantt"
                            loader={<div>Loading Chart</div>}
                            data={formatChartData(chartData)}
                            options={{
                                height: 400,
                                gantt: {
                                    trackHeight: 30,
                                    barCornerRadius: 10,
                                    barHeight: 20,
                                    innerGridHorizLine: {
                                        stroke: 'rgba(255, 255, 255, 0.1)',
                                        strokeWidth: 1,
                                    },
                                    innerGridTrack: { fill: 'transparent' },
                                    innerGridDarkTrack: { fill: 'transparent' },
                                },
                                backgroundColor: 'transparent',
                                hAxis: {
                                    textStyle: { color: '#ffffff' },
                                },
                                vAxis: {
                                    textStyle: { color: '#ffffff' },
                                },
                                tooltip: { isHtml: true },
                            }}
                            rootProps={{ 'data-testid': '1' }}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    )
}