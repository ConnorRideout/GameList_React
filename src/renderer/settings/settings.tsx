// TODO: implement settings component
// TODO: options for editing the categories/tags/etc
// TODO: option to hide 'beaten' games from recent lists
/* TODO: advanced option to make website scrapers:
title/description/version (expects a string) -> textinput[SELECTOR], checkbox[doQueryAll], textinput[regexmatcher](if doQueryAll, will be run on all SELECTOR matches and return the first regexMatch; otherwise, just returns the regexMatch of the textcontent)
tags (expects an array) -> textinput[SELECTOR], checkbox[doQueryAll], textinput[regexmatcher](if doQueryAll, will be run on all SELECTOR matches and returns an array of strings if the string.length > 0; otherwise, returns an array of the matches gotten by regexmatcher) it is required if doQueryAll is false
others -> combobox[TYPE(category|status|tag)], textinput[SELECTOR], checkbox[doQueryAll], textinput[regexmatcher](behaves like tags)
*/
import React from 'react'


export default function Settings() {
  return (
    <div>settings</div>
  )
}
