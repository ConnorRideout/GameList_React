/* eslint import/prefer-default-export: off */
import { URL } from 'url'
import path from 'path'
import fs from 'fs'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import axios from 'axios'

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212
    const url = new URL(`http://localhost:${port}`)
    url.pathname = htmlFileName
    return url.href
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`
}


export function setSecretKey(secretKey: string, password: string) {
  try {
    // hash the password
    const hash = bcrypt.hashSync(password, 10)
    process.env.PASSWORD = hash

    // encrypt the secret key
    const iv = crypto.randomBytes(16)
    const keyBuffer = crypto.createHash('sha256').update(password).digest()
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv)
    let encrypted = cipher.update(secretKey, 'utf-8', 'hex')
    encrypted += cipher.final('hex')
    // update the env variable, both frontend and backend
    process.env.SECRET_KEY = secretKey
    axios.put('http://localhost:9000/settings/env', {key: secretKey})

    // save the key and hash to .env file
    const envContent = `SECRET_KEY=${encrypted}.${iv.toString('hex')}\nPASSWORD=${hash}\n`

    fs.writeFileSync('./.env', envContent)
    console.log('PASSWORD and SECRET_KEY saved to .env file and updated in process.env')
  } catch (err) {
    console.error(err)
  }
}

export function getSecretKey(password?: string) {
  if (!password) {
    // send back the raw values of SECRET_KEY and PASSWORD
    return {key: process.env.SECRET_KEY, pass: process.env.PASSWORD}
  }

  if (bcrypt.compareSync(password, process.env.PASSWORD!)) {
    const [encrypted, iv] = process.env.SECRET_KEY!.split('.')
    if (!iv || iv.length !== 32) {
      // secretKey was already decrypted
      return undefined
    }
    const keyBuffer = crypto.createHash('sha256').update(password).digest()
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, Buffer.from(iv, 'hex'))
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')
    // update ENV variable in frontend and backend
    process.env.SECRET_KEY = decrypted
    axios.put('http://localhost:9000/settings/env', {key: decrypted})
    return undefined
  } else {
    // incorrect pin
    return 'Incorrect Pin Number'
  }
}
