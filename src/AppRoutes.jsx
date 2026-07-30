import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy } from 'react'
import PropTypes from 'prop-types'
import ErrorBoundary from './components/ui/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'

const Login = lazy(() => import('./pages/Login'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

const PublicLayout = ({ children }) => <ErrorBoundary>{children}</ErrorBoundary>

PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

/** The public website exposes only the blog feed and individual blog articles. */
const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      <Route path="/blog" element={<Navigate to="/" replace />} />
      <Route
        path="/posts/:pageSlug/:postSlug"
        element={
          <PublicLayout>
            <PostDetail />
          </PublicLayout>
        }
      />
      {/* Keep old article URLs working without exposing public CMS page views. */}
      <Route
        path="/pages/:pageSlug/posts/:postSlug"
        element={
          <PublicLayout>
            <PostDetail />
          </PublicLayout>
        }
      />
      <Route path="/pages/:slug" element={<Navigate to="/" replace />} />
      <Route path="/tutorials/:id" element={<Navigate to="/" replace />} />
      <Route
        path="/login"
        element={
          <ErrorBoundary>
            <Login />
          </ErrorBoundary>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <AdminDashboard />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
