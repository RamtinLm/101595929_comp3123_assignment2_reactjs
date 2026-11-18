import api from "./axiosClient.js"

// POST /api/v1/user/signup  { username, email, password }
export const signupUser = (data) => api.post("/user/signup", data)

// POST /api/v1/user/login   { username or email, password }
export const loginUser = (data) => api.post("/user/login", data)
