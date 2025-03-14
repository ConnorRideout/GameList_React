/* eslint-disable react/no-array-index-key */
/* eslint-disable promise/catch-or-return */
/* eslint-disable import/no-cycle */
// TODO: add a `return & save` button
import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
  const [isDisabled, setIsDisabled] = useState(true)
  const [shouldBeDisabled, setShouldBeDisabled] = useState<{display: boolean, games: boolean, scrapers: boolean, [key: string]: boolean}>({display: true, games: true, scrapers: true})
  const [formErrors, setFormErrors] = useState<{display: string[], games: string[], scrapers: string[]}>({display: [], games: [], scrapers: []})

  // FORM DATA
  type CompareDataType = DefaultDisplayFormType | DefaultGamesFormType | DefaultScrapersFormType
  const compareSetDisabled = useCallback((key: 'games' | 'display' | 'scrapers', newData: CompareDataType, oldData: CompareDataType) => {
    const compare = JSON.stringify(newData) === JSON.stringify(oldData)
    if (shouldBeDisabled[key] !== compare)
      setShouldBeDisabled(prevValue => ({...prevValue, [key]: compare}))
  }, [shouldBeDisabled])

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
    console.log('running display schema effect')
    formSchemaDisplay.validate(formDataDisplay, { abortEarly: false })
      .then(() => {
        console.log('no display form error')
        compareSetDisabled('display', formDataDisplay, defaultDisplayFormData)
        if (formErrors.display.length) {
          console.log('clearing display form errors')
          setFormErrors(prevVal => ({...prevVal, display: []}))
        }
      })
      .catch(err => {
        console.log('yes display form errors')
        const uniqueErrors: string[] = Array.from(new Set(err.errors))
        if (JSON.stringify(uniqueErrors) !== JSON.stringify(formErrors.display)) {
          console.log('new display form errors')
          setShouldBeDisabled(prevValue => ({...prevValue, display: true}))
          setFormErrors(prevVal => ({...prevVal, display: uniqueErrors}))
        }
      })
  }, [defaultDisplayFormData, formDataDisplay, formSchemaDisplay, formErrors.display, compareSetDisabled])

  // games
  const defaultGamesFormData: DefaultGamesFormType = useMemo(() => ({
    categories,
    statuses,
    tags: tags.map(t => t.tag_name)
  }), [categories, statuses, tags])

  const [formDataGames, setFormDataGames] = useState<DefaultGamesFormType>(defaultGamesFormData)

  const formSchemaGames = CreateGamesFormSchema()
  useEffect(() => {
    console.log('running games schema effect')
    formSchemaGames.validate(formDataGames, { abortEarly: false })
      .then(() => {
        console.log('no games form errors')
        compareSetDisabled('games', formDataGames, defaultGamesFormData)
        if (formErrors.games.length) {
          console.log('clearing games form errors')
          setFormErrors(prevVal => ({...prevVal, games: []}))
        }
      })
      .catch(err => {
        console.log('yes games form errors')
        const uniqueErrors: string[] = Array.from(new Set(err.errors))
        if (JSON.stringify(uniqueErrors) !== JSON.stringify(formErrors.games)) {
          console.log('new games form errors')
          setShouldBeDisabled(prevVal => ({...prevVal, games: true}))
          setFormErrors(prevVal => ({...prevVal, games: uniqueErrors}))
        }
      })
  }, [formDataGames, defaultGamesFormData, formSchemaGames, formErrors.games, compareSetDisabled])

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
    console.log('running scraper schema effect')
    formSchemaScrapers.validate(formDataScrapers, { abortEarly: false })
      .then(() => {
        console.log('no scraper form errors')
        compareSetDisabled('scrapers', formDataScrapers, defaultScrapersFormData)
        if (formErrors.scrapers.length) {
          console.log('clearing scraper form errors')
          setFormErrors(prevVal => ({...prevVal, scrapers: []}))
        }
      })
      .catch(err => {
        console.log('yes scraper form errors')
        const uniqueErrors: string[] = Array.from(new Set(err.errors))
        if (JSON.stringify(uniqueErrors) !== JSON.stringify(formErrors.scrapers)) {
          console.log('new scraper form errors')
          setShouldBeDisabled(prevValue => ({...prevValue, scrapers: true}))
          setFormErrors(prevVal => ({...prevVal, scrapers: uniqueErrors}))
        }
      })
  }, [defaultScrapersFormData, formDataScrapers, formSchemaScrapers, formErrors.scrapers, compareSetDisabled])

  // set disabled
  useEffect(() => {
    setIsDisabled(
      !(
        Object.values(shouldBeDisabled).includes(false) &&
        Object.values(formErrors).flat().length === 0
      ) || JSON.stringify({...formDataDisplay, ...formDataGames, ...formDataScrapers}).includes('~~placeholder~~')
    )
  }, [formDataDisplay, formDataGames, formDataScrapers, formErrors, shouldBeDisabled])

  // HANDLERS
  const handleSave = () => {
    // TODO: handle save
    console.log('saving')
  }

  const handleClose = () => {
    if (Object.values(shouldBeDisabled).includes(false) && Object.values(formErrors).flat().length === 0) {
      const doSave = window.electron.showMessageBox(
        'Save Changes?',
        'Do you want to save your changes before leaving settings?',
        undefined,
        ['Yes', 'No', 'Cancel'],
        0
      )
      if (doSave === 0) {
        handleSave()
        navigate(-1)
      } else if (doSave === 1) {
        navigate(-1)
      }
    } else if (Object.values(formErrors).flat().length) {
      // there are changes present
      const stay = window.electron.showMessageBox(
        'Discard Changes?',
        "If you leave now, your changes will be discarded. Continue?",
        undefined,
        ['Leave', 'Cancel'],
        1
      )
      if (!stay) {
        navigate(-1)
      }
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="main-container center">
      <h1>Settings</h1>
      <div className='settings-container'>
        <div className='settings-nav'>
          <TabularButton
            className={formErrors.display.length ? 'has-error' : ''}
            text='Display'
            clickHandler={() => setCurTab('display')}
            active={curTab === 'display'}
          />
          <TabularButton
            className={formErrors.games.length ? 'has-error' : ''}
            text='Game Preferences'
            clickHandler={() => setCurTab('games')}
            active={curTab === 'games'}
          />
          <TabularButton
            className={formErrors.scrapers.length ? 'has-error' : ''}
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
              disabled={isDisabled}
            >Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
