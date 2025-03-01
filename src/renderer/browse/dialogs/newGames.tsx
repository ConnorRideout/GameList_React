import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import InputBox from '../../shared/inputBox'
import TristateCheckbox from '../../shared/tristateCheckbox'

import { clearNewGames, setEditType, setNewGames } from '../../../lib/store/gamelibrary'

import { RootState } from '../../../types'
import { useLazyCheckNewGamesQuery } from '../../../lib/store/filesystemApi'


export default function NewGames() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const newGames = useSelector((state: RootState) => state.data.newGames)
  const [oldAddedGames, setOldAddedGames] = useState<string[]>([])
  const editType = useSelector((state: RootState) => state.data.editGameType)
  const [checkForNewGames] = useLazyCheckNewGamesQuery()
  const [addedNewGames, setAddedNewGames] = useState<{[name: string]: boolean}>({})
  const [tristate, setTristate] = useState(0)
  const [disableSubmit, setDisableSubmit] = useState(true)

  useEffect(() => {
    if (newGames.length) {
      setAddedNewGames(newGames.reduce((acc: {[name: string]: boolean}, cur) => {
        acc[cur] = oldAddedGames.includes(cur)
        return acc
      }, {}))
    }
  }, [newGames, oldAddedGames])

  const handlerSubmit = () => {
    // update new games, then trigger edit
    const addGames = Object.entries(addedNewGames).reduce((acc: string[], [pth, bool]) => {
      if (bool)
        acc.push(pth)
      return acc
    }, [])
    dispatch(setNewGames(addGames))
    dispatch(setEditType('new'))
    navigate('/edit')
  }

  const handlerCancel = () => {
    // clear new games
    setAddedNewGames({})
    dispatch(clearNewGames())
  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = evt.target
    setAddedNewGames({...addedNewGames, [name]: checked})
  }

  const handleCheckAllBox = (evt: React.ChangeEvent, isTristate: boolean) => {
    const { checked } = (evt as React.ChangeEvent<HTMLInputElement>).target
    const newVal = isTristate ? 1 : Number(checked) // don't allow user to select tristate
    // change all the formState values
    setAddedNewGames(Object.keys(addedNewGames).reduce((acc: {[name: string]: boolean}, cur) => {
      acc[cur] = Boolean(newVal)
      return acc
    }, {}))
  }

  useEffect(() => {
    const vals = Object.values(addedNewGames)
    const includesTrue = vals.includes(true)
    const includesFalse = vals.includes(false)
    // if there are any checked elements, enable the submit button
    setDisableSubmit(!includesTrue)
    // if there are both checked and unchecked, make sure the TristateCheckbox is tristate
    if (includesTrue && includesFalse) {
      setTristate(-1)
    } else if (includesFalse) {
      setTristate(0)
    } else {
      setTristate(1)
    }
  }, [addedNewGames])

  useEffect(() => {
    // if returning from edit, make sure addedGames is still correct
    if (editType === 'new' && newGames && newGames.length) {
      dispatch(setEditType('edit'))
      setOldAddedGames([...newGames])
      checkForNewGames()
    }
  }, [editType, newGames, dispatch, checkForNewGames])


  if (!newGames.length || Object.keys(addedNewGames).length === 0) return null
  return (
    <InputBox
      className='new-games-container'
      title='Add New Games...'
      buttons={[
        {text: 'Cancel', clickHandler: handlerCancel},
        ...(disableSubmit ? [] : [{text: 'Open Edit with New Games', clickHandler: handlerSubmit}])
      ]}
    >
      <div className='legend'>
        <TristateCheckbox
          labelText='Add'
          handleFormChange={handleCheckAllBox}
          checkState={tristate}
        >
          <h3>Add</h3>
        </TristateCheckbox>
        <span />
        <h2>Game Folder</h2>
      </div>

      <div>
        {Object.keys(addedNewGames).map(gPath => (
          <div key={`new-games-${gPath}`}>
            <input
              type="checkbox"
              name={gPath}
              onChange={handleChange}
              checked={addedNewGames[gPath]}
            />
            <span />
            <h2>{gPath}</h2>
          </div>
        ))}
      </div>
    </InputBox>
  )
}
