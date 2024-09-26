'use client'

import { useState, useEffect } from 'react'
import { Loader2, Download } from "lucide-react"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DependencyGraphData {
    nodes: { id: string; label: string }[]
    edges: { from: string; to: string }[]
}

export function DependencyGraph() {
    const [graphData, setGraphData] = useState<DependencyGraphData | null>(null)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [responseInfo, setResponseInfo] = useState<string | null>(null)

    const fetchGraph = async () => {
        setLoading(true)
        setError(null)
        setResponseInfo(null)

        try {
            const response = await fetch('/api/v1/dependency-graph')
            const contentType = response.headers.get("content-type")

            setResponseInfo(`Status: ${response.status}, Content-Type: ${contentType}`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            if (contentType?.includes("image/png")) {
                const blob = await response.blob()
                const url = URL.createObjectURL(blob)
                setImageUrl(url)
                setGraphData(null)
            } else if (contentType?.includes("application/json")) {
                const data: DependencyGraphData = await response.json()
                setGraphData(data)
                setImageUrl(null)
            } else {
                throw new Error(`Unexpected content type: ${contentType}`)
            }
        } catch (err) {
            console.error('Error fetching dependency graph:', err)
            setError(err instanceof Error ? err.message : 'An unknown error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGraph()
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl)
            }
        }
    }, [])

    const handleDownload = () => {
        if (imageUrl) {
            const link = document.createElement('a')
            link.href = imageUrl
            link.download = 'dependency-graph.png'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
            )
        }

        if (error) {
            return (
                <div className="space-y-4">
                    {responseInfo && (
                        <div className="bg-white/10 p-4 rounded-md">
                            <h4 className="font-semibold mb-2 text-white">Response Information:</h4>
                            <pre className="whitespace-pre-wrap text-sm text-white/80">{responseInfo}</pre>
                        </div>
                    )}
                    <Button onClick={fetchGraph} variant="secondary">Retry</Button>
                </div>
            )
        }

        if (imageUrl) {
            return (
                <>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-bold text-white">Dependency Graph</CardTitle>
                        <Button onClick={handleDownload} variant="secondary" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative w-full" style={{ height: '400px' }}>
                            <Image
                                src={imageUrl}
                                alt="Task Dependency Graph"
                                fill
                                style={{ objectFit: 'contain' }}
                                className="p-4"
                            />
                        </div>
                    </CardContent>
                </>
            )
        }

        if (!graphData) {
            return (
                <div className="flex items-center justify-center h-64">
                    <p className="text-white">No graph data available.</p>
                </div>
            )
        }

        return (
            <>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white">Dependency Graph</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200/20">
                            <thead className="bg-white/10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Task</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Dependencies</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white/5 divide-y divide-gray-200/20">
                                {graphData.nodes.map((node) => (
                                    <tr key={node.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{node.label}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                                            {graphData.edges
                                                .filter((edge) => edge.to === node.id)
                                                .map((edge) => graphData.nodes.find((n) => n.id === edge.from)?.label)
                                                .join(', ')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </>
        )
    }

    return (
        <Card className="w-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 backdrop-blur-sm border-none shadow-lg overflow-hidden">
            {renderContent()}
        </Card>
    )
}