import axios from "axios"

export const http = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // 10 seconds timeout
})