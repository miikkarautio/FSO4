import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [newBlog, setNewBlog] = useState({ author: '', title: '', url: '' })

  const addBlog = (event) => {
    event.preventDefault()
    createBlog({
      author: newBlog.author,
      title: newBlog.title,
      url: newBlog.url
    })

    setNewBlog({ author: '', title: '', url: '' })

  }

  const handleBlogChange = (event) => {
    const { name, value } = event.target
    setNewBlog(values => ({ ...values, [name]: value }))
  }


  return (
    <div>
      <form onSubmit={addBlog}>
        <h2>Create new</h2>
        <div>
          <label>
            Author:
            <input
              value={newBlog.author}
              name='author'
              onChange={handleBlogChange}
              placeholder='Author'
            />
          </label>
        </div>
        <div>
          <label>
            Title:
            <input
              value={newBlog.title}
              name='title'
              onChange={handleBlogChange}
              placeholder='Title'
            />
          </label>
        </div>
        <div>
          <label>
            Url:
            <input
              value={newBlog.url}
              name='url'
              onChange={handleBlogChange}
              placeholder='URL'
            />
          </label>
        </div>
        <button type='submit'>Save</button>
      </form>
    </div>
  )
}

export default BlogForm



