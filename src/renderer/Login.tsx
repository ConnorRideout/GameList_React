// TODO: add option to reset password at the cost of deleting all saved website logins
import React, { useEffect, useState, useRef } from 'react'

function SetSecretKey({setShowSecret}: {setShowSecret: React.Dispatch<React.SetStateAction<boolean>>}) {
  const [secretKey, setSecretKey] = useState('')
  const [password, setPassword] = useState('')

  const [disabled, setDisabled] = useState([true, true])

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = evt.target
    const val = value.trim()
    if (name === "key") {
      setSecretKey(val)
      setDisabled(prev => [(val.length < 5 || val.length > 25), prev[1]])
    } else if (/^\d*$/.test(val)) {
      setPassword(val)
      setDisabled(prev => [prev[0], val.length < 4 || val.length > 6])
    }
  }

  const handleClick = () => {
    window.electron.setSecretKey({secretKey, password})
    setShowSecret(false)
  }

  return (
    <div className='vertical-container'>
      <label className='vertical-container'>
        Please enter a secret key that&apos;s 5 to 25 characters long. It can be a combination of numbers, letters, and symbols:
        <input type="text" name="key" value={secretKey} onChange={handleChange} />
      </label>

      <label className='vertical-container'>
        Please enter a login pin that&apos;s 4 to 6 digits long:
        <input type="text" name="pass" value={password} onChange={handleChange} />
      </label>

      <button
        type='button'
        onClick={handleClick}
        disabled={disabled.includes(true)}
      >
        Submit
      </button>
    </div>
  )
}



interface Props {
  children: React.ReactNode
}
export default function Login({children}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [pin, setPin] = useState('')

  const [showSecret, setShowSecret] = useState(false)
  const [showLogin, setShowLogin] = useState(true)

  useEffect(() => {
    const { key, pass } = window.electron.getSecretKey() as {key: string, pass: string}
    setShowSecret(!key || !pass)
    setShowLogin(!(!key || !pass))
  }, [])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [showSecret, showLogin])

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = evt.target
    if (/^\d*$/.test(value)) {
      setPin(value)
    }
  }

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault()
    const res = window.electron.getSecretKey(pin)
    if (res) {
      setError(res as string)
    } else {
      setShowLogin(false)
    }
  }

  if (showSecret) {
    return (
      <SetSecretKey setShowSecret={setShowSecret} />
    )
  }

  if (showLogin) {
    return (
      <form className='vertical-container align-center' onSubmit={handleSubmit}>
        <label className='vertical-container'>
          Please Log In With Your Pin:
          <input
            type="text"
            ref={inputRef}
            value={pin}
            onChange={handleChange}
          />
        </label>
        {error && (
          <p className='error'>{error}</p>
        )}

        <button type='submit' disabled={!pin.length}>
          Login
        </button>
      </form>
    )
  }

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {children}
    </>
  )
}
