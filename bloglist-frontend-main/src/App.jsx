import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'



const Notification = ({ message, style }) => {
  if (message === null) {
    return null
  }
  return (
    <div style={style} className='basic'>
      {message}
    </div>
  )
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState(null)
  const [messageStyle, setMessageStyle] = useState(null)


  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
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
        console.log(exception)
      }, 3000)
    }

  }

  const loginForm = () => (
    <Togglable buttonLabel='login'>
      <LoginForm
        username={username}
        password={password}
        handleUsernameChange={({ target }) => setUsername(target.value)}
        handlePasswordChange={({ target }) => setPassword(target.value)}
        handleSubmit={handleLogin}
      />
    </Togglable>
  )

  const loggedInUser = () => (
    <div>
      <h2>Blogs</h2>
      <p>{user.username} is logged in <button onClick={handleLogout}>Logout</button></p>
    </div>
  )

  const addBlog = async (blogObject) => {

    const addedBlog = await blogService.create(blogObject)
    setBlogs(blogs.concat(addedBlog))

    setMessageStyle({ color: 'green' })
    setMessage(`a new blog ${blogObject.title} by ${blogObject.author} added`)
    setTimeout(() => {
      setMessageStyle(null)
      setMessage(null)
    }, 3000)

  }

  const blogForm = () => (
    <Togglable buttonLabel='Add blog' >
      <BlogForm createBlog={addBlog} />
    </Togglable>

  )

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  const addLike = async (id) => {
    const blog = blogs.find(n => n.id === id)
    const changedBlog = { ...blog, likes: blog.likes + 1 }

    try {
      const updatedBlog = await blogService.update(id, changedBlog)
      setBlogs(blogs.map(blog => blog.id !== id ? blog : updatedBlog))
    } catch (exception) {
      console.log(exception)
    }

  }

  const handleDelete = async (id) => {

    try {
      window.confirm('Delete blog?')
      await blogService.deleteBlog(id)
      setBlogs(blogs.filter(blog => blog.id !== id))
    } catch (exception) {
      console.log(exception)
    }

  }

  const toggleBlogInfo = () => {

    const blogsToShow = user ? blogs : [] //Jos käyttäjä on, näytetään blogit muuten tyhjä lista

    const sortedBlogs = blogsToShow.toSorted((a, b) => b.likes - a.likes)

    return (
      sortedBlogs.map(blog => (
        <Blog
          key={blog.id}
          blog={blog}
          user={user}
          addLike={() => addLike(blog.id)}
          deleteBlog={blog.user?.username === user.username ? () => handleDelete(blog.id) : undefined}
        />
      ))

    )
  }


  return (
    <div>
      <Notification style={messageStyle} message={message} />
      {!user && loginForm()}
      {user && loggedInUser()}
      {user && blogForm()}
      {toggleBlogInfo()}

    </div>
  )
}

export default App