import React, { useEffect, useState } from 'react'
import { listItems, createItem } from './api'

export default function App() {
  const [items, setItems] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    try {
      setBusy(true)
      setError(null)
      const data = await listItems()
      setItems(data)
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => { load() }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setBusy(true)
      setError(null)
      const created = await createItem({ name, email })
      setItems(prev => [created, ...prev])
      setName('')
      setEmail('')
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container">
      <h1>React + GAS + Sheets</h1>
      <p>Backend URL: <code>{import.meta.env.VITE_GAS_BASE_URL || '(not set)'}</code></p>
      {error && <p className="error">Error: {error}</p>}

      <form onSubmit={onSubmit} className="card">
        <h2>Add item</h2>
        <label>
          Name
          <input value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input value={email} onChange={e => setEmail(e.target.value)} required type="email" />
        </label>
        <button disabled={busy}>Create</button>
      </form>

      <section className="card">
        <h2>Items {busy && '…'}</h2>
        {!busy && items.length === 0 && <p>No data yet.</p>}
        <ul>
          {items.map(it => (
            <li key={it.id}>
              <b>{it.name}</b> — {it.email}
              <small> ({it.id})</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
