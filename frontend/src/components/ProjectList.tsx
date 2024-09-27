'use client'

import { useState, useEffect } from 'react'
import { fetchProjects } from '../lib/api'

interface Task {
    id: string
    title: string
    description: string
    baseReward: number
    dependencies: string[]
    requiredResources: string[]
    requiredTime: number
    rewardDecayFactor: number
}

interface ProjectData {
    resources: string[]
    tasks: Task[]
}

export default function ProjectList() {
    const [projectData, setProjectData] = useState<ProjectData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadProjects() {
            try {
                const data = await fetchProjects()
                setProjectData(data)
            } catch (err) {
                console.error('Error fetching projects:', err)
                setError('Failed to load project data. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        loadProjects()
    }, [])

    if (loading) return <div className="text-center">Loading project data...</div>
    if (error) return <div className="text-center text-red-500">{error}</div>
    if (!projectData) return <div className="text-center">No project data available.</div>

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-bold mb-4">Resources</h2>
                {projectData.resources.length === 0 ? (
                    <p>No resources found.</p>
                ) : (
                    <ul className="list-disc list-inside">
                        {projectData.resources.map((resource, index) => (
                            <li key={index} className="text-lg">{resource}</li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">Tasks</h2>
                {projectData.tasks.length === 0 ? (
                    <p>No tasks found.</p>
                ) : (
                    <ul className="space-y-6">
                        {projectData.tasks.map((task) => (
                            <li key={task.id} className="border p-6 rounded-lg shadow-md">
                                <h3 className="font-semibold text-xl mb-2">{task.title}</h3>
                                <p className="text-gray-600 mb-4">{task.description}</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <strong>ID:</strong> {task.id}
                                    </div>
                                    <div>
                                        <strong>Base Reward:</strong> {task.baseReward}
                                    </div>
                                    <div>
                                        <strong>Dependencies:</strong> {task.dependencies.join(', ') || 'None'}
                                    </div>
                                    <div>
                                        <strong>Required Resources:</strong> {task.requiredResources.join(', ') || 'None'}
                                    </div>
                                    <div>
                                        <strong>Required Time:</strong> {task.requiredTime} {task.requiredTime === 1 ? 'day' : 'days'}
                                    </div>
                                    <div>
                                        <strong>Reward Decay Factor:</strong> {task.rewardDecayFactor}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}