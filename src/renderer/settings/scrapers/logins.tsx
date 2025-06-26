// TODO: make this
/* eslint-disable react/no-array-index-key */
import React from 'react'

// eslint-disable-next-line import/no-cycle
import { Props } from './scrapers'


export default function Logins({formData, setFormData}: Props) {
  const handleChange = () => {

  }

  return (
    <fieldset className='logins'>
      <legend><h1>SITE LOGINS</h1></legend>
      <div className='scraper-header'>
        <h2 className='short-span'>Site URL</h2>
        <h2 className='medium-short-span'>
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
            data-tooltip-content=""
          >?</span>
        </h2>
        <h2 className='medium-span'>
          Username<br/>Selector
          <span
            data-tooltip-id='logins-info-tooltip'
            data-tooltip-content=""
          >?</span>
        </h2>
        <h2 className='short-span'>
          Password
          <span
            data-tooltip-id='logins-info-tooltip'
            data-tooltip-content=""
          >?</span>
        </h2>
        <h2 className='medium-span'>
          Password<br/>Selector
          <span
            data-tooltip-id='logins-info-tooltip'
            data-tooltip-content=""
          >?</span>
        </h2>
        <h2 className='medium-span'>
          Submit<br/>Selector
          <span
            data-tooltip-id='logins-info-tooltip'
            data-tooltip-content=""
          >?</span>
        </h2>
      </div>
      <span className='separator' />

      <div className='vertical-container scrollable'>
        {formData.site_scrapers.map(({base_url, login: {login_url, username, username_selector, password, password_selector, submit_selector}}, index) => (
          <React.Fragment key={`logins-${index}`}>
            <div className='horizontal-container align-center'>
              <input
                type="text"
                className='short'
                name='base_url'
                value={base_url}
                disabled
              />

              <input
                type="text"
                className='login-url'
                name='login_url'
                value={login_url}
                onChange={handleChange}
              />

              <input
                type="text"
                className="short"
                name='username'
                value={username}
                onChange={handleChange}
              />

              <input
                type="text"
                name='username_selector'
                value={username_selector}
                onChange={handleChange}
              />

              <input
                type="text"
                className="short"
                name='password'
                value={password}
                onChange={handleChange}
              />

              <input
                type="text"
                name='password_selector'
                value={password_selector}
                onChange={handleChange}
              />

              <input
                type="text"
                name='submit_selector'
                value={submit_selector}
                onChange={handleChange}
              />
            </div>
          </React.Fragment>
        ))}
      </div>

    </fieldset>
  )
}
