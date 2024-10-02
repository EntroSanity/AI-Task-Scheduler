export interface Task {
    id: string
    title: string
    description: string
    baseReward: number
    dependencies: string[]
    requiredResources: string[]
    requiredTime: number
    rewardDecayFactor: number
}

export interface ProjectData {
    resources: string[]
    tasks: Task[]
}