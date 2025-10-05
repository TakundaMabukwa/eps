import React from 'react'
import { useGlobalContext } from '@/context/global-context/context'

const smallList = (arr, key = 'id', label = 'name') => {
  if (!Array.isArray(arr) || arr.length === 0) return <div style={{ fontSize: 12, color: '#666' }}>No items</div>
  return (
    <div style={{ fontSize: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>{key}</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>{label}</th>
          </tr>
        </thead>
        <tbody>
          {arr.slice(0, 50).map((it) => (
            <tr key={it[key] || Math.random()}>
              <td style={{ padding: '4px 6px', verticalAlign: 'top' }}>{it[key] || '—'}</td>
              <td style={{ padding: '4px 6px', verticalAlign: 'top' }}>{it[label] || it.name || it.title || JSON.stringify(it).slice(0, 60)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {arr.length > 50 && <div style={{ fontSize: 11, color: '#999' }}>Showing first 50 of {arr.length}</div>}
    </div>
  )
}

export default function DataViewer() {
  const { cost_centres, clients, trips, drivers, vehicles, stop_points, users } = useGlobalContext()

  return (
    <div style={{ position: 'fixed', left: 8, bottom: 8, zIndex: 9999, width: 480, maxHeight: '60vh', overflow: 'auto', background: 'rgba(255,255,255,0.98)', padding: 10, borderRadius: 8, boxShadow: '0 8px 20px rgba(0,0,0,0.12)' }}>
      <h4 style={{ margin: 0, marginBottom: 8 }}>Dev: Data Viewer</h4>
      <div style={{ marginBottom: 8 }}>
        <strong>Cost Centres</strong>
        {smallList(cost_centres?.data || [], 'id', 'name')}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Clients</strong>
        {smallList(clients?.data || [], 'id', 'name')}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Trips</strong>
        {smallList(trips?.data || [], 'id', 'orderNumber')}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Drivers</strong>
        {smallList(drivers?.data || [], 'id', 'name')}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Vehicles</strong>
        {smallList(vehicles?.data || [], 'id', 'regNumber')}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Stop Points</strong>
        {smallList(stop_points?.data || [], 'id', 'name')}
      </div>
      <div>
        <strong>Users</strong>
        {smallList(users?.data || [], 'id', 'email')}
      </div>
    </div>
  )
}
