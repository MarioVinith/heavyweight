import { useState, type FormEvent } from 'react'
import { useStore } from '../store/Store'

/** Extract the one-time token from a pasted Supabase magic link, if any. */
function parseMagicLink(text: string): { tokenHash: string; type: string } | null {
  try {
    const url = new URL(text.trim())
    const token = url.searchParams.get('token')
    if (!token) return null
    return { tokenHash: token, type: url.searchParams.get('type') ?? 'magiclink' }
  } catch {
    return null
  }
}

export default function Login() {
  const { signInWithEmail, verifyEmailCode, verifyMagicLink } = useStore()
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
    const input = code.trim()
    setStatus('verifying')
    try {
      if (/^\d{6}$/.test(input)) {
        await verifyEmailCode(email.trim(), input)
      } else {
        const link = parseMagicLink(input)
        if (!link) {
          throw new Error('not-a-link')
        }
        await verifyMagicLink(link.tokenHash, link.type)
      }
      // success: the auth listener flips the session and unmounts this screen
    } catch {
      setError(
        'That didn’t land. Paste the whole copied link (or a 6-digit code), and mind that links expire after a few minutes and work only once.',
      )
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
              In the installed app: <strong>long-press the link → Copy Link</strong>,
              come back, and paste it here (a 6-digit code works too, if your
              email shows one).
            </p>
            <form onSubmit={onVerify} className="login-form">
              <input
                className="input"
                autoComplete="one-time-code"
                placeholder="Paste link or 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                className="btn btn-gold btn-block"
                disabled={code.trim().length === 0 || status === 'verifying'}
              >
                {status === 'verifying' ? 'VERIFYING…' : 'VERIFY'}
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
