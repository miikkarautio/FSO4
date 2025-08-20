import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  

  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
  
    
    try {
      const user = await loginService.login({
        username, password
      })
    
    window.localStorage.setItem(
      'loggedBlogappUser', JSON.stringify(user)
    )
/*       blogService.setToken(user.token) */
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
/*       setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000) */
    }

  }


  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <h2>log in to application</h2>
      <div>
        username
        <input
        type='text'
        value={username}
        name='Username'
        onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
        type='password'
        value={password}
        name='Password'
        onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type='submit'>Login</button>
    </form>
  )

  const loggedInUser = () => (
    <div>
      <h2>Blogs</h2>
      <p>{user.username} is logged in <button onClick={handleLogout}>Logout</button></p>
      {blogsToShow.map(blog => (
        <Blog key={blog.id} blog={blog}/>
      ))}
    </div>
  )

  const blogForm = () => (
    <form onSubmit={addBlog}>
      <input
      value={newBlog}
      onChange={handleBlogChange}
      />
      <button type='submit'>Save</button>
    </form>
  )

  const blogsToShow = user ? blogs : [] //Jos käyttäjä on, näytetään blogit muuten tyhjä lista

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }


  return (
    <div>
      {!user && loginForm()}
      {user && loggedInUser()}
    </div>
  )
}

export default App