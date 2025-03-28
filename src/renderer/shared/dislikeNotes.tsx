import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import InputBox from './inputBox'

import { RootState } from '../../types'


interface Props {
  close: () => void
}
export default function DislikeNotes({close}: Props) {
  const dislikedGames = useSelector((state: RootState) => state.data.dislikedGames)
  const [formData, setFormData] = useState(dislikedGames)
  const [saveDisabled, setSaveDisabled] = useState(true)

  useEffect(() => {
    const isValid = !formData.find(g => !g.game_title.trim() || !g.dislike_reason.trim())
    const isUpdated = JSON.stringify(dislikedGames) !== JSON.stringify(formData)
    setSaveDisabled(!(isValid && isUpdated))
  }, [dislikedGames, formData])

  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = evt.target
    const id = parseInt(evt.target.getAttribute('data-id')!)
    setFormData(prevVal => {
      const newData = prevVal.map(g => ({...g}))
      const idx = prevVal.findIndex(g => g.dislike_id === id)
      newData[idx] = {...prevVal[idx], [name]: value}
      return newData
    })
  }

  const handleSave = () => {
    // TODO: handle save
  }

  const handleSaveClose = () => {
    handleSave()
    close()
  }

  return (
    <InputBox
      title="Games Marked as Uninterested"
      buttons={[
        {text: 'Cancel', clickHandler: close},
        {text: 'Save and Close', clickHandler: handleSaveClose, disabledState: saveDisabled},
        {text: 'Save', clickHandler: handleSave, disabledState: saveDisabled},
      ]}
      className='disliked-games-container'
    >
      <div className='column-headers'>
        <h2>Game Title</h2>
        <h2>Notes</h2>
      </div>
      <span className='separator' />
      <div className='scroll-area'>
        {formData.map(({dislike_id, game_title, dislike_reason}) => (
          <div key={dislike_id} className='game-container'>
            <textarea
              name="game_title"
              data-id={dislike_id}
              value={game_title}
              onInput={evt => {
                evt.currentTarget.style.height = 'auto'
                evt.currentTarget.style.height = `${evt.currentTarget.scrollHeight}px`
              }}
              onChange={handleChange}
            />
            <textarea
              name="dislike_reason"
              data-id={dislike_id}
              value={dislike_reason}
              onChange={handleChange}
            />
          </div>
        ))}
      </div>
    </InputBox>
  )
}
