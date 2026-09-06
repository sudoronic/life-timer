import { useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, Car, Clock3, Info, Moon, Settings2, Sparkles, TimerReset, Utensils } from 'lucide-react'
import './App.css'

const MINUTES_PER_DAY = 1440
const categories = [
  { id: 'sleep', label: 'Sleeping', icon: Moon, minutes: 480, color: 'indigo' },
  { id: 'food', label: 'Eating & drinking', icon: Utensils, minutes: 90, color: 'amber' },
  { id: 'bathroom', label: 'Bathroom & getting ready', icon: TimerReset, minutes: 45, color: 'cyan' },
  { id: 'travel', label: 'Commuting & chores', icon: Car, minutes: 90, color: 'emerald' },
]

const formatNumber = (value: number) => Math.max(0, Math.floor(value)).toLocaleString()

function ageAt(birthDate: Date, now: Date) {
  let years = now.getFullYear() - birthDate.getFullYear()
  let months = now.getMonth() - birthDate.getMonth()
  let days = now.getDate() - birthDate.getDate()
  if (days < 0) {
    months -= 1
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  return { years, months, days }
}

function App() {
  const [birthMonth, setBirthMonth] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [now, setNow] = useState(() => new Date())
  const [lifespanYears, setLifespanYears] = useState('80')
  const [dailyMinutes, setDailyMinutes] = useState(() => Object.fromEntries(categories.map((item) => [item.id, item.minutes])))
  const dob = birthMonth && birthDay && birthYear
    ? `${birthYear.padStart(4, '0')}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`
    : ''

  useEffect(() => {
    if (!dob) return
    const interval = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(interval)
  }, [dob])

  const result = useMemo(() => {
    if (!dob) return null
    const birthDate = new Date(`${dob}T00:00:00`)
    const validDate = !Number.isNaN(birthDate.getTime())
      && birthDate.getFullYear() === Number(birthYear)
      && birthDate.getMonth() === Number(birthMonth) - 1
      && birthDate.getDate() === Number(birthDay)
      && birthDate <= now
    if (!validDate) return { error: 'Choose a valid date in the past to start your timer.' }
    const livedMinutes = (now.getTime() - birthDate.getTime()) / 60000
    const years = Number(lifespanYears)
    const lifespanMinutes = (Number.isFinite(years) && years > 0 ? years : 80) * 365.25 * MINUTES_PER_DAY
    return { livedMinutes, lifespanMinutes, remainingMinutes: Math.max(0, lifespanMinutes - livedMinutes), age: ageAt(birthDate, now) }
  }, [birthDay, birthMonth, birthYear, dob, lifespanYears, now])

  const reset = () => {
    setBirthMonth('')
    setBirthDay('')
    setBirthYear('')
    setLifespanYears('80')
    setDailyMinutes(Object.fromEntries(categories.map((item) => [item.id, item.minutes])))
  }

  return (
    <main className="page">
      <div className="container">
        <header className="header">
          <div className="eyebrow"><Clock3 size={18} /> Personal reflection tool</div>
          <h1>Your life, in minutes.</h1>
          <p>A gentle, live reminder of the time you have already lived — and the time still waiting to be filled.</p>
        </header>

        {!result || 'error' in result ? (
          <section className="start-card">
            <div className="start-hero"><Sparkles size={28} /><h2>Start your personal timer</h2><p>Enter your date of birth. Everything is calculated locally in your browser and nothing is saved.</p></div>
            <div className="start-content">
              <label>Date of birth</label>
              <div className="date-fields">
                <div><label htmlFor="birth-month">Month</label><input id="birth-month" inputMode="numeric" type="text" maxLength={2} placeholder="MM" value={birthMonth} onChange={(event) => setBirthMonth(event.target.value.replace(/\D/g, '').slice(0, 2))} /></div>
                <div><label htmlFor="birth-day">Day</label><input id="birth-day" inputMode="numeric" type="text" maxLength={2} placeholder="DD" value={birthDay} onChange={(event) => setBirthDay(event.target.value.replace(/\D/g, '').slice(0, 2))} /></div>
                <div className="year-field"><label htmlFor="birth-year">Year</label><input id="birth-year" inputMode="numeric" type="text" maxLength={4} placeholder="YYYY" value={birthYear} onChange={(event) => setBirthYear(event.target.value.replace(/\D/g, '').slice(0, 4))} /></div>
              </div>
              <span className="date-hint">Enter month, day, and year — for example, 08 / 24 / 2001.</span>
              {result && 'error' in result && <span className="error">{result.error}</span>}
              <div className="note"><Info size={16} /><span>Your timer starts at midnight on your birth date. This is a reflection tool, not a prediction.</span></div>
              <button className="primary-button" disabled={!dob} onClick={() => setNow(new Date())}>See my life in minutes <ArrowDownRight size={18} /></button>
            </div>
          </section>
        ) : (
          <div className="dashboard">
            <section className="top-grid">
              <div className="hero-card">
                <div className="hero-content">
                  <div><span className="muted-label">You have lived</span><strong>{formatNumber(result.livedMinutes)} <small>minutes</small></strong><span className="age">Age {result.age.years} years, {result.age.months} months, {result.age.days} days</span></div>
                  <Clock3 className="hero-icon" size={46} />
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, result.livedMinutes / result.lifespanMinutes * 100)}%` }} /></div>
                <div className="progress-labels"><span>{(result.livedMinutes / result.lifespanMinutes * 100).toFixed(2)}% of your assumed lifespan</span><span>{lifespanYears} years</span></div>
              </div>
              <div className="metrics">
                <div className="metric accent"><span>Remaining</span><strong>{formatNumber(result.remainingMinutes)}</strong><small>estimated minutes</small></div>
                <div className="metric violet"><span>Live count</span><strong>{Math.floor(result.livedMinutes % 1 * 60)}s</strong><small>seconds keep moving</small></div>
                <div className="metric"><span>Lived days</span><strong>{formatNumber(result.livedMinutes / MINUTES_PER_DAY)}</strong><small>since your birthday</small></div>
                <div className="metric"><span>Assumption</span><strong>{lifespanYears} yrs</strong><small>{formatNumber(result.lifespanMinutes)} total minutes</small></div>
              </div>
            </section>

            <section className="bottom-grid">
              <div className="panel">
                <div className="panel-heading"><div><h2>Where your minutes go</h2><p>Daily-life estimates based on your editable assumptions.</p></div><Settings2 size={19} /></div>
                <div className="category-list">
                  {categories.map((category) => {
                    const Icon = category.icon
                    const minutes = Number(dailyMinutes[category.id])
                    const lifetimeMinutes = result.livedMinutes / MINUTES_PER_DAY * minutes
                    return <div className="category" key={category.id}><div className={`category-icon ${category.color}`}><Icon size={17} /></div><div className="category-main"><div className="category-label"><span>{category.label}</span><b>{formatNumber(lifetimeMinutes)} min</b></div><div className="bar"><i className={category.color} style={{ width: `${Math.min(100, minutes / MINUTES_PER_DAY * 800)}%` }} /></div></div><label className="sr-only" htmlFor={category.id}>Daily minutes for {category.label}</label><input id={category.id} type="number" min="0" max="1440" value={minutes} onChange={(event) => setDailyMinutes({ ...dailyMinutes, [category.id]: Math.max(0, Number(event.target.value) || 0) })} /></div>
                  })}
                </div>
                <p className="fine-print">Values show estimated lifetime minutes spent. Edit the daily minutes on the right of each row.</p>
              </div>
              <div className="panel settings-panel">
                <h2>Make the number yours</h2><p>The default is an assumption, not a forecast. Adjust it to explore a perspective that feels meaningful to you.</p>
                <label htmlFor="lifespan">Assumed lifespan (years)</label>
                <input id="lifespan" type="number" min="1" max="150" value={lifespanYears} onChange={(event) => setLifespanYears(event.target.value)} />
                <span className="helper">That equals {formatNumber(result.lifespanMinutes)} minutes using 365.25 days/year.</span>
                <button className="outline-button" onClick={reset}><TimerReset size={16} /> New date</button><span className="nothing">Nothing is stored.</span>
              </div>
            </section>
          </div>
        )}
        <footer>Life Timer is a private, browser-only reflection tool.</footer>
      </div>
    </main>
  )
}

export default App
