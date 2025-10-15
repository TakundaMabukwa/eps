"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

type Equipment = {
  id: number
  plate: string
  unitIpAddress: string
  tankSize: number | string
  costCentre: string
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([
    { id: 1, plate: 'HW67VCGP M', unitIpAddress: '57.163.1.216', tankSize: 1100, costCentre: 'EPS => Fuel Probes - (COST CODE: 001)' },
    { id: 2, plate: 'JR30TPGP', unitIpAddress: '57.163.1.253', tankSize: 840, costCentre: 'EPS => Fuel Probes - (COST CODE: 001)' },
    { id: 3, plate: 'HY87GKGP', unitIpAddress: '59.98.1.136', tankSize: 1100, costCentre: 'EPS => Fuel Probes - (COST CODE: 001)' },
  ])

  // Form state for Add dialog
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [plate, setPlate] = useState('')
  const [unitIpAddress, setUnitIpAddress] = useState('')
  const [tankSize, setTankSize] = useState<number | ''>('')
  const [costCentre, setCostCentre] = useState('')

  const costCentreOptions = [
    'EPS => Fuel Probes - (COST CODE: 001)',
    'EPS => Open network - (COST CODE: 001)',
    'Other Cost Centre 002'
  ]

  const resetForm = () => {
    setPlate('')
    setUnitIpAddress('')
    setTankSize('')
    setCostCentre('')
  }

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!plate.trim() || !unitIpAddress.trim()) {
      toast.error('Please fill required fields')
      return
    }

    const newRow: Equipment = {
      id: Date.now(),
      plate: plate.trim(),
      unitIpAddress: unitIpAddress.trim(),
      tankSize: tankSize || '-',
      costCentre: costCentre || 'Unassigned'
    }

    setEquipment(prev => [newRow, ...prev])
    toast.success('Equipment added')
    resetForm()
    setIsAddOpen(false)
  }

  const handleDelete = (id: number) => {
    if (!confirm('Delete equipment?')) return
    setEquipment(prev => prev.filter(e => e.id !== id))
    toast.success('Equipment deleted')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment</h1>
          <p className="text-gray-600 mt-1">Manage equipment records for your fleet</p>
        </div>

        <div className="flex items-center space-x-2">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Button>
            </DialogTrigger>

            <DialogContent className="w-11/12 md:w-2/5 max-h-[90vh] overflow-y-auto p-6">
              <DialogHeader>
                <DialogTitle>Add Equipment</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <Label htmlFor="plate">Plate *</Label>
                  <Input id="plate" value={plate} onChange={(e) => setPlate(e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="unitIp">Unit Ip Address *</Label>
                  <Input id="unitIp" value={unitIpAddress} onChange={(e) => setUnitIpAddress(e.target.value)} required />
                </div>

                <div>
                  <Label htmlFor="tankSize">Tank Size</Label>
                  <Input id="tankSize" type="number" value={tankSize === '' ? '' : String(tankSize)} onChange={(e) => setTankSize(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>

                <div>
                  <Label htmlFor="costCentre">Cost Centre</Label>
                  <Select onValueChange={(v) => setCostCentre(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={costCentre || 'Select cost centre'} />
                    </SelectTrigger>
                    <SelectContent>
                      {costCentreOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); resetForm() }}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Plate</TableHead>
                  <TableHead className="font-semibold">Unit Ip Address</TableHead>
                  <TableHead className="font-semibold">Tank Size</TableHead>
                  <TableHead className="font-semibold">Cost Centre</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">No equipment found</TableCell>
                  </TableRow>
                ) : (
                  equipment.map(eq => (
                    <TableRow key={eq.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="text-sm font-medium">{eq.plate}</TableCell>
                      <TableCell className="text-sm">{eq.unitIpAddress}</TableCell>
                      <TableCell className="text-sm">{eq.tankSize}</TableCell>
                      <TableCell className="text-sm truncate max-w-xs">{eq.costCentre}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center">
                          <Button size="sm" variant="outline" onClick={() => alert('Edit not implemented')}>Edit</Button>
                          <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => handleDelete(eq.id)}>
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
