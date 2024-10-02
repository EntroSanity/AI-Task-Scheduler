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

export async function fetchProjects(): Promise<ProjectData> {
    try {
        const response = await fetch('/api/v1/projects'); // Updated to use relative path
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ProjectData = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
}