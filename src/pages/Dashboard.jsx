import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminFetch, adminLogout } from '../api'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [data, setData]               = useState(null)
  const [error, setError]             = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editValues, setEditValues]   = useState({})
  const [saving, setSaving]           = useState(false)
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      setData(await adminFetch('/api/admin/weatherforecast'))
    } catch (err) {
      setError(err.message)
    }
  }

  function startEdit(index, row) {
    setEditingIndex(index)
    setEditValues({ temperatureC: row.temperatureC, summary: row.summary ?? '' })
    setError('')
  }

  function cancelEdit() {
    setEditingIndex(null)
    setEditValues({})
  }

  async function saveEdit(index) {
    setSaving(true)
    try {
      const updated = await adminFetch(`/api/admin/weatherforecast/${index}`, {
        method: 'PUT',
        body: JSON.stringify({
          temperatureC: Number(editValues.temperatureC),
          summary: editValues.summary,
        }),
      })
      setData(prev => prev.map((row, i) => i === index ? updated : row))
      setEditingIndex(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await adminLogout()
    navigate('/login')
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.badge}>ADMIN</span>
          <span className={styles.title}>ScubaHub</span>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>Log out</button>
      </header>

      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>Weather Forecast</h2>

        {error && <p className={styles.error}>{error}</p>}
        {!data && !error && <p className={styles.loading}>Loading…</p>}

        {data && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Temp (°C)</th>
                  <th>Temp (°F)</th>
                  <th>Summary</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => {
                  const isEditing = editingIndex === i

                  return (
                    <tr key={i} className={isEditing ? styles.editingRow : ''}>
                      <td>{row.date}</td>

                      <td>
                        {isEditing ? (
                          <input
                            className={styles.editInput}
                            type="number"
                            value={editValues.temperatureC}
                            onChange={e => setEditValues(v => ({ ...v, temperatureC: e.target.value }))}
                          />
                        ) : row.temperatureC}
                      </td>

                      <td>{row.temperatureF}</td>

                      <td>
                        {isEditing ? (
                          <input
                            className={styles.editInput}
                            type="text"
                            value={editValues.summary}
                            onChange={e => setEditValues(v => ({ ...v, summary: e.target.value }))}
                          />
                        ) : row.summary}
                      </td>

                      <td className={styles.actions}>
                        {isEditing ? (
                          <>
                            <button
                              className={styles.saveBtn}
                              onClick={() => saveEdit(i)}
                              disabled={saving}
                            >
                              {saving ? '…' : 'Save'}
                            </button>
                            <button
                              className={styles.cancelBtn}
                              onClick={cancelEdit}
                              disabled={saving}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            className={styles.editBtn}
                            onClick={() => startEdit(i, row)}
                            disabled={editingIndex !== null}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
