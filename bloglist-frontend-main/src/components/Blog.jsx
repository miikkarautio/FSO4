import { useState } from 'react'

const Blog = ({ blog, user, addLike, deleteBlog }) => {

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  return(
    <div style={blogStyle}>
      <div style={hideWhenVisible}>
        {blog.title} { blog.author}
        <button onClick={toggleVisibility}>View</button>
      </div>
      <div style={showWhenVisible}>
        <p>{blog.title}</p>
        <p>{blog.author}</p>
        <p>Likes {blog.likes} <button onClick={addLike}>Like</button></p>
        <p>{blog.url}</p>
        <p>{user.username}</p>
        <button onClick={toggleVisibility}>Hide</button>
        {deleteBlog && <button onClick={deleteBlog}>Delete</button>}
      </div>
    </div>

  )


}

export default Blog