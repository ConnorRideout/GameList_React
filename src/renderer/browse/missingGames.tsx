import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
// store
import { clearMissingGames, setEditType, setMissingGames } from "../../lib/store/gamelibrary"
import { useCheckMissingGamesMutation } from "../../lib/store/filesystemApi"
// components
import InputBox from "../shared/inputBox"
import Tooltip from "../shared/tooltip"
// types
import { GamelibState, RootState } from "../../types"


export default function MissingGames() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [checkForMissingGames] = useCheckMissingGamesMutation()
  const missingGames = useSelector((state: RootState) => state.data.missingGames)
  const gameslist = useSelector((state: RootState) => state.data.gamelib)
  const editType = useSelector((state: RootState) => state.data.editGameType)
  const [updatedMissingGames, setUpdatedMissingGames] = useState<GamelibState['missingGames']>([])

  const [disableSubmit, setDisableSubmit] = useState(true)

  const handleSubmit = () => {
    // update missing games, then trigger edit
    dispatch(setMissingGames(updatedMissingGames))
    dispatch(setEditType('update'))
    navigate('/edit')
  }

  const handleCancel = () => {
    // clear missing games
    setUpdatedMissingGames([])
    dispatch(clearMissingGames())
  }

  useEffect(() => {
    // show the submit button if any game has an updated path
    if (updatedMissingGames.length) setDisableSubmit(false)
  }, [updatedMissingGames])

  useEffect(() => {
    if (missingGames && missingGames.length && editType === 'update') {
      dispatch(setEditType('edit'));
      (async () => {
        // if returning from edit, make sure updatedMissingGames is still correct
        await checkForMissingGames(gameslist.map(({game_id, title, path}) => ({game_id, title, path})))
        const updated = missingGames.filter(miss => gameslist.find(g => g.game_id === miss.game_id)!.path !== miss.path)
        setUpdatedMissingGames(updated)
      })()
    }
  }, [missingGames, gameslist, checkForMissingGames, editType, dispatch])

  const searchForFolder = (missingGame: GamelibState['missingGames'][0]) => {
    const newFol = window.electron.openFileDialog({
      title: `Select Folder for '${missingGame.title}'`,
      dialogType: 'openDirectory'
    })
    if (newFol) {
      // user selected a folder
      if (newFol === '.') {
        // the games folder was selected
        const newPath = window.electron.openFileDialog({
          title: `Select Executable for '${missingGame.title}'`
        })
        if (newPath) {
          // user selected a file
          const newUpdatedMissingGames = updatedMissingGames.filter(g => g.game_id !== missingGame.game_id)
          newUpdatedMissingGames.push({...missingGame, path: newPath})
          setUpdatedMissingGames(newUpdatedMissingGames)
        }
        // if user doesn't select a file, nothing changes
      } else {
        // user selected a specific folder
        const newUpdatedMissingGames = updatedMissingGames.filter(g => g.game_id !== missingGame.game_id)
        newUpdatedMissingGames.push({...missingGame, path: newFol})
        setUpdatedMissingGames(newUpdatedMissingGames)
      }
      // if user doesn't select a folder, nothing changes
    }
  }

  return (
    <InputBox
      className="missing-games-container"
      title="Games with missing folders..."
      buttons={[
        {text: 'Cancel', clickHandler: handleCancel},
        ...(disableSubmit ? [] : [{text: 'Open Edit to Finish Updates', clickHandler: handleSubmit}])
      ]}
    >
      {missingGames.map(g => {
        const isUpdated = updatedMissingGames.findIndex(upG => g.game_id === upG.game_id) !== -1
        return (
          <div key={`missingGame-${g.game_id}`}>
            <p
              className={ isUpdated ? 'updated' : 'error' }
              id={`missingGames-${g.game_id}`}
            >
              {isUpdated ? 'Updated' : 'Missing'}
            </p>
            <Tooltip
              anchorSelect={`#missingGames-${g.game_id}`}
              place="bottom-start"
            >
              <p className={ isUpdated ? 'updated' : 'error' }>
                {isUpdated ?
                  `<games>/${updatedMissingGames.find(upG => g.game_id === upG.game_id)?.path}`
                  : `<games>/${missingGames.find(miss => g.game_id === miss.game_id)?.path}`
                }
              </p>
            </Tooltip>
            <span>
              <h2>{`"${g.title}"`}</h2>
              <button type="button" onClick={() => searchForFolder(g)}>Update Folder...</button>
            </span>
          </div>
        )
      })}
    </InputBox>
  )
}
