import { useEffect } from 'react'

type Props = {
  message: string
  gold?: boolean
  onDone: () => void
}

export default function Toast({ message, gold = false, onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className={'toast' + (gold ? ' toast-gold' : '')} role="status">
      {message}
    </div>
  )
}
