const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const helper = require('./test_helper')


const api = supertest(app)


beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(helper.initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(helper.initialBlogs[1])
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

test('Can add new blogs with POST', async () => {
    const newBlog = {
        title: "Uusi Blogi",
        author: "Miikka",
        url: "HienoURL",
        likes: 10,
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb() //Tarkistetaan, että blogien määrä kasvaa yhdellä
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map(n => n.title) //Tarkistetaan blogin sisältö
    assert(contents.includes('Uusi Blogi'))
})

test('if "likes" is set to empty default it to 0', async () => {

    const blogWithoutLikes = { //Luodaan uusi blogi, ilman "likes" arvoa
        title: "Ilman tykkäyksiä",
        author: "Miikka",
        url: "Hienompi URL",
    }

    await api //Postataan uusi blogi
        .post('/api/blogs')
        .send(blogWithoutLikes)
        .expect(201)

    const response = await api.get('/api/blogs')

    const addedBlog = response.body.find(blog => blog.title === 'Ilman tykkäyksiä') //Etsitään tämä spesifi blogi

    assert.strictEqual(typeof addedBlog.likes, 'number') //Tarkistaa onko kyseessä numero
    assert.strictEqual(addedBlog.likes, 0) //Tarkistaa onko asetettu oletusarvo 0
})

test('If new blog doesnt include title or url request is answered with 400', async () => {

    const wrongfulBlog ={
        author: 'Rautio',
        likes: 200,
    }

    await api
        .post('/api/blogs')
        .send(wrongfulBlog)
        .expect(400)

})


after(async () => {
  await mongoose.connection.close()
})