/// <reference types="vite/client" />

const BASE = import.meta.env.VITE_GAS_BASE_URL as string

export async function listItems() {
  if (!BASE) throw new Error('VITE_GAS_BASE_URL is not configured')
  const url = `${BASE}?route=listItems`
  const res = await fetch(url, { method: 'GET', redirect: 'follow' })
  const data = await res.json()
  if (!data.ok) throw new Error(data.error || 'Failed')
  return data.data
}

export async function createItem(payload: { name: string; email: string }) {
  if (!BASE) throw new Error('VITE_GAS_BASE_URL is not configured')
  const res = await fetch(BASE, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ route: 'createItem', payload })
  })
  const data = await res.json()
  if (!data.ok) throw new Error(data.error || 'Failed')
  return data.data
}
