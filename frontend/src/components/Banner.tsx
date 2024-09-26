import { ScheduleButton } from './ScheduleButton'
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

interface BannerProps {
    onSaveChanges: () => void
    isSaving: boolean
    onScheduleComplete: () => void
}

export function Banner({ onSaveChanges, isSaving, onScheduleComplete }: BannerProps) {
    return (
        <div className="bg-indigo-600 py-4 px-6 rounded-lg shadow-lg mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Project Task Board</h1>
            <div className="flex space-x-4">
                <ScheduleButton onScheduleComplete={onScheduleComplete} />
                <Button
                    onClick={onSaveChanges}
                    disabled={isSaving}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full shadow transition-colors duration-300 flex items-center"
                >
                    {isSaving ? (
                        <>
                            <span className="animate-spin mr-2">⏳</span>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}