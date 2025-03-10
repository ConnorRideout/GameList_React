import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CategoryEntry, RootState, StatusEntry } from '../../types'

import TabularButton from '../shared/tabularButton'
import Display from './display'
import Games from './games'
import Scrapers from './scrapers'

export interface DefaultFormType {
  categories: CategoryEntry[],
  statuses: StatusEntry[],
  tags: string[],
}

export default function Settings() {
  const navigate = useNavigate()
  const categories = useSelector((state: RootState) => state.data.categories)
  const statuses = useSelector((state: RootState) => state.data.statuses)
  const tags = useSelector((state: RootState) => state.data.tags)
  const [curTab, setCurTab] = useState<'display' | 'games' | 'scrapers'>('display')
  const [isDisabled, setIsDisabled] = useState(true)

  const defaultFormData: DefaultFormType = useMemo(() => ({
    categories,
    statuses,
    tags: tags.map(t => t.tag_name)
  }), [categories, statuses, tags])
  const [formData, setFormData] = useState<DefaultFormType>(defaultFormData)

  useEffect(() => {
    setIsDisabled(JSON.stringify(formData) === JSON.stringify(defaultFormData))
  }, [formData, defaultFormData])

  const handleClose = () => {
    // TODO: if updated, ask to save
    navigate(-1)
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
        <div className='settings-body scrollable'>
          {curTab === 'display' && <Display formData={formData} />}
          {curTab === 'games' && <Games formData={formData} />}
          {curTab === 'scrapers' && <Scrapers formData={formData} />}
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
