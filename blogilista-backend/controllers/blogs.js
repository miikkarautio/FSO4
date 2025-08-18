const blogsRouter  = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog
      .find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const body = request.body
  const user = request.user //tulee userExtractorista

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


blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  const user = request.user //tulee userExtractorista
  
  let blog
  try {
    blog = await Blog.findById(request.params.id)
  } catch (exception) {
    return next(exception)
  } //Haetaan poistettava blogi, joka sisältää käyttäjä ID

  if(!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if(!blog.user || blog.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'Only the owner of the blog can delete it' })
  }

  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
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