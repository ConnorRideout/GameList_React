// TODO: make edit window
import React from "react"
import { useNavigate } from "react-router-dom"


export default function Edit() {
  const navigate = useNavigate()
  return (
    <div className="vertical-container">edit
      <button type="button" onClick={() => navigate('/')}>Return to browse</button>
    </div>

  )
}
