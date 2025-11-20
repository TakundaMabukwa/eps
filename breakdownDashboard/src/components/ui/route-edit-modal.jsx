"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, X, RotateCcw } from 'lucide-react'

export function RouteEditModal({ 
  isOpen, 
  onClose, 
  stopPoints, 
  customStopPoints, 
  availableStopPoints,
  onReorder,
  onForceRecalculate 
}) {
  const [localStopPoints, setLocalStopPoints] = useState([...stopPoints])
  const [localCustomStopPoints, setLocalCustomStopPoints] = useState([...customStopPoints])

  const moveStop = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= localStopPoints.length) return

    const newStopPoints = [...localStopPoints]
    const newCustomStopPoints = [...localCustomStopPoints]
    
    // Swap stop points
    ;[newStopPoints[index], newStopPoints[newIndex]] = [newStopPoints[newIndex], newStopPoints[index]]
    ;[newCustomStopPoints[index], newCustomStopPoints[newIndex]] = [newCustomStopPoints[newIndex], newCustomStopPoints[index]]
    
    setLocalStopPoints(newStopPoints)
    setLocalCustomStopPoints(newCustomStopPoints)
  }

  const removeStop = (index) => {
    setLocalStopPoints(localStopPoints.filter((_, i) => i !== index))
    setLocalCustomStopPoints(localCustomStopPoints.filter((_, i) => i !== index))
  }

  const getStopName = (index) => {
    const customName = localCustomStopPoints[index]
    if (customName) return customName
    
    const stopId = localStopPoints[index]
    const stop = availableStopPoints.find(s => s.id.toString() === stopId)
    return stop?.name || 'Unknown Stop'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Route Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Drag stops to reorder or use arrow buttons. Changes will recalculate the route.
          </p>
          
          <div className="space-y-2">
            {localStopPoints.map((_, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <span className="text-sm font-medium w-6">{index + 1}.</span>
                <span className="flex-1 text-sm">{getStopName(index)}</span>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveStop(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveStop(index, 'down')}
                    disabled={index === localStopPoints.length - 1}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeStop(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onForceRecalculate}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Optimized
            </Button>
            <Button
              onClick={() => onReorder({
                stopPoints: localStopPoints,
                customStopPoints: localCustomStopPoints
              })}
              className="flex-1"
            >
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}