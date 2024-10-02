'use client'

import { useState } from 'react'
import { CalendarDays } from "lucide-react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface LLMAnalysis {
    estimated_complexity: number
    potential_risks: string[]
    required_skills: string[]
    suggested_priority: string
}

interface Task {
    id: string
    title: string
    actual_reward: number
    start_time: number
    end_time: number
    resources: string[]
    llm_analysis: LLMAnalysis
}

interface ScheduleResponse {
    message: string
    result?: {
        scheduled_tasks: Task[]
        total_reward: number
        total_time: number
    }
    s3_upload_status: string
}

interface ScheduleButtonProps {
    onScheduleComplete: () => void
}

export function ScheduleButton({ onScheduleComplete }: ScheduleButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [scheduleData, setScheduleData] = useState<ScheduleResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const fetchSchedule = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            })
            if (!response.ok) {
                throw new Error('Failed to fetch schedule data')
            }
            const data: ScheduleResponse = await response.json()
            setScheduleData(data)
            setIsDialogOpen(true)

            // Update Gantt chart
            await fetch('/api/v1/gantt-chart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data.result),
            })

            // Notify parent component to reload Gantt chart
            onScheduleComplete()
        } catch (err) {
            console.error('Error fetching schedule data:', err)
            setError('Error fetching schedule data. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const renderLLMAnalysis = (analysis: LLMAnalysis) => (
        <div className="mt-2">
            <p className="font-semibold">LLM Analysis:</p>
            <ul className="list-disc list-inside space-y-1">
                <li>Estimated Complexity: {analysis.estimated_complexity}</li>
                <li>Suggested Priority: {analysis.suggested_priority}</li>
                <li>
                    Potential Risks:
                    <ul className="list-disc list-inside ml-4">
                        {analysis.potential_risks.map((risk, index) => (
                            <li key={index}>{risk}</li>
                        ))}
                    </ul>
                </li>
                <li>
                    Required Skills:
                    <ul className="list-disc list-inside ml-4">
                        {analysis.required_skills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                        ))}
                    </ul>
                </li>
            </ul>
        </div>
    )

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    onClick={fetchSchedule}
                    disabled={isLoading}
                    className="bg-white text-indigo-600 hover:bg-indigo-100 transition-colors duration-300 font-semibold py-3 px-6 rounded-full shadow-lg flex items-center text-lg"
                >
                    {isLoading ? (
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    ) : (
                        <CalendarDays className="w-6 h-6 mr-2" />
                    )}
                    {isLoading ? 'Scheduling...' : 'Schedule'}
                </Button>
            </motion.div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Schedule Results</DialogTitle>
                        <DialogDescription>
                            Here are the results of the scheduling operation:
                        </DialogDescription>
                    </DialogHeader>
                    {error ? (
                        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            <h4 className="font-bold">Error</h4>
                            <p>{error}</p>
                        </div>
                    ) : scheduleData ? (
                        <div className="mt-4">
                            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded mb-4">
                                <h4 className="font-bold">Success</h4>
                                <p>{scheduleData.message}</p>
                                {scheduleData.result && (
                                    <>
                                        <p>Total Reward: {scheduleData.result.total_reward.toFixed(2)}</p>
                                        <p>Total Time: {scheduleData.result.total_time}</p>
                                    </>
                                )}
                            </div>
                            {scheduleData.result && scheduleData.result.scheduled_tasks && (
                                <>
                                    <h4 className="font-semibold mb-2">Scheduled Tasks:</h4>
                                    <ul className="space-y-4">
                                        {scheduleData.result.scheduled_tasks.map((task) => (
                                            <li key={task.id} className="bg-gray-100 p-4 rounded">
                                                <h5 className="font-bold">{task.title} (ID: {task.id})</h5>
                                                <p><strong>Actual Reward:</strong> {task.actual_reward.toFixed(2)}</p>
                                                <p><strong>Start Time:</strong> {task.start_time}</p>
                                                <p><strong>End Time:</strong> {task.end_time}</p>
                                                <p><strong>Resources:</strong> {task.resources.join(', ')}</p>
                                                {renderLLMAnalysis(task.llm_analysis)}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    )
}