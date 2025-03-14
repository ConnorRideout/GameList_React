import React, { useEffect, useRef, useState } from 'react'

import {
  PlusSvg,
  MinusSvg
} from "../../shared/svg"

// eslint-disable-next-line import/no-cycle
import { Props } from './games'

export default function Categories({formData, setFormData}: Props) {
  const [newCategoryAdded, setNewCategoryAdded] = useState(false)
  const [newOptionAdded, setNewOptionAdded] = useState(false)
  const categoryRef = useRef<HTMLDivElement>(null)

  // auto scroll to new inputs
  useEffect(() => {
    if (newCategoryAdded || newOptionAdded) {
      // using a timeout ensures the component updates and shows any errors before trying to do anything
      setTimeout(() => {
        if (newCategoryAdded)
          setNewCategoryAdded(false)
        else
          setNewOptionAdded(false)
        const newItem = categoryRef.current!.querySelector("input[type='text'][data-value='~~placeholder~~']") as HTMLInputElement
        if (newItem) {
          if (newCategoryAdded)
            newItem.parentElement?.nextElementSibling?.nextElementSibling?.scrollIntoView({block: 'nearest'})
          newItem.parentElement?.nextElementSibling?.scrollIntoView({block: 'nearest'})
          newItem.focus()
        }
      }, 0)
    }
  }, [newCategoryAdded, newOptionAdded])

  const handleRemoveCategory = (idx: number) => {
    const newCategories = [...formData.categories]
    newCategories.splice(idx, 1)

    setFormData(prevValue => ({...prevValue, categories: newCategories}))
  }

  const handleAddCategory = () => {
    const category_ids = formData.categories.map(c => c.category_id)
    const category_id = Math.max(...category_ids) + 1
    const newCategories = [...formData.categories, {
      category_id,
      category_name: '~~placeholder~~',
      options: [],
      default_option: null
    }]

    setNewCategoryAdded(true)
    setFormData(prevValue => ({...prevValue, categories: newCategories}))
  }

  const handleRemoveOption = (cat_id: number, opt_idx: number) => {
    const newCategories = formData.categories.map(cat => ({...cat}))
    const newCat = newCategories.find(c => c.category_id === cat_id)!
    const newOptions = [...newCat.options]
    newOptions.splice(opt_idx, 1)
    newCat.options = newOptions

    setFormData(prevValue => ({...prevValue, categories: newCategories}))
  }

  const handleAddOption = (cat_id: number) => {
    const newCategories = formData.categories.map(cat => ({...cat}))
    const newCat = newCategories.find(c => c.category_id === cat_id)!
    const newOptions = [...newCat.options, '~~placeholder~~']
    newCat.options = newOptions

    setNewOptionAdded(true)
    setFormData(prevValue => ({...prevValue, categories: newCategories}))
  }

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement> | {target: {value: string}}) => {
    const { name, value } = evt.target as HTMLInputElement

    const [change_type, raw_cat_id, raw_opt_idx] = name.split('-')
    const cat_id = parseInt(raw_cat_id)

    const oldCategories = formData.categories.map(cat => ({...cat}))
    const oldCat = oldCategories.find(cat => cat.category_id === cat_id)!

    if (change_type === 'default') {
      oldCat.default_option = oldCat.default_option === value ? null : value
    } else if (change_type === 'name') {
      oldCat.category_name = value.toLowerCase()
    } else {
      const opt_idx = parseInt(raw_opt_idx)
      const newOptions = [...oldCat.options]
      newOptions[opt_idx] = value
      oldCat.options = newOptions
    }

    setFormData(prevData => ({...prevData, categories: oldCategories}))
  }

  const handleBlur = (evt: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = evt.target
    const newVal = value.trim()
    handleChange({target: {value: newVal, name}})
  }

  return (
    <fieldset className='vertical-container grid-column-1 grid-row-span-2' >
      <legend>CATEGORIES</legend>

      <div className='horizontal-container align-center'>
        <span style={{minWidth: 22}} />
        <h2>Category Name</h2>
        <span style={{minWidth: 17}} />
        <h2>Category Options</h2>
        <h3>Default<br/>Option</h3>
      </div>
      <span className='separator'/>

      <div className='vertical-container scrollable' ref={categoryRef} >
        {formData.categories.map(({category_id, category_name, options, default_option}, index) => {
          return (
            <React.Fragment key={`category-${category_id}`}>
              <div className='horizontal-container'>
                <button
                  type='button'
                  className='svg-button small center'
                  onClick={() => handleRemoveCategory(index)}
                >
                  <MinusSvg />
                </button>

                <input
                  type="text"
                  name={`name-${category_id}`}
                  data-value={category_name}
                  value={category_name === '~~placeholder~~' ? '' : category_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                <div className='vertical-container'>
                  {options.map((opt, idx) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <div key={`${category_id}-${idx}`} className='horizontal-container align-center'>
                        <button
                          type='button'
                          className='svg-button small'
                          onClick={() => handleRemoveOption(category_id, idx)}
                        >
                          <MinusSvg size={17} />
                        </button>

                        <input
                          type="text"
                          name={`option-${category_id}-${idx}`}
                          data-value={opt}
                          value={opt === '~~placeholder~~' ? '' : opt}
                          onChange={(evt) => handleChange(evt)}
                          onBlur={handleBlur}
                        />
                        <input
                          type="radio"
                          name={`default-${category_id}`}
                          value={opt}
                          checked={opt === default_option}
                          onClick={handleChange}
                          onChange={() => ''}
                        />
                      </div>
                    )
                  )}

                  <button
                    type='button'
                    className='svg-button small'
                    style={{marginTop: '4px'}}
                    onClick={() => handleAddOption(category_id)}
                  >
                    <PlusSvg size={17} />
                  </button>
                </div>
              </div>
              <span className='separator'/>
            </React.Fragment>
          )
        })}

        <button
          type='button'
          className='svg-button small'
          onClick={handleAddCategory}
        >
          <PlusSvg />
        </button>
      </div>
    </fieldset>
  )
}
