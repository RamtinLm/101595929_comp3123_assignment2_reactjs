import { Navigate, Route, Routes } from "react-router-dom"
import Layout from "./components/Layout.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import PublicOnlyRoute from "./components/PublicOnlyRoute.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import SignupPage from "./pages/SignupPage.jsx"
import EmployeeListPage from "./pages/EmployeeListPage.jsx"
import AddEmployeePage from "./pages/AddEmployeePage.jsx"
import EmployeeDetailsPage from "./pages/EmployeeDetailsPage.jsx"
import EditEmployeePage from "./pages/EditEmployeePage.jsx"
import NotFoundPage from "./pages/NotFoundPage.jsx"

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/employees" replace />} />

                {/* Only for logged out users, logged in users go to /employees */}
                <Route element={<PublicOnlyRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                </Route>

                {/* Only for logged in users, others go to /login */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/employees" element={<EmployeeListPage />} />
                    <Route path="/employees/add" element={<AddEmployeePage />} />
                    <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
                    <Route path="/employees/:id/edit" element={<EditEmployeePage />} />
                </Route>

                {/* Any other URL */}
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    )
}
