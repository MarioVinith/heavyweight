import { useState, type FormEvent } from 'react'
import { useStore } from '../store/Store'

export default function Login() {
  const { signInWithEmail } = useStore()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      await signInWithEmail(email.trim())
      setStatus('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <div className="center-wrap">
      <div className="login">
        <h1 className="display login-title">
          HEAVY<span className="gold">WEIGHT</span>
        </h1>
        <p className="label login-tag">The graph only goes up if you show up</p>

        {status === 'sent' ? (
          <div className="card login-sent">
            <p className="display">CHECK YOUR EMAIL</p>
            <p className="muted">
              Tap the magic link on <strong>this device</strong> and you're in.
              No password. Ever.
            </p>
            <button
              className="btn btn-ghost btn-block"
              onClick={() => setStatus('idle')}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="login-form">
            <input
              className="input"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn btn-gold btn-block" disabled={status === 'sending'}>
              {status === 'sending' ? 'SENDING…' : 'SEND ME THE MAGIC LINK'}
            </button>
            {status === 'error' && <p className="error-text">{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
