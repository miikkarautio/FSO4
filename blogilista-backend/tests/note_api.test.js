const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const { before } = require('lodash')

const api = supertest(app)

const initialBlogs = [
    {
        title: "PunainenViiva",
        author: "Ilmari Kianto",
        url: "https://fi.wikipedia.org/wiki/Punainen_viiva_(romaani)",
        likes: 200,
 
    },
    {
        title: "Tulen ja jään laulu",
        author: "George R. R. Martin",
        url: "https://fi.wikipedia.org/wiki/Tulen_ja_j%C3%A4%C3%A4n_laulu",
        likes: 100,

    }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test('Right amount of JSON blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, 2) 
})

test('The blogs _id is refactored correctly as "id"', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => {
        assert.ok(blog.id) //Tarkistetaan, että "id" löydetään blogeja
        assert.strictEqual(blog._id, undefined) //Tarkistetaan, että _id ei löydy yhtään blogia
    })
})

after(async () => {
  await mongoose.connection.close()
})