'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Task {
    id: string
    title: string
    start: string
    end: string
    progress: number
}

interface GanttData {
    tasks: Task[]
}

interface GanttChartProps {
    refreshKey: number
}

export function GanttChart({ refreshKey }: GanttChartProps) {
    const [chartData, setChartData] = useState<GanttData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [hoveredTask, setHoveredTask] = useState<Task | null>(null)
    const chartRef = useRef<HTMLDivElement>(null)

    // You can adjust this value to change the thickness of the task bars
    const taskBarHeight = 'h-6'  // Increased from h-4 to h-6

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

    const calculatePosition = (date: Date, startDate: Date, endDate: Date) => {
        const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
        const daysFromStart = (date.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
        return (daysFromStart / totalDays) * 100
    }

    const getDuration = (start: string, end: string) => {
        const startDate = new Date(start)
        const endDate = new Date(end)
        const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
        return Math.ceil(duration)
    }

    if (loading) {
        return (
            <Card className="w-full h-64 flex items-center justify-center bg-purple-100 border-purple-600 border-4 shadow-lg">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="w-full bg-purple-100 border-purple-600 border-4 shadow-lg">
                <CardContent className="pt-6">
                    <p className="text-red-500 font-bold">Error loading Gantt chart: {error}</p>
                </CardContent>
            </Card>
        )
    }

    if (!chartData || chartData.tasks.length === 0) {
        return (
            <Card className="w-full bg-purple-100 border-purple-600 border-4 shadow-lg">
                <CardContent className="pt-6">
                    <p className="text-purple-700 font-bold">No data available for the Gantt chart.</p>
                </CardContent>
            </Card>
        )
    }

    const startDate = new Date(Math.min(...chartData.tasks.map(task => new Date(task.start).getTime())))
    const endDate = new Date(Math.max(...chartData.tasks.map(task => new Date(task.end).getTime())))

    return (
        <Card className="w-full bg-purple-100 border-purple-600 border-4 shadow-lg overflow-hidden">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-purple-800">Gantt Chart</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="gantt-container overflow-x-auto overflow-y-visible" ref={chartRef}>
                    <div className="min-w-max relative pb-20 px-4"> {/* Added px-4 for horizontal padding */}
                        {chartData.tasks.map((task, index) => (
                            <div key={task.id} className="grid grid-cols-[200px,1fr] items-center h-16 mb-1">
                                <div className="pr-4 text-right">
                                    <span className="text-purple-700 font-bold text-lg">{task.title}</span>
                                </div>
                                <div className="relative h-full">
                                    <div className="absolute inset-0 bg-purple-200 rounded-full"></div>
                                    <div
                                        className={`absolute top-1/2 -translate-y-1/2 ${taskBarHeight} bg-purple-500 rounded-full transition-all duration-200 ease-in-out hover:bg-purple-600 cursor-pointer`}
                                        style={{
                                            left: `${calculatePosition(new Date(task.start), startDate, endDate)}%`,
                                            width: `${calculatePosition(new Date(task.end), startDate, endDate) -
                                                calculatePosition(new Date(task.start), startDate, endDate)}%`,
                                        }}
                                        onMouseEnter={() => setHoveredTask(task)}
                                        onMouseLeave={() => setHoveredTask(null)}
                                    ></div>
                                    {hoveredTask === task && (
                                        <div
                                            className="absolute bg-white border-2 border-purple-600 rounded-lg p-3 shadow-lg z-10 mt-2"
                                            style={{
                                                left: `${Math.min(
                                                    calculatePosition(new Date(task.start), startDate, endDate),
                                                    100 - 30
                                                )}%`,
                                                transform: 'translateX(-50%)',
                                                top: index > chartData.tasks.length - 3 ? 'auto' : '100%',
                                                bottom: index > chartData.tasks.length - 3 ? '100%' : 'auto',
                                            }}
                                        >
                                            <h3 className="text-lg font-bold text-purple-800 mb-2">{task.title}</h3>
                                            <p className="text-purple-700"><span className="font-bold">Duration:</span> {getDuration(task.start, task.end)} days</p>
                                            <p className="text-purple-700"><span className="font-bold">Percent done:</span> {task.progress}%</p>
                                            <p className="text-purple-700"><span className="font-bold">Start:</span> {new Date(task.start).toLocaleDateString()}</p>
                                            <p className="text-purple-700"><span className="font-bold">End:</span> {new Date(task.end).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}