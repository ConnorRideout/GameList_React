/* eslint-disable react/no-array-index-key */
import React from 'react'

// eslint-disable-next-line import/no-cycle
import { Props } from './scrapers'
import Tooltip from '../../shared/tooltip'


export default function Logins({formData, setFormData}: Props) {
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>, website_id: number) => {
    const {name, value} = evt.target
    // name = login_url | username | username_selector | password | password_selector | submit_selector
    const site_scrapers = structuredClone(formData)
    const { login } = site_scrapers.find(s => s.website_id === website_id)!
    login[name] = value
    setFormData(site_scrapers)
  }

  return (
    <fieldset className='logins'>
      <legend><h1>SITE LOGINS</h1></legend>
      <div className='scraper-header'>
        <h2 className='short-span no-grow'>Site URL</h2>
        <h2 className='medium-span'>
          Login URL
          <span
            data-tooltip-id="logins-info-tooltip"
            data-tooltip-content="The URL of the login page, where you would type your username and password"
          >?</span>
        </h2>
        <h2 className='short-span'>
          Username
          <span
            data-tooltip-id='logins-info-tooltip'
            data-tooltip-content="The username you use to login to the site"
          >?</span>
        </h2>
        <h2 className='medium-span'>
          Username<br/>Selector
          <span
            data-tooltip-id='logins-info-tooltip'
            data-tooltip-content="The JavaScript selector for the username input field that will be passed to 'document.querySelector'"
          >?</span>
        </h2>
        <h2 className='short-span'>
          Password
          <span
            data-tooltip-id='logins-info-tooltip'
            data-tooltip-content="The password you use to login to the site"
          >?</span>
        </h2>
        <h2 className='medium-span'>
          Password<br/>Selector
          <span
            data-tooltip-id='logins-info-tooltip'
            data-tooltip-content="The JavaScript selector for the password input field that will be passed to 'document.querySelector'"
          >?</span>
        </h2>
        <h2 className='medium-span'>
          Submit<br/>Selector
          <span
            data-tooltip-id='logins-info-tooltip'
            data-tooltip-content="The JavaScript selector for the submit button/field that will be passed to 'document.querySelector'"
          >?</span>
        </h2>
        <Tooltip id="logins-info-tooltip"/>
      </div>
      <span className='separator' />

      <div className='vertical-container scrollable'>
        {formData.map(({base_url, website_id, login: {login_url, username, username_selector, password, password_selector, submit_selector}}, index) => (
          <React.Fragment key={`logins-${index}`}>
            <div className='horizontal-container align-center'>
              <input
                type="text"
                className='short no-grow'
                name='base_url'
                value={base_url}
                disabled
              />

              <input
                type="text"
                className='medium'
                name='login_url'
                value={login_url}
                onChange={evt => handleChange(evt, website_id)}
              />

              <input
                type="text"
                className="short"
                name='username'
                value={username}
                onChange={evt => handleChange(evt, website_id)}
              />

              <input
                type="text"
                className='medium'
                name='username_selector'
                value={username_selector}
                onChange={evt => handleChange(evt, website_id)}
              />

              <input
                type="text"
                className="short"
                name='password'
                value={password}
                onChange={evt => handleChange(evt, website_id)}
              />

              <input
                type="text"
                className='medium'
                name='password_selector'
                value={password_selector}
                onChange={evt => handleChange(evt, website_id)}
              />

              <input
                type="text"
                className='medium'
                name='submit_selector'
                value={submit_selector}
                onChange={evt => handleChange(evt, website_id)}
              />
            </div>
          </React.Fragment>
        ))}
      </div>

    </fieldset>
  )
}
