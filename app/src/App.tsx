import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import AdminProtectedRoutes from 'PORTAL/components/adminProtectedRoutes'
import AdminCoordinatorProtectedRoutes from 'PORTAL/components/adminCoordinatorProtectedRoutes'
import IdleDialog from 'PORTAL/components/idleDialog'
import Invitations from 'PORTAL/pages/admin/invitations'
import MaintenanceBanner from 'PORTAL/components/maintenanceBanner'
import ProtectedRoutes from 'PORTAL/components/protectedRoutes'
import PublicRoutes from 'PORTAL/components/publicRoutes'
import ThemeProviderWrapper from 'PORTAL/components/themeProviderWrapper'
import TimeoutSnackbar from 'PORTAL/components/timeoutSnackbar'
import LogoPlainBackgroundContainer from 'PORTAL/components/wrappers/logoPlainBackgroundContainer'
import AuthContextProvider from 'PORTAL/contexts/auth'
import { AdminControlsProvider } from 'PORTAL/contexts/useAdminControls'
import AdminSettings from 'PORTAL/pages/admin/adminSettings'
import ParticipantsAdminView from 'PORTAL/pages/admin/participantsAdminView'
import CoordinatorsAdminView from 'PORTAL/pages/admin/coordinatorsAdminView'
import Consents from 'PORTAL/pages/consents'
import Dashboard from 'PORTAL/pages/dashboard'
import ForgotPassword from 'PORTAL/pages/forgotPassword'
import JoinAStudy from 'PORTAL/pages/joinAStudy'
import Landing from 'PORTAL/pages/landing'
import Login from 'PORTAL/pages/login'
import LogoScreen from 'PORTAL/pages/logoScreen'
import Modules from 'PORTAL/pages/modules'
import NavDrawer from 'PORTAL/pages/navDrawer'
import PrivacyPolicy from 'PORTAL/pages/privacyPolicy'
import Profile from 'PORTAL/pages/profile'
import Register from 'PORTAL/pages/register'
import ResetPassword from 'PORTAL/pages/resetPassword'
import ResponsesAdminView from 'PORTAL/pages/admin/responsesAdminView'
import Study from 'PORTAL/pages/study'
import Studies from 'PORTAL/pages/studies'
import TermsOfUse from 'PORTAL/pages/termsOfUse'
import Verify from 'PORTAL/pages/verify'

import './globalStyles.css'

const ENVIRONMENT = process.env.ENVIRONMENT || 'development'

const App = () => {

  return (
    <AuthContextProvider>
      <AdminControlsProvider>
        <ThemeProviderWrapper>
          <MaintenanceBanner />
          <div className='app-box' aria-live='assertive'>
            <IdleDialog />
            <TimeoutSnackbar />

            <Routes>
            <Route element={<ProtectedRoutes />}>
            <Route element={<NavDrawer />}>
              <Route path='/home' element={<Dashboard />} />
              <Route path='/settings' element={<Profile />} />
              <Route path='/consents' element={<Consents />} />
              <Route path='/responses' element={<Modules />} />
              <Route element={<AdminCoordinatorProtectedRoutes/>}>
                <Route path='/invitations' element={<Invitations/>}/>
                <Route path='/participant-data' element={<ResponsesAdminView/>}/>
              </Route>
              <Route element={<AdminProtectedRoutes/>}>
                <Route path='/admin-settings' element={<AdminSettings />} />
                <Route path='/coordinators' element={<CoordinatorsAdminView/>}/>
                <Route path='/participants' element={<ParticipantsAdminView/>}/>
                <Route path='/admin-responses' element={<ResponsesAdminView/>}/>
              </Route>
              {ENVIRONMENT === 'development' &&
                <>
                  <Route path='/studies' element={<Studies />} />
                  <Route path='/study/:studyId' element={<Study />} />
                </>
              }
            </Route>
          </Route>

              <Route element={<PublicRoutes />}>
                <Route path='/' element={<Landing />} />
                <Route element={<LogoScreen />}>
                  <Route path='/login/:studyLinkId?' element={<Login />} />
                  <Route path='/register/:studyLinkId?' element={<Register />} />
                  <Route path='/verify' element={<Verify />} />
                  <Route path='/forgot-password' element={<ForgotPassword />} />
                  <Route path='/reset-password' element={<ResetPassword />} />
                  <Route path='/join/:studyLinkId' element={<JoinAStudy />} />
                  <Route path='*' element={<Navigate to='/' replace={true} />} />
                </Route>
                <Route element={<LogoPlainBackgroundContainer />}>
                  <Route path='/terms' element={<TermsOfUse />} />
                  <Route path='/privacy' element={<PrivacyPolicy />} />
                </Route>
              </Route>

            </Routes>
          </div>
        </ThemeProviderWrapper>
      </AdminControlsProvider>
    </AuthContextProvider>
  )
}

export default App
