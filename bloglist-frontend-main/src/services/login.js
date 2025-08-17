import axios from 'axios'
const baseUrl = '/api/login' //Saattaa olla vain "/"

const login = async credentials => {
    const response = await axios.post(baseUrl, credentials)
    return response.data
}

export default { login }