import type { NextApiRequest, NextApiResponse } from 'next'

interface Task {
    id: string
    title: string
    baseReward: number
    dependencies: string[]
    requiredResources: string[]
    requiredTime: number
    rewardDecayFactor: number
    description?: string
}

interface ProjectData {
    tasks: Task[]
    resources: string[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const API_BASE_URL = 'http://localhost:8080/api/v1';

    if (req.method === 'POST') {
        try {
            const projectData: ProjectData = req.body

            if (!projectData.tasks || !Array.isArray(projectData.tasks) || !projectData.resources || !Array.isArray(projectData.resources)) {
                throw new Error('Invalid project data: tasks and resources arrays are required')
            }

            const formattedData = {
                tasks: projectData.tasks.map(task => ({
                    id: task.id,
                    title: task.title,
                    baseReward: task.baseReward,
                    dependencies: task.dependencies,
                    requiredResources: task.requiredResources,
                    requiredTime: task.requiredTime,
                    rewardDecayFactor: task.rewardDecayFactor,
                    description: task.description || ''
                })),
                resources: projectData.resources
            }

            const response = await fetch(`${API_BASE_URL}/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData),
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('External API error response:', errorText)
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
            }

            const data = await response.json()
            res.status(200).json(data)
        } catch (error) {
            console.error('Error saving project data:', error)
            res.status(500).json({
                message: 'Error saving project data',
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            })
        }
    } else {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}