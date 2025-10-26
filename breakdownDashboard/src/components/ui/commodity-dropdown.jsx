"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const COMMODITIES = [
  'BR', 'Cl', 'ST', 'FS', 'FO', 'FW', 'FC', 'FMCG', 'GENC', 'CIT', 'BRD', 'PNT', 'CMT', 'HCON', 'CONT', 'GNL', 'GF', 'THDW', 'WH', 'TI', 'PAL', 'FERT', 'FL', 'STEEL', 'SHV', 'TYRE', 'SLT', 'GRAIN', 'EMP', 'MDD', 'BUILD', 'SALE', 'MAKRO', 'JUMBO', 'CNCLDN', 'DFT', 'MDD TRIP RATE', 'CHEP', 'BRK', 'HEIN', 'QSUGAR', 'SHU', 'JM', 'M5', 'CAM', 'MC', 'RH', 'FD', 'SAL', 'UML', 'MDD DAY RT', 'BRKDN', 'SERV/COF', 'NEWV', 'BBGD', 'GRMR', 'HMCPT', 'REVLOGS', 'REDLR', 'MT', 'MR', 'MDFT', 'CLTHM', 'SAPPI', 'CAM140', 'CAM148', 'CAMZULU', 'CAM PINE', 'CAMTR', 'BDFT', 'KELL', 'ULT', 'REPL', 'BRAK', 'RUST', 'BUILDF', 'HUL', 'ILOV', 'AFRO', 'ILL', 'SAP', 'P&G', 'VIP', 'DFTST', 'OMNI', 'SPEC', 'SAINT', 'LAD', 'BXM', 'VEG', 'CRAD', 'TVP', 'PALL', 'TIP', 'SALB', 'CLEAR'
]

export function CommodityDropdown({ value, onChange, placeholder = "Select commodity" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  const filteredCommodities = COMMODITIES.filter(commodity =>
    commodity.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSelect = (commodity) => {
    onChange(commodity)
    setIsOpen(false)
    setSearchTerm('')
  }

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
        <span>{value || placeholder}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-0 text-popover-foreground shadow-md">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={searchInputRef}
              className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search commodities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-auto p-1">
            {filteredCommodities.length === 0 ? (
              <div className="py-6 text-center text-sm">No commodities found.</div>
            ) : (
              filteredCommodities.map((commodity) => (
                <div
                  key={commodity}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value === commodity && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelect(commodity)}
                >
                  {commodity}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}