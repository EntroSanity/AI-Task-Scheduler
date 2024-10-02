'use client'

import React, { useState, useEffect } from 'react'
import { fetchProjects } from '../lib/api'
import { TaskCard } from '../components/TaskCard'
import { SampleTaskCard } from '../components/SampleTaskCard'
import { DependencyGraph } from '../components/DependencyGraph'
import { GanttChart } from '../components/GanttChart'
import { Banner } from '../components/Banner'
import { Button } from "@/components/ui/button"

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

interface Notification {
  type: 'success' | 'error'
  message: string
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [deletedTaskIds, setDeletedTaskIds] = useState<string[]>([])
  const [resources, setResources] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [refreshGraphKey, setRefreshGraphKey] = useState(0)
  const [refreshGanttKey, setRefreshGanttKey] = useState(0)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        console.log('Fetching projects...')
        const projectData = await fetchProjects()
        console.log('Project data received:', projectData)
        setTasks(projectData.tasks)
        setResources(projectData.resources || [])
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError(`Failed to load project data: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [])

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    ))
    updateResources(updatedTask.requiredResources)
  }

  const handleTaskDelete = (taskId: string) => {
    setDeletedTaskIds(prev => [...prev, taskId])
  }

  const handleTaskUndelete = (taskId: string) => {
    setDeletedTaskIds(prev => prev.filter(id => id !== taskId))
  }

  const getNextTaskId = () => {
    const maxId = tasks.reduce((max, task) => {
      const idNumber = parseInt(task.id.slice(1))
      return idNumber > max ? idNumber : max
    }, 0)
    return `T${maxId + 1}`
  }

  const handleAddTask = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask])
    updateResources(newTask.requiredResources)
  }

  const updateResources = (newResources: string[]) => {
    setResources(prevResources => {
      const updatedResources = new Set([...prevResources, ...newResources])
      return Array.from(updatedResources)
    })
  }

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      const updatedTasks = tasks.filter(task => !deletedTaskIds.includes(task.id))
      const postData = {
        tasks: updatedTasks,
        resources: resources
      }

      console.log('Sending data to API:', JSON.stringify(postData, null, 2))

      const response = await fetch('/api/save-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      const responseData = await response.json()

      console.log('API Response:', JSON.stringify(responseData, null, 2))

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`)
      }

      console.log('Project saved successfully:', responseData)
      setNotification({ type: 'success', message: 'Project saved successfully' })

      // Update the tasks state to remove deleted tasks
      setTasks(updatedTasks)
      setDeletedTaskIds([])

      // Trigger dependency graph generation
      const graphResponse = await fetch('/api/v1/dependency-graph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (!graphResponse.ok) {
        throw new Error(`Failed to generate dependency graph. Status: ${graphResponse.status}`)
      }

      // Trigger graph and Gantt chart refresh
      setRefreshGraphKey(prev => prev + 1)
      setRefreshGanttKey(prev => prev + 1)

    } catch (error) {
      console.error('Error saving project or generating dependency graph:', error)
      setNotification({ type: 'error', message: `Failed to save project or generate dependency graph: ${error instanceof Error ? error.message : 'Unknown error'}` })
    } finally {
      setIsSaving(false)
    }

    setTimeout(() => setNotification(null), 5000)
  }

  const handleScheduleComplete = () => {
    setRefreshGanttKey(prev => prev + 1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white mb-4"></div>
          <p>Loading... If this takes too long, please check the console for errors.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-gray-600 text-sm">Please check your network connection and ensure the backend server is running.</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Banner onSaveChanges={handleSaveChanges} isSaving={isSaving} onScheduleComplete={handleScheduleComplete} />
        {notification && (
          <div className={`mb-8 p-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {notification.message}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <SampleTaskCard onAddTask={handleAddTask} nextTaskId={getNextTaskId()} />
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onTaskUndelete={handleTaskUndelete}
              isDeleted={deletedTaskIds.includes(task.id)}
            />
          ))}
        </div>
        <div className="mb-12">
          <DependencyGraph key={refreshGraphKey} />
        </div>
        <div className="mb-8">
          <GanttChart key={refreshGanttKey} refreshKey={refreshGanttKey} />
        </div>
      </div>
    </main>
  )
}