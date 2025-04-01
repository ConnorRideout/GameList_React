import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
// store
import { clearMissingGames, setEditType, setMissingGames } from "../../../lib/store/gamelibrary"
import { useCheckMissingGamesMutation } from "../../../lib/store/filesystemApi"
import { useDeleteGameMutation } from "../../../lib/store/gamelibApi"
// components
import InputBox from "../../shared/inputBox"
import Tooltip from "../../shared/tooltip"
// types
import { GamelibState, RootState } from "../../../types"


export default function MissingGames() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [checkForMissingGames] = useCheckMissingGamesMutation()
  const missingGames = useSelector((state: RootState) => state.data.missingGames)
  const gameslist = useSelector((state: RootState) => state.data.gamelib)
  const editType = useSelector((state: RootState) => state.data.editGameType)
  const [updatedMissingGames, setUpdatedMissingGames] = useState<GamelibState['missingGames']>([])
  const [deletedGames, setDeletedGames] = useState<number[]>([])
  const [deleteGame] = useDeleteGameMutation()

  const [disableSubmit, setDisableSubmit] = useState(true)

  const toggleDeleted = (game_id: number) => {
    let updateDeleted: number[]
    if (deletedGames.includes(game_id)) {
      const idx = deletedGames.indexOf(game_id)
      updateDeleted = [...deletedGames]
      updateDeleted.splice(idx, 1)
    } else {
      updateDeleted = [...deletedGames, game_id]
    }
    setDeletedGames(updateDeleted)
  }

  const handleSubmit = () => {
    if (deletedGames.length) {
      const stopDelete = window.electron.showMessageBox(
        "Delete Games?",
        "Are you sure you want to delete these games? This cannot be undone!",
        'warning',
        ['Delete Games', 'Cancel'],
        1
      )
      if (stopDelete) return // if dialog was cancelled, don't do anything else
      deletedGames.forEach(g_id => {
        deleteGame(g_id)
      })
    }
    if (updatedMissingGames.length) {
      // update missing games, then trigger edit
      const updatedAndNotDeleted = updatedMissingGames.filter(upG => !deletedGames.includes(upG.game_id))
      dispatch(setMissingGames(updatedAndNotDeleted))
      dispatch(setEditType('update'))
      navigate('/edit')
    }
  }

  const handleCancel = () => {
    // clear missing games
    setUpdatedMissingGames([])
    dispatch(clearMissingGames())
  }

  useEffect(() => {
    // show the submit button if any game has an updated path
    setDisableSubmit(!(updatedMissingGames.length || deletedGames.length))
  }, [updatedMissingGames, deletedGames])

  useEffect(() => {
    // if returning from edit, make sure updatedMissingGames is still correct
    if (missingGames && missingGames.length && editType === 'update') {
      dispatch(setEditType('edit'));
      (async () => {
        await checkForMissingGames(gameslist.map(({ game_id, title, path }) => ({ game_id, title, path })))
        const updated = missingGames.filter(miss => gameslist.find(g => g.game_id === miss.game_id)!.path !== miss.path)
        setUpdatedMissingGames(updated)
      })()
    }
  }, [missingGames, gameslist, checkForMissingGames, editType, dispatch])

  const searchForFolder = (missingGame: GamelibState['missingGames'][0]) => {
    const newFol = window.electron.openFileDialog(
      `Select Folder for '${missingGame.title}'`,
      'openDirectory'
    )
    if (newFol) {
      // user selected a folder
      if (newFol === '.') {
        // the games folder was selected
        const newPath = window.electron.openFileDialog(
          `Select Executable for '${missingGame.title}'`,
          'openFile'
        )
        if (newPath) {
          // user selected a file
          const newUpdatedMissingGames = updatedMissingGames.filter(g => g.game_id !== missingGame.game_id)
          newUpdatedMissingGames.push({ ...missingGame, path: newPath })
          setUpdatedMissingGames(newUpdatedMissingGames)
        }
        // if user doesn't select a file, nothing changes
      } else {
        // user selected a specific folder
        const newUpdatedMissingGames = updatedMissingGames.filter(g => g.game_id !== missingGame.game_id)
        newUpdatedMissingGames.push({ ...missingGame, path: newFol })
        setUpdatedMissingGames(newUpdatedMissingGames)
      }
      // if user doesn't select a folder, nothing changes
    }
  }

  const updateFolderToFuzzy = (missingGame: GamelibState['missingGames'][0]) => {
    console.log('up')
    const newUpdatedMissingGames = updatedMissingGames.filter(g => g.game_id !== missingGame.game_id)
    newUpdatedMissingGames.push({ ...missingGame, path: missingGame.possible_new_path! })
    setUpdatedMissingGames(newUpdatedMissingGames)
  }

  return (
    <InputBox
      className="missing-games-container"
      title="Games with Missing Folders..."
      buttons={[
        { text: disableSubmit ? 'Skip' : 'Cancel', clickHandler: handleCancel },
        ...(disableSubmit ? [] : [{ text: `${updatedMissingGames.length ? 'Open Edit to Finish Update' : 'Delete Marked Game'}${updatedMissingGames.length > 1 || deletedGames.length > 1 ? 's' : ''}`, clickHandler: handleSubmit }])
      ]}
    >
      {missingGames.map(g => {
        const isUpdated = updatedMissingGames.findIndex(upG => g.game_id === upG.game_id) !== -1
        return (
          <div key={`missingGame-${g.game_id}`}>
            <span className="btn-container">
              <button
                type="button"
                id={`missingGames-delete-btn-${g.game_id}`}
                onClick={() => toggleDeleted(g.game_id)}
                className={`symbol-button ${deletedGames.includes(g.game_id) ? 'updated' : 'error'}`}
              >
                {deletedGames.includes(g.game_id) ? 'O' : 'X'}
              </button>
              <Tooltip
                anchorSelect={`#missingGames-delete-btn-${g.game_id}`}
                place="top"
              >
                {deletedGames.includes(g.game_id)
                  ? "Re-add this game to the game library."
                  : "Delete this game from the game library."}
              </Tooltip>
              {!deletedGames.includes(g.game_id) && (
                <button
                  type="button"
                  id={`missingGames-check-btn-${g.game_id}`}
                  onClick={() => updateFolderToFuzzy(g)}
                  className='symbol-button updated'
                  disabled={!g.possible_new_path || (updatedMissingGames.find(upg => upg.game_id === g.game_id)?.path === g.possible_new_path)}
                >
                  ✓
                </button>
              )}
              {g.possible_new_path && (updatedMissingGames.find(upg => upg.game_id === g.game_id)?.path !== g.possible_new_path) && (
                <Tooltip
                  anchorSelect={`#missingGames-check-btn-${g.game_id}`}
                  place="top"
                >
                  Set new path to the close matched folder:
                  <p className="updated">
                    {`<games>\\${g.possible_new_path}`}
                  </p>
                </Tooltip>
              )}
            </span>
            <p
              className={isUpdated ? 'updated' : deletedGames.includes(g.game_id) ? 'error' : 'warning'}
              id={`missingGames-${g.game_id}`}
            >
              {isUpdated ? 'Updated' : deletedGames.includes(g.game_id) ? 'Deleting' : 'Missing'}
            </p>
            {!deletedGames.includes(g.game_id) && (
              <Tooltip
                anchorSelect={`#missingGames-${g.game_id}`}
                place="bottom-start"
                className="missing-status."
              >
                Current pointer:
                <p className={isUpdated ? 'updated' : deletedGames.includes(g.game_id) ? 'error' : 'warning'}>
                  {isUpdated
                    ? `<games>\\${updatedMissingGames.find(upG => g.game_id === upG.game_id)?.path}`
                    : `<games>\\${missingGames.find(miss => g.game_id === miss.game_id)?.path}`
                  }
                </p>
              </Tooltip>
            )}
            <span className="title-container">
              <h2>{`"${g.title}"`}</h2>
              {!deletedGames.includes(g.game_id) && (
                <button
                  type="button"
                  onClick={() => searchForFolder(g)}
                >Update Folder...</button>
              )}
            </span>
          </div>
        )
      })}
    </InputBox>
  )
}
