const blogsRouter  = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/api/blogs', async (request, response, next) => {
  try {
    const blogs = await Blog
      .find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.post('/api/blogs', async (request, response, next) => {
  const body = request.body

  const user = await User.findOne() //Hakee ensimmäisen käyttäjän

  if(!user) {
    return response.status(400).json({ error: 'userId missing or not valid' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/api/blogs/:id', async (request, response, next) => {

  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }

})

blogsRouter.put('/api/blogs/:id', async (request, response, next) => {
  try {
    const { likes } = request.body

    const blogToChange = await Blog.findById(request.params.id)

    if(!blogToChange){
      return response.status(404).end()
    }
    
    blogToChange.likes = likes
    
    const updatedBlog = await blogToChange.save()
    response.json(updatedBlog)
  } catch (exception) {
    next(exception)
  }

})

module.exports = blogsRouter