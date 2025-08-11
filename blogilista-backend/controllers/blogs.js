const blogsRouter  = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/api/blogs', async (request, response, next) => {
  try {
    const blogs = await Blog
      .find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
  } catch (exception) {
    next(exception)
  }
})

/* const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
} */

blogsRouter.post('/api/blogs', async (request, response, next) => {
  const body = request.body
  const token = request.token
  //Jos ei ole tokenia
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  //Tarkisteaan token
  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  } catch (error) {
    return response.status(401).json({ error: 'token invalid' })
  }

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id) //Hae käyttäjä

  if (!user) {
    return response.status(401).json({ error: 'user not found' })
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
  const token = request.token //Haetaan poistajan token

  if(!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  } catch (error) {
    return response.status(401).json({ error: 'token invalid' })
  }

  let blog
  try {
    blog = await Blog.findById(request.params.id)
  } catch (exception) {
    return next(exception)
  } //Haetaan poistettava blogi, joka sisältää käyttäjä ID

  if(!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if(!blog.user || blog.user.toString() !== decodedToken.id) {
    return response.status(401).json({ error: 'Only the owner of the blog can delete it' })
  }

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