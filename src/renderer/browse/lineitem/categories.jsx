import React from "react"

export default function Categories({categories}) {
  return (
    <fieldset>
      <legend>Categories</legend>
      <p>{JSON.stringify(categories)}</p>
    </fieldset>
  )
}
