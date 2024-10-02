'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Users, Clock, TrendingDown, Award, Link as LinkIcon, Edit, Save, Trash2, Undo, Type, Hash, FileText } from "lucide-react"
import { motion } from "framer-motion"

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

const getColorByPoints = (points: number) => {
    const minOpacity = 0.6
    const maxOpacity = 0.9
    const opacity = minOpacity + (points / 100) * (maxOpacity - minOpacity)
    return `bg-purple-200 border-purple-300 bg-opacity-${Math.round(opacity * 100)}`
}

interface TaskCardProps {
    task: Task
    onTaskUpdate: (updatedTask: Task) => void
    onTaskDelete: (taskId: string) => void
    onTaskUndelete: (taskId: string) => void
    isDeleted: boolean
}

export function TaskCard({ task: initialTask, onTaskUpdate, onTaskDelete, onTaskUndelete, isDeleted }: TaskCardProps) {
    const [task, setTask] = useState<Task>(initialTask)
    const [isEditing, setIsEditing] = useState(false)
    const [editedTask, setEditedTask] = useState<Task>(task)
    const cardColor = getColorByPoints(task.baseReward)

    const handleEdit = () => {
        setIsEditing(true)
        setEditedTask(task)
    }

    const handleSave = () => {
        setTask(editedTask)
        setIsEditing(false)
        onTaskUpdate(editedTask)
    }

    const handleDelete = () => {
        onTaskDelete(task.id)
    }

    const handleUndelete = () => {
        onTaskUndelete(task.id)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setEditedTask(prev => ({ ...prev, [name]: value }))
    }

    const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'dependencies' | 'requiredResources') => {
        const value = e.target.value
        setEditedTask(prev => ({
            ...prev,
            [field]: value.split(',').map(item => item.trim()).filter(Boolean)
        }))
    }

    const renderContent = () => {
        if (isEditing) {
            return (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Type className="w-4 h-4 text-gray-500" />
                        <Input
                            name="title"
                            value={editedTask.title}
                            onChange={handleInputChange}
                            placeholder="Task Title"
                            aria-label="Task Title"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-gray-500" />
                        <Input
                            name="baseReward"
                            type="number"
                            value={editedTask.baseReward}
                            onChange={handleInputChange}
                            placeholder="Base Reward"
                            aria-label="Base Reward"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <Input
                            name="requiredTime"
                            type="number"
                            value={editedTask.requiredTime}
                            onChange={handleInputChange}
                            placeholder="Required Time (days)"
                            aria-label="Required Time (days)"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <TrendingDown className="w-4 h-4 text-gray-500" />
                        <Input
                            name="rewardDecayFactor"
                            type="number"
                            value={editedTask.rewardDecayFactor}
                            onChange={handleInputChange}
                            placeholder="Reward Decay Factor"
                            aria-label="Reward Decay Factor"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <Input
                            name="requiredResources"
                            value={editedTask.requiredResources.join(', ')}
                            onChange={(e) => handleArrayInputChange(e, 'requiredResources')}
                            placeholder="Required Resources (comma-separated)"
                            aria-label="Required Resources"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <LinkIcon className="w-4 h-4 text-gray-500" />
                        <Input
                            name="dependencies"
                            value={editedTask.dependencies.join(', ')}
                            onChange={(e) => handleArrayInputChange(e, 'dependencies')}
                            placeholder="Dependencies (comma-separated)"
                            aria-label="Dependencies"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <Textarea
                            name="description"
                            value={editedTask.description || ''}
                            onChange={handleInputChange}
                            placeholder="Task Description"
                            aria-label="Task Description"
                        />
                    </div>
                </div>
            )
        }

        return (
            <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-700">
                    <Users className="w-4 h-4 mr-2 text-indigo-600" />
                    <span>{task.requiredResources.join(', ')}</span>
                </div>
                <div className="flex items-center text-gray-700">
                    <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                    <span>{task.requiredTime} days</span>
                </div>
                <div className="flex items-center text-gray-700">
                    <TrendingDown className="w-4 h-4 mr-2 text-indigo-600" />
                    <span>Decay Factor: {task.rewardDecayFactor}</span>
                </div>
                <div className="flex items-center text-gray-700">
                    <Award className="w-4 h-4 mr-2 text-indigo-600" />
                    <span>Base Reward: {task.baseReward}</span>
                </div>
                <div className="flex items-center text-gray-700">
                    <LinkIcon className="w-4 h-4 mr-2 text-indigo-600" />
                    <span>Dependencies: {task.dependencies.join(', ') || 'None'}</span>
                </div>
                {task.description && (
                    <div className="flex items-center text-gray-700">
                        <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                        <p className="text-gray-600 mt-2">{task.description}</p>
                    </div>
                )}
            </div>
        )
    }

    return (
        <motion.div
            whileHover={{ scale: 1.03, rotate: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card className={`w-full max-w-sm border-2 ${cardColor} shadow-lg transition-all duration-300 ${isDeleted ? 'opacity-50 bg-gray-200' : ''}`}>
                <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <Badge variant="outline" className="text-sm font-semibold bg-white">{task.id}</Badge>
                    <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-indigo-600 text-white text-sm font-bold">
                            {task.baseReward} points
                        </Badge>
                        {!isDeleted && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={isEditing ? handleSave : handleEdit}
                                    aria-label={isEditing ? "Save changes" : "Edit task"}
                                >
                                    {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDelete}
                                    aria-label="Delete task"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                        {isDeleted && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleUndelete}
                                aria-label="Undo delete"
                                className="text-green-500 hover:text-green-700 hover:bg-green-100"
                            >
                                <Undo className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">{task.title}</h3>
                    {renderContent()}
                    {isDeleted && (
                        <p className="text-red-500 font-semibold mt-4">This task will be deleted when you click the save button.</p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}