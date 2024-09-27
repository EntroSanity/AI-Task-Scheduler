'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Users, Clock, TrendingDown, Award, Link as LinkIcon, Plus, Save, FileText, Type } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"


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

interface SampleTaskCardProps {
    onAddTask: (newTask: Task) => void
    nextTaskId: string
}

const getColorByPoints = (points: number) => {
    if (points >= 70) return "bg-gradient-to-br from-orange-100 to-red-200 border-red-300"
    if (points >= 50) return "bg-gradient-to-br from-yellow-100 to-amber-200 border-amber-300"
    if (points >= 30) return "bg-gradient-to-br from-green-100 to-emerald-200 border-emerald-300"
    return "bg-gradient-to-br from-blue-100 to-cyan-200 border-cyan-300"
}

export function SampleTaskCard({ onAddTask, nextTaskId }: SampleTaskCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [showSaveHint, setShowSaveHint] = useState(false)
    const [newTask, setNewTask] = useState<Task>({
        id: nextTaskId,
        title: '',
        baseReward: 0,
        dependencies: [],
        requiredResources: [],
        requiredTime: 0,
        rewardDecayFactor: 0,
        description: ''
    })

    useEffect(() => {
        if (showSaveHint) {
            const timer = setTimeout(() => setShowSaveHint(false), 5000)
            return () => clearTimeout(timer)
        }
    }, [showSaveHint])

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleSave = () => {
        if (newTask.title && newTask.baseReward > 0) {
            onAddTask(newTask)
            setIsEditing(false)
            setShowSaveHint(true)
            setNewTask({
                id: nextTaskId,
                title: '',
                baseReward: 0,
                dependencies: [],
                requiredResources: [],
                requiredTime: 0,
                rewardDecayFactor: 0,
                description: ''
            })
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setNewTask(prev => ({ ...prev, [name]: name === 'baseReward' || name === 'requiredTime' || name === 'rewardDecayFactor' ? parseFloat(value) : value }))
    }

    const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'dependencies' | 'requiredResources') => {
        const value = e.target.value
        setNewTask(prev => ({
            ...prev,
            [field]: value.split(',').map(item => item.trim()).filter(Boolean)
        }))
    }

    const renderContent = () => {
        if (isEditing) {
            return (
                <div className="space-y-4 overflow-y-auto max-h-[calc(100%-2rem)]">
                    <div className="flex items-center space-x-2">
                        <Type className="w-4 h-4 flex-shrink-0 text-gray-500" />
                        <Input
                            name="title"
                            value={newTask.title}
                            onChange={handleInputChange}
                            placeholder="Task Title"
                            aria-label="Task Title"
                            className="flex-grow"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 flex-shrink-0 text-gray-500" />
                        <Input
                            name="baseReward"
                            type="number"
                            value={newTask.baseReward}
                            onChange={handleInputChange}
                            placeholder="Base Reward"
                            aria-label="Base Reward"
                            className="flex-grow"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 flex-shrink-0 text-gray-500" />
                        <Input
                            name="requiredTime"
                            type="number"
                            value={newTask.requiredTime}
                            onChange={handleInputChange}
                            placeholder="Required Time (days)"
                            aria-label="Required Time (days)"
                            className="flex-grow"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <TrendingDown className="w-4 h-4 flex-shrink-0 text-gray-500" />
                        <Input
                            name="rewardDecayFactor"
                            type="number"
                            value={newTask.rewardDecayFactor}
                            onChange={handleInputChange}
                            placeholder="Reward Decay Factor"
                            aria-label="Reward Decay Factor"
                            className="flex-grow"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 flex-shrink-0 text-gray-500" />
                        <Input
                            name="requiredResources"
                            value={newTask.requiredResources.join(', ')}
                            onChange={(e) => handleArrayInputChange(e, 'requiredResources')}
                            placeholder="Required Resources (comma-separated)"
                            aria-label="Required Resources"
                            className="flex-grow"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <LinkIcon className="w-4 h-4 flex-shrink-0 text-gray-500" />
                        <Input
                            name="dependencies"
                            value={newTask.dependencies.join(', ')}
                            onChange={(e) => handleArrayInputChange(e, 'dependencies')}
                            placeholder="Dependencies (comma-separated)"
                            aria-label="Dependencies"
                            className="flex-grow"
                        />
                    </div>
                    <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 flex-shrink-0 text-gray-500 mt-2" />
                        <Textarea
                            name="description"
                            value={newTask.description}
                            onChange={handleInputChange}
                            placeholder="Task Description"
                            aria-label="Task Description"
                            className="flex-grow"
                            rows={3}
                        />
                    </div>
                </div>
            )
        }

        return (
            <div className="flex flex-col justify-between h-full">
                <div className="flex items-center justify-center flex-grow">
                    <Plus className="w-12 h-12 text-gray-400" />
                    <span className="ml-2 text-lg text-gray-500">Add New Task</span>
                </div>
                <div className="space-y-2 text-sm text-gray-500 mt-4">
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Required Resources</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Required Time</span>
                    </div>
                    <div className="flex items-center">
                        <TrendingDown className="w-4 h-4 mr-2" />
                        <span>Decay Factor</span>
                    </div>
                    <div className="flex items-center">
                        <Award className="w-4 h-4 mr-2" />
                        <span>Base Reward</span>
                    </div>
                    <div className="flex items-center">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        <span>Dependencies</span>
                    </div>
                </div>
            </div>
        )
    }

    const cardColor = getColorByPoints(newTask.baseReward)

    return (
        <motion.div
            whileHover={{ scale: 1.03, rotate: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card className={`w-full max-w-sm border-2 ${isEditing ? cardColor : 'border-dashed border-gray-300'} shadow-lg transition-all duration-300 h-[400px]`}>
                <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <Badge variant="outline" className="text-sm font-semibold bg-white">{nextTaskId}</Badge>
                    <div className="flex items-center space-x-2">
                        {isEditing && (
                            <Badge variant="secondary" className="bg-indigo-600 text-white text-sm font-bold">
                                {newTask.baseReward} points
                            </Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={isEditing ? handleSave : handleEdit}
                            aria-label={isEditing ? "Save new task" : "Add new task"}
                        >
                            {isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="h-[calc(100%-60px)] overflow-y-auto">
                    {isEditing ? <h3 className="text-xl font-bold mb-3 text-gray-800">{newTask.title || "New Task"}</h3> : null}
                    {renderContent()}
                </CardContent>
            </Card>
            <AnimatePresence>
                {showSaveHint && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                    >
                        <Alert>
                            <AlertDescription>
                                Task added successfully! Don't forget to click the "Save Changes" button to persist your changes.
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}