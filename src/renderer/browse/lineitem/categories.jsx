import React from "react"
import styled from "styled-components"

const CategoryFieldset = styled.fieldset`
  min-width: 170px;
  max-width: 170px;
`

export default function Categories({categories}) {
  return (
    <CategoryFieldset>
      <legend>Categories</legend>
      {Object.entries(categories).map(([cat, val]) => (
        <p key={cat}>{`${cat.slice(0,1).toUpperCase()}${cat.slice(1)}: ${val}`}</p>
      ))}
    </CategoryFieldset>
  )
}
