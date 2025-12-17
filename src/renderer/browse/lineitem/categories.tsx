// STRETCH: add a context menu item to mark game as "beaten"
import React from "react"
import { StringMap } from "../../../lib/types/types-gamelibrary"


export default function Categories({categories}: {categories: StringMap}) {
  return (
    <fieldset className="categories">
      <legend>Categories</legend>
      {Object.entries(categories).map(([cat, val]) => (
        <p key={cat}>{`${cat.slice(0,1).toUpperCase()}${cat.slice(1)}: ${val}`}</p>
      ))}
    </fieldset>
  )
}
