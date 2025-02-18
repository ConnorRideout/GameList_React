/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-array-index-key */
import React, { ChangeEvent, useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { debounce } from 'lodash'
import { FixedSizeList as List } from 'react-window'

import { setSortOrder, setStatus } from "../../data/store/gamelibrary"

import { RootState } from "../../types"


interface Props {
  scrollToItem: (idx: number) => void,
}
export default function TextSearch({scrollToItem}: Props) {
  const dispatch = useDispatch()
  const game_titles = useSelector((state: RootState) => state.data.gamelib).map(g => g.title)
  const [searchValue, setSearchValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const listRef = useRef<List>(null)
  const parentRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const noMatch = '-- no matching games --'


  const debounceFilterSuggestions = debounce((value: string) => {
    if (value) {
      const regex = new RegExp(value, 'i')
      const getMatchScore = (suggestion: string) => {
        const match = suggestion.match(regex)
        return match ? match.index || -1 : -1
      }

      const filteredSuggestions = game_titles.filter(ttl => regex.test(ttl))
      const sortedSuggestions = filteredSuggestions.sort((a, b) => getMatchScore(a) - getMatchScore(b))
      setSuggestions(sortedSuggestions.length ? sortedSuggestions : [noMatch])
    } else {
      setSuggestions([])
    }
  }, 500)

  // select the first suggestion while typing
  useEffect(() => {
    setSelectedIndex(0)
    listRef.current?.scrollTo(0)
  }, [searchValue])

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const {value} = evt.target
    setSearchValue(value)
    // only update the suggestion list every 500ms
    debounceFilterSuggestions(value)
  }

  const handleReset = (refocus=true) => {
    setSearchValue('')
    setSuggestions([])
    if (refocus) inputRef.current?.focus()
  }

  const sortOrder = useSelector((state: RootState) => state.data.sortOrder)
  const sortGamelib = (sortby: string) => {
    if (sortOrder !== sortby) {
      dispatch(setStatus('updating'))
      return new Promise(resolve => {
        setTimeout(() => {
          dispatch(setSortOrder(sortby))
          dispatch(setStatus('succeeded'))
          resolve('done')
        }, 10)
      })
    }
    return 'done'
  }
  const handleSubmit = async (forceVal='') => {
    if (forceVal || game_titles.includes(searchValue)) {
      inputRef.current?.blur()
      const val = forceVal || searchValue
      // handleReset(false)
      await sortGamelib('alphabetical')
      const idx = game_titles.indexOf(val)
      scrollToItem(idx)
      let iteration = 0
      const checkVisibility = setInterval(()=>{
        const element = document.querySelector(`div.horizontal-container[data-title="${val}"]`)
        if (element) {
          clearInterval(checkVisibility)
          element.classList.add('flash-twice-invert')
          setTimeout(()=>element.classList.remove('flash-twice-invert'), 1000)
        } else if (iteration > 100) {
          clearInterval(checkVisibility)
        }
        iteration++
      }, 100)
    }
  }

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'ArrowDown') {
      setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, suggestions.length - 1))
      const list = listRef.current
      list?.scrollToItem(selectedIndex+1)
    } else if (evt.key === 'ArrowUp') {
      setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0))
      const list = listRef.current
      list?.scrollToItem(selectedIndex-1)
    } else if (evt.key === 'Enter') {
      if (suggestions.length && suggestions[0] !== noMatch) {
        const newVal = suggestions[selectedIndex]
        setSearchValue(newVal)
        // Clear suggestions after selection
        setSuggestions([])
        // Search for item
        handleSubmit(newVal)
      } else if (game_titles.includes(searchValue)) {
        handleSubmit()
      }
    } else if (evt.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  const handleFocus = () => {
    setShowSuggestions(true)
  }
  const handleBlur = () => {
    setTimeout(() => {
      if (parentRef.current && !parentRef.current.contains(document.activeElement)) {
        setShowSuggestions(false)
      }
    }, 10)
  }

  const handleSuggestionClick = (idx:number) => {
    const newVal = suggestions[idx]
    inputRef.current?.focus()
    if (newVal !== noMatch) {
      setSearchValue(newVal)
      setSuggestions([])
      handleSubmit(newVal)
    }
  }

  const handleSuggestionHover = (index: number) => {
    if (selectedIndex !== index) setSelectedIndex(index)
  }

  return (
    <div
      className="text-search"
      onFocus={handleFocus}
      ref={parentRef}
      onBlur={handleBlur}
    >
      <input
        type="text"
        value={searchValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search by title..."
        ref={inputRef}
        className={suggestions.length && suggestions[0] === noMatch ? 'error' : ''}
      />
      <button
        type="button"
        className="clear"
        onClick={() => handleReset()}
      >X</button>
      {showSuggestions && suggestions.length > 0 && (
        <List
          height={375}
          width='100%'
          style={{position: 'absolute'}}
          itemCount={suggestions.length}
          itemSize={25}
          overscanCount={5}
          ref={listRef}
          className="text-search-suggestions"
        >
          {({index, style}) => (
            <p
              id={`suggestion-${index}`}
              style={style}
              onClick={() => handleSuggestionClick(index)}
              onMouseMove={() => handleSuggestionHover(index)}
              className={suggestions[index] === noMatch ? 'error' : (index === selectedIndex ? 'highlighted' : '')}
              tabIndex={index+1}
            >
              {suggestions[index]}
            </p>
          )}
        </List>
      )}
      <button
        type="button"
        onClick={() => handleSubmit()}
        disabled={!searchValue || !game_titles.includes(searchValue)}
      >⨠</button>
    </div>
  )
}
