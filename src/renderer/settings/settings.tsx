// TODO: implement settings component
// TODO: options for editing the categories/tags/etc
// TODO: option to hide 'beaten' games from recent lists
/* TODO: advanced option to make website scrapers:
title/description/version (expects a string) -> textinput[SELECTOR], checkbox[doQueryAll], textinput[regexmatcher](if doQueryAll, will be run on all SELECTOR matches and return the first regexMatch; otherwise, just returns the regexMatch of the textcontent)
tags (expects an array) -> textinput[SELECTOR], checkbox[doQueryAll], textinput[regexmatcher](if doQueryAll, will be run on all SELECTOR matches and returns an array of strings if the string.length > 0; otherwise, returns an array of the matches gotten by regexmatcher) it is required if doQueryAll is false
others -> combobox[TYPE(category|status|tag)], textinput[SELECTOR], checkbox[doQueryAll], textinput[regexmatcher](behaves like tags)
*/
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import TabularButton from '../shared/tabularButton'
import Display from './display'
import Games from './games'
import Scrapers from './scrapers'

export default function Settings() {
  const navigate = useNavigate()
  const [curTab, setCurTab] = useState<'display' | 'games' | 'scrapers'>('display')
  const [isDisabled, setIsDisabled] = useState(true)
  const [formData, setFormData] = useState({})

  const defaultFormData = useMemo(() => ({
    test: false
  }), [])

  useEffect(() => {
    setFormData(defaultFormData)
  }, [defaultFormData])

  useEffect(() => {
    setIsDisabled(JSON.stringify(formData) === JSON.stringify(defaultFormData))
  }, [formData, defaultFormData])

  const handleClose = () => {
    // TODO: if updated, ask to save
    navigate('/')
  }

  const handleSave = () => {
    // TODO: handle save
  }

  return (
    <div className="main-container center">
      <h1>Settings</h1>
      <div className='settings-container'>
        <div className='settings-nav'>
          <TabularButton
            text='Display'
            clickHandler={() => setCurTab('display')}
            active={curTab === 'display'}
          />
          <TabularButton
            text='Game Preferences'
            clickHandler={() => setCurTab('games')}
            active={curTab === 'games'}
          />
          <TabularButton
            text='Scrapers'
            clickHandler={() => setCurTab('scrapers')}
            active={curTab === 'scrapers'}
          />
          <span />
        </div>
        <div className='settings-body'>
          {curTab === 'display' && <Display />}
          {curTab === 'games' && <Games />}
          {curTab === 'scrapers' && <Scrapers />}
        </div>
        <div className='settings-buttons'>
          <button type='button' onClick={handleClose}>Return</button>
          <button
            type='button'
            onClick={handleSave}
            disabled={isDisabled}
          >Save</button>
        </div>
      </div>
    </div>
  )
}
