import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'


const Notification = ({ message, style }) => {
  if(message === null) {
    return null
  }
  return(
    <div style={style} className='basic'>
      {message}
    </div>
  )
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [newBlog, setNewBlog] = useState({ author: '', title: '', url: '' })
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState(null)
  const [messageStyle, setMessageStyle] = useState(null)


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
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setMessageStyle({ color: 'red' })
      setMessage('wrong credentials')
      setTimeout(() => {
        setMessageStyle(null)
        setMessage(null)
      }, 3000)
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
        name='username'
        onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
        type='password'
        value={password}
        name='password'
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
    </div>
  )

  const addBlog = async (event) => {
    event.preventDefault()
    const blogObject = {
      author: newBlog.author,
      title: newBlog.title,
      url: newBlog.url
    }

    const addedBlog = await blogService.create(blogObject)
    setBlogs(blogs.concat(addedBlog))
    setNewBlog({ author: '', title: '', url: '' })

    setMessageStyle({ color: 'green' })
    setMessage(`a new blog ${newBlog.title} by ${newBlog.author} added`)
    setTimeout(() => {
      setMessageStyle(null)
      setMessage(null)
    }, 3000)

  }

  const handleBlogChange = (event) => {
    const { name, value } = event.target
    setNewBlog(values => ({...values, [name]: value}))
  }

  const blogForm = () => (
    <form onSubmit={addBlog}>
      <h2>Create new</h2>
      <div>
        Author:
        <input
          value={newBlog.author}
          name='author'
          onChange={handleBlogChange}
          placeholder='Author'
      />
      </div>
      <div>
        Title:
        <input
          value={newBlog.title}
          name='title'
          onChange={handleBlogChange}
          placeholder='Title'
      />
      </div>
      <div>
        Url:
        <input
          value={newBlog.url}
          name='url'
          onChange={handleBlogChange}
          placeholder='URL'
      />
      </div>
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
      <Notification style={messageStyle} message={message}/>
      {!user && loginForm()}
      {user && loggedInUser()}
      {user && blogForm()}
      {blogsToShow.map(blog => (
        <Blog key={blog.id} blog={blog}/>
      ))}
      
      
    </div>
  )
}

export default App