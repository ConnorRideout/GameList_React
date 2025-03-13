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
import Scrapers from './scrapers/scrapers'
import CreateGamesFormSchema from './games/games_schema'
import CreateDisplayFormSchema from './display_schema'
import CreateScrapersFormSchema from './scrapers/scrapers_schema'


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
  site_scrapers: {
    base_url: string,
    selectors: {
        type: string,
        selector: string,
        queryAll: boolean,
        regex: string,
        limit_text: boolean,
        remove_regex: string,
    }[]
  }[],
  site_scraper_aliases: SettingsType['site_scraper_aliases']
}

export default function Settings() {
  const navigate = useNavigate()
  const categories = useSelector((state: RootState) => state.data.categories)
  const statuses = useSelector((state: RootState) => state.data.statuses)
  const tags = useSelector((state: RootState) => state.data.tags)
  const settings = useSelector((state: RootState) => state.data.settings)
  const [curTab, setCurTab] = useState<'display' | 'games' | 'scrapers'>('display')
  const [isDisabled, setIsDisabled] = useState({display: true, games: true, scrapers: true})
  const [formErrors, setFormErrors] = useState<{display: string[], games: string[], scrapers: string[]}>({display: [], games: [], scrapers: []})
  // const [formErrorsGames, setFormErrorsGames] = useState<string[]>([])
  // const [formErrorsDisplay, setFormErrorsDisplay] = useState<string[]>([])
  // const [formErrorsScrapers, setFormErrorsScrapers] = useState<string[]>([])

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
          setIsDisabled(prevValue => ({...prevValue, games: JSON.stringify(formDataGames) === JSON.stringify(defaultGamesFormData)}))
          if (formErrors.games.length)
            setFormErrors(prevVal => ({...prevVal, games: []}))
      })
      .catch(err => {
        const uniqueErrors: string[] = Array.from(new Set(err.errors))
        if (JSON.stringify(uniqueErrors) !== JSON.stringify(formErrors.games)) {
          setIsDisabled(prevVal => ({...prevVal, games: true}))
          setFormErrors(prevVal => ({...prevVal, games: uniqueErrors}))
        }
      })
  }, [formDataGames, defaultGamesFormData, formSchemaGames, formErrors.games])

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

  const formSchemaDisplay = CreateDisplayFormSchema()
  useEffect(() => {
    formSchemaDisplay.validate(formDataDisplay, { abortEarly: false })
      .then(() => {
          setIsDisabled(prevValue => ({...prevValue, display: JSON.stringify(formDataDisplay) === JSON.stringify(defaultDisplayFormData)}))
          if (formErrors.display.length)
            setFormErrors(prevVal => ({...prevVal, display: []}))
      })
      .catch(err => {
        const uniqueErrors: string[] = Array.from(new Set(err.errors))
        if (JSON.stringify(uniqueErrors) !== JSON.stringify(formErrors.display)) {
          setIsDisabled(prevValue => ({...prevValue, display: true}))
          setFormErrors(prevVal => ({...prevVal, display: uniqueErrors}))
        }
      })
  }, [defaultDisplayFormData, formDataDisplay, formErrors.display, formSchemaDisplay])

  // scrapers
  const defaultScrapersFormData: DefaultScrapersFormType = useMemo(() => {
    const {
      site_scrapers: raw_site_scrapers,
      site_scraper_aliases
    } = settings
    const site_scrapers = raw_site_scrapers.map(scraper => {
      const selectors = scraper.selectors.map(sel => {
        const regex = sel.regex || ''
        const remove_regex = sel.remove_regex || ''
        return {...sel, regex, remove_regex}
      })
      return {...scraper, selectors}
    })
    return {site_scrapers, site_scraper_aliases}
  }, [settings])

  const [formDataScrapers, setFormDataScrapers] = useState<DefaultScrapersFormType>(defaultScrapersFormData)

  const formSchemaScrapers = CreateScrapersFormSchema()
  useEffect(() => {
    formSchemaScrapers.validate(formDataScrapers, { abortEarly: false })
      .then(() => {
          setIsDisabled(prevValue => ({...prevValue, scrapers: JSON.stringify(formDataScrapers) === JSON.stringify(defaultScrapersFormData)}))
          if (formErrors.scrapers.length)
            setFormErrors(prevVal => ({...prevVal, scrapers: []}))
      })
      .catch(err => {
        const uniqueErrors: string[] = Array.from(new Set(err.errors))
        if (JSON.stringify(uniqueErrors) !== JSON.stringify(formErrors.scrapers)) {
          setIsDisabled(prevValue => ({...prevValue, scrapers: true}))
          setFormErrors(prevVal => ({...prevVal, scrapers: uniqueErrors}))
        }
      })
  }, [defaultScrapersFormData, formDataScrapers, formErrors.scrapers, formSchemaScrapers])


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
          {Object.values(formErrors).flat().length > 0 && Object.values(formErrors).flat().map((err, idx) => (
            <p className='warning' key={`setting-error-${idx}`}>{err}</p>
          ))}
          <div className='settings-buttons'>
            <button type='button' onClick={handleClose}>Return</button>
            <button
              type='button'
              onClick={handleSave}
              disabled={Object.values(isDisabled).includes(true)}
            >Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
