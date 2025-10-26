"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DriverDropdown({ 
  value, 
  onChange, 
  drivers = [], 
  placeholder = "Select driver",
  isCalculatingDistance = false 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Filter drivers by availability and search term
  const filteredDrivers = drivers
    .filter(driver => driver.available === true) // Only show available drivers
    .filter(driver =>
      `${driver.first_name} ${driver.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.surname?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (driver) => {
    onChange(driver.id)
    setIsOpen(false)
    setSearchTerm('')
  }

  const selectedDriver = drivers.find(d => d.id === value)
  const displayValue = selectedDriver ? `${selectedDriver.first_name} ${selectedDriver.surname}` : ''

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          !value && "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">
            {isCalculatingDistance ? "Finding closest driver..." : (displayValue || placeholder)}
          </span>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform flex-shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-0 text-popover-foreground shadow-md max-h-80">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={searchInputRef}
              className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-auto p-1">
            {filteredDrivers.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchTerm ? 'No available drivers match your search.' : 'No available drivers found.'}
              </div>
            ) : (
              filteredDrivers.map((driver, index) => (
                <div
                  key={driver.id}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value === driver.id && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelect(driver)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>{driver.first_name} {driver.surname}</span>
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                        Available
                      </span>
                    </div>
                    {driver.distance !== null && (
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          index === 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {driver.distance}km
                        </span>
                        {index === 0 && (
                          <span className="text-xs text-blue-600">Closest</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}