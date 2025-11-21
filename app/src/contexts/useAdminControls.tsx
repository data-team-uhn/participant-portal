import React, { useCallback, createContext, useContext, useEffect, useState, ReactNode } from 'react'

import each from 'lodash/each'
import get from 'lodash/get'
import orderBy from 'lodash/orderBy'
import moment from 'moment'

import { MAINTENANCE_BANNER_ID } from 'PORTAL/constants'
import { AuthContext, AuthContextType } from 'PORTAL/contexts/auth'
import app from 'PORTAL/feathers-client'
import { SETTING, RoleEnum } from 'PORTAL/constants'
import { SettingType } from 'PORTAL/declarations'
import type { Paginated } from '@feathersjs/feathers'

interface AdminControlsType {
  isMaintenanceBannerOn: boolean
  setIsMaintenanceBannerOn: (value: boolean) => void
  bannerHeight: number
  maintenanceBannerMessage: string
  setMaintenanceBannerMessage: (value: string) => void
  isLoginRestricted: boolean
  restrictLogin: (value: boolean) => void
  lastUpdateTime: string
  lastAdminToUpdate: string
  totalAuthenticatedUsers: number
  totalUsersOnline: number
  sessionInfoLoading: boolean,
  logoutAllUsers: () => void
}

type PaginatedSettings = Paginated<SettingType> & { totalAuthenticatedUsers: number, totalUsersOnline: number }

const AdminControlsContext = createContext<AdminControlsType | undefined>(undefined)

interface AdminControlsProviderProps {
  children: ReactNode
}

export const AdminControlsProvider: React.FC<AdminControlsProviderProps> = ({ children }) => {
  const [isMaintenanceBannerOn, setIsMaintenanceBannerOn] = useState(false)
  const [maintenanceBannerMessage, setMaintenanceBannerMessage] = useState(null)
  const [bannerHeight, setBannerHeight] = useState(0)
  const [isLoginRestricted, setIsLoginRestricted] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState(null)
  const [lastAdminToUpdate, setLastAdminToUpdate] = useState(null)
  const [totalAuthenticatedUsers, setTotalAuthenticatedUsers] = useState(0)
  const [totalUsersOnline, setTotalUsersOnline] = useState(0)
  const [sessionInfoLoading, setSessionInfoLoading] = useState(true)

  const { user, logout } = useContext(AuthContext) as AuthContextType

  const getCurrentSettings = async() => {
    const settings = await app.service('settings').find() as PaginatedSettings

    if (!settings.data) return

    each(settings.data, setting => {
      switch (setting.id) {
        case SETTING.bannerOn:
          setIsMaintenanceBannerOn(setting.value === 'true')
          break
        case SETTING.bannerMessage:
          setMaintenanceBannerMessage(setting.value)
          break
        case SETTING.restrictLogin:
          setIsLoginRestricted(setting.value === 'true')
          break
      }
    })

    if (user && user.role === RoleEnum.ADMIN) {
      // find the most recent change - sort records by updated_at in descending order
      const [mostRecentChange] = orderBy(settings.data, ['updated_at'], ['desc'])
      const lastUpdateTime = moment(mostRecentChange.updated_at).format('MMM DD, YYYY [at] h:mm A [EST]')
      const lastAdminToUpdate = get(mostRecentChange, 'editor_name.first_name', '') as string

      setLastUpdateTime(lastUpdateTime)
      setLastAdminToUpdate(lastAdminToUpdate)
      setTotalAuthenticatedUsers(settings.totalAuthenticatedUsers)
      setTotalUsersOnline(settings.totalUsersOnline)
    }
  }

  const getLatestSettingsListener = () => {
    return app.service('settings').on(SETTING.patched, (data: SettingType) => {
      const { id, value, updated_at, editor_name } = data

      switch (id) {
        case SETTING.bannerOn:
          setIsMaintenanceBannerOn(value === 'true')
          break
        case SETTING.bannerMessage:
          setMaintenanceBannerMessage(value)
          break
        case SETTING.restrictLogin:
          setIsLoginRestricted(value === 'true')
          break
        case SETTING.loggedOutTime:
          if (user && user.role !== RoleEnum.ADMIN) {
            logout()
          }
          break
        default:
          break
      }

      if (user && user.role === RoleEnum.ADMIN) {
        const lastUpdateTime = moment(updated_at).format('MMM DD, YYYY [at] h:mm A [EST]')
        setLastUpdateTime(lastUpdateTime)
        setLastAdminToUpdate(editor_name)
      }
    })
  }

  const getLatestSessionNumbers = () => {
    return app.service('settings').on(SETTING.newUserCount, (data: {
      totalUsersOnline: number,
      totalAuthenticatedUsers: number
    }) => {
      setTotalAuthenticatedUsers(get(data, SETTING.totalAuthenticatedUsers, 0))
      setTotalUsersOnline(get(data, SETTING.totalUsersOnline, 0))
    })
  }

  const loadInitialState = async() => {
    setSessionInfoLoading(true)
    await getCurrentSettings()
    await getLatestSettingsListener()
    if (user && user.role === RoleEnum.ADMIN) {
      await getLatestSessionNumbers()
    }
    setSessionInfoLoading(false)
  }

  useEffect(() => {
    loadInitialState()

    return () => {
      app.service('settings').removeListener(SETTING.patched)
      app.service('settings').removeListener(SETTING.newUserCount)
    }
  }, [user])

  useEffect(() => {
    const updateHeight = () => {
      if (user && user.role === RoleEnum.ADMIN) {
        setBannerHeight(0)
        return
      }

      const banner = document.getElementById(MAINTENANCE_BANNER_ID)
      if (banner) {
        setBannerHeight(banner.offsetHeight)
      } else {
        setBannerHeight(0)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)

    return () => {
      window.removeEventListener('resize', updateHeight)
    }
  }, [user, isMaintenanceBannerOn, maintenanceBannerMessage])

  const setBannerOn = useCallback((value: boolean) => {
    if (!user || user.role !== RoleEnum.ADMIN) return

    return app.service('settings').patch(SETTING.bannerOn, { value: value.toString() })
  }, [user])

  const setBannerMessage = useCallback((value: string) => {
    if (!user || user.role !== RoleEnum.ADMIN) return

    return app.service('settings').patch(SETTING.bannerMessage, { value })
  }, [user])

  const restrictLogin = useCallback((value: boolean) => {
    if (!user || user.role !== RoleEnum.ADMIN) return

    return app.service('settings').patch(SETTING.restrictLogin, { value })
  }, [user])

  const logoutAllUsers = () => {
    return app.service('settings').patch(SETTING.loggedOutTime, { value: new Date() })
  }

  const contextValue: AdminControlsType = {
    isMaintenanceBannerOn,
    setIsMaintenanceBannerOn: setBannerOn,
    bannerHeight,
    maintenanceBannerMessage,
    setMaintenanceBannerMessage: setBannerMessage,
    isLoginRestricted,
    restrictLogin,
    lastUpdateTime,
    lastAdminToUpdate,
    totalAuthenticatedUsers,
    totalUsersOnline,
    logoutAllUsers,
    sessionInfoLoading
  }

  return (
    <AdminControlsContext.Provider value={contextValue}>
      {children}
    </AdminControlsContext.Provider>
  )
}

export const useAdminControls = (): AdminControlsType => {
  const context = useContext(AdminControlsContext)
  if (context === undefined) {
    throw new Error('useMaintenanceMode must be used within a MaintenanceProvider')
  }
  return context
}
