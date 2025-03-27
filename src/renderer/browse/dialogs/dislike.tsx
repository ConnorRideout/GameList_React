import React, { useState } from 'react'

import InputBox from '../../shared/inputBox'

import { useDeleteGameMutation, useNewDislikeMutation } from '../../../lib/store/gamelibApi'


interface Props {
  dislikedGame: {game_id: number, title: string},
  clearDislikedGame: () => void
}
export default function DislikeGame({dislikedGame, clearDislikedGame}: Props) {
  const {game_id, title} = dislikedGame
  const [ note, setNote ] = useState('')
  const [deleteGame] = useDeleteGameMutation()
  const [addNewDislike] = useNewDislikeMutation()

  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const {value} = evt.target
    setNote(value)
  }

  const handleMarkDislike = () => {
    addNewDislike({game_title: title, dislike_reason: note})
    deleteGame(game_id)

    clearDislikedGame()
  }

  const handleClose = () => {
    clearDislikedGame()
  }

  return (
    <InputBox
      title="Marking Game as Uninterested"
      buttons={[
        {text: 'Cancel', clickHandler: handleClose},
        {
          text: 'Save Dislike Note and Delete Game',
          clickHandler: handleMarkDislike,
          disabledState: !note.trim().length
        },
      ]}
      className='dislike-game-container'
    >
      <p>What&apos;s the reason that you didn&apos;t like<br />[<b>{title}</b>]?</p>
      <textarea
        value={note}
        onChange={handleChange}
      />
    </InputBox>
  )
}
