/* eslint-disable react/no-array-index-key */
/* eslint-disable promise/catch-or-return */
/* eslint-disable import/no-cycle */
// TODO: add a `return & save` button
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CategoryEntry, RootState, SettingsType, StatusEntry } from '../../types'

import TabularButton from '../shared/tabularButton'
import Display from './display'
import Games from './games/games'
import Scrapers from './scrapers'
import CreateGamesFormSchema from './games/games_schema'


export interface DefaultGamesFormType {
  categories: CategoryEntry[],
  statuses: StatusEntry[],
  tags: string[],
}
export interface DefaultDisplayFormType {
  games_folder: SettingsType['games_folder'],
  locale_emulator: SettingsType['locale_emulator'],
  file_types: SettingsType['file_types'],
  ignored_exes: SettingsType['ignored_exes']
}
export interface DefaultScrapersFormType {
  site_scrapers: SettingsType['site_scrapers'],
  site_scraper_aliases: SettingsType['site_scraper_aliases']
}

export default function Settings() {
  const navigate = useNavigate()
  const categories = useSelector((state: RootState) => state.data.categories)
  const statuses = useSelector((state: RootState) => state.data.statuses)
  const tags = useSelector((state: RootState) => state.data.tags)
  const settings = useSelector((state: RootState) => state.data.settings)
  const [curTab, setCurTab] = useState<'display' | 'games' | 'scrapers'>('display')
  const [isDisabled, setIsDisabled] = useState(true)
  const [formErrorsGames, setFormErrorsGames] = useState<string[]>([])

  // FORM DATA
  // games
  const defaultGamesFormData: DefaultGamesFormType = useMemo(() => ({
    categories,
    statuses,
    tags: tags.map(t => t.tag_name)
  }), [categories, statuses, tags])

  const [formDataGames, setFormDataGames] = useState<DefaultGamesFormType>(defaultGamesFormData)

  const formSchemaGames = CreateGamesFormSchema()
  useEffect(() => {
    formSchemaGames.validate(formDataGames, { abortEarly: false })
      .then(() => {
          setIsDisabled(JSON.stringify(formDataGames) === JSON.stringify(defaultGamesFormData))
          if (formErrorsGames.length)
            setFormErrorsGames([])
      })
      .catch(err => {
        const uniqueErrors: string[] = Array.from(new Set(err.errors))
        if (JSON.stringify(uniqueErrors) !== JSON.stringify(formErrorsGames)) {
          setIsDisabled(true)
          setFormErrorsGames(uniqueErrors)
        }
      })
  }, [formDataGames, defaultGamesFormData, formSchemaGames, formErrorsGames])

  // display
  const defaultDisplayFormData: DefaultDisplayFormType = useMemo(() => {
    const {
      games_folder,
      locale_emulator,
      file_types,
      ignored_exes
    } = settings
    return { games_folder, locale_emulator, file_types, ignored_exes }
  }, [settings])

  const [formDataDisplay, setFormDataDisplay] = useState<DefaultDisplayFormType>(defaultDisplayFormData)

  // scrapers
  const defaultScrapersFormData: DefaultScrapersFormType = useMemo(() => {
    const {
      site_scrapers,
      site_scraper_aliases
    } = settings
    return {site_scrapers, site_scraper_aliases}
  }, [settings])

  const [formDataScrapers, setFormDataScrapers] = useState<DefaultScrapersFormType>(defaultScrapersFormData)


  // HANDLERS
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
        <div className='settings-body'>
          {curTab === 'display' && <Display formData={formDataDisplay} setFormData={setFormDataDisplay}/>}
          {curTab === 'games' && <Games formData={formDataGames} setFormData={setFormDataGames} />}
          {curTab === 'scrapers' && <Scrapers formData={formDataScrapers} setFormData={setFormDataScrapers}/>}
        </div>
        <div className='vertical-container align-center'>
          {formErrorsGames.length > 0 && formErrorsGames.map((err, idx) => (
            <p className='warning' key={`setting-error-${idx}`}>{err}</p>
          ))}
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
    </div>
  )
}
