import React from 'react'

import map from 'lodash/map'
import moment from 'moment'

import Select from 'PORTAL/components/basicComponents/select'
import type { ModulesType } from 'PORTAL/declarations'

interface VersionSelectorProps {
  studyModules: ModulesType[]
  selectedVersion: number
  onVersionChange: (version: number) => void
}

const VersionSelector = ({ studyModules, selectedVersion, onVersionChange }: VersionSelectorProps) => {
  if (studyModules.length <= 1) {
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onVersionChange(parseInt(e.target.value))
  }

  return (
    <Select
      inputProps={{
        id: 'version',
        name: 'version'
      }}
      labelId='dashboard.cards.version'
      label='Please select a version'
      defaultValue={selectedVersion}
      onChange={handleChange}
    >
      {map(studyModules, (form: ModulesType) => (
        <option key={`version-${form.version}`} value={form.version}>
          {`Version ${form.version} - Last updated ${moment(form.form_responses?.last_updated_at).format('MMMM Do, YYYY')}`}
        </option>
      ))}
    </Select>
  )
}

export default VersionSelector
