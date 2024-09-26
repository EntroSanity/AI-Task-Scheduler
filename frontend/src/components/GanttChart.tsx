'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(_: Error) {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Gantt chart error:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong with the Gantt chart.</h1>
        }

        return this.props.children
    }
}

interface GanttChartProps {
    refreshKey: number
}

export function GanttChart({ refreshKey }: GanttChartProps) {
    const [chartHtml, setChartHtml] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
        const fetchGanttChart = async () => {
            setLoading(true)
            setError(null)

            try {
                const response = await fetch('/api/v1/gantt-chart')

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const html = await response.text()
                setChartHtml(html)

                if (iframeRef.current) {
                    const doc = iframeRef.current.contentDocument
                    if (doc) {
                        doc.open()
                        doc.write(html)
                        doc.close()

                        // Adjust iframe height after content is loaded
                        iframeRef.current.onload = () => {
                            if (iframeRef.current && iframeRef.current.contentDocument) {
                                const height = iframeRef.current.contentDocument.body.scrollHeight
                                iframeRef.current.style.height = `${height}px`
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching Gantt chart:', err)
                setError(err instanceof Error ? err.message : 'An unknown error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchGanttChart()
    }, [refreshKey])

    if (loading) {
        return (
            <Card className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-indigo-400/30 to-purple-400/30 backdrop-blur-sm border-none shadow-lg">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="w-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 backdrop-blur-sm border-none shadow-lg">
                <CardContent className="pt-6">
                    <p className="text-white">Error loading Gantt chart: {error}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <ErrorBoundary>
            <Card className="w-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 backdrop-blur-sm border-none shadow-lg overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white">Gantt Chart</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <iframe
                        ref={iframeRef}
                        className="w-full border-none"
                        title="Gantt Chart"
                        sandbox="allow-scripts allow-same-origin"
                        style={{ minHeight: '200px', maxHeight: '600px', height: '100%' }}
                    />
                </CardContent>
            </Card>
        </ErrorBoundary>
    )
}