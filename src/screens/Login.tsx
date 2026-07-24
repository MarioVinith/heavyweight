import { useState, type FormEvent } from 'react'
import { useStore } from '../store/Store'

export default function Login() {
  const { signInWithEmail, verifyEmailCode } = useStore()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'sent' | 'verifying' | 'error'
  >('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      await signInWithEmail(email.trim())
      setError('')
      setStatus('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault()
    setStatus('verifying')
    try {
      await verifyEmailCode(email.trim(), code)
      // success: the auth listener flips the session and unmounts this screen
    } catch {
      setError('That code didn’t land. Check it and try again — codes expire after a few minutes.')
      setStatus('sent')
    }
  }

  const sent = status === 'sent' || status === 'verifying'

  return (
    <div className="center-wrap">
      <div className="login">
        <h1 className="display login-title">
          HEAVY<span className="gold">WEIGHT</span>
        </h1>
        <p className="label login-tag">The graph only goes up if you show up</p>

        {sent ? (
          <div className="card login-sent">
            <p className="display">CHECK YOUR EMAIL</p>
            <p className="muted">
              In a browser: tap the magic link.
              <br />
              In the installed app: type the <strong>6-digit code</strong> from
              the same email below.
            </p>
            <form onSubmit={onVerify} className="login-form">
              <input
                className="input code-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
              <button
                className="btn btn-gold btn-block"
                disabled={code.length !== 6 || status === 'verifying'}
              >
                {status === 'verifying' ? 'VERIFYING…' : 'VERIFY CODE'}
              </button>
            </form>
            {error && <p className="error-text">{error}</p>}
            <button
              className="btn btn-ghost btn-block"
              onClick={() => {
                setStatus('idle')
                setCode('')
                setError('')
              }}
            >
              Start over
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
