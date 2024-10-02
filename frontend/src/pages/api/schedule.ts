import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const API_BASE_URL = 'http://localhost:8080/api/v1';

    if (req.method === 'POST') {
        try {
            const response = await fetch(`${API_BASE_URL}/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(req.body),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            res.status(200).json(data)
        } catch (error) {
            console.error('Error in schedule API:', error)
            res.status(500).json({
                message: 'Error fetching schedule data',
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            })
        }
    } else {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}