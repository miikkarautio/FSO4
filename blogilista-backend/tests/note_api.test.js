const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')


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

test('blog is deleted succesfully', async () =>  {

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204) 

    const blogsAtEnd = await helper.blogsInDb()

    const contents = blogsAtEnd.map(n => n.title)
    assert(!contents.includes(blogToDelete.title)) //Tarkistetaan, että poistetun blogin title ei löydy listalta

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1) //Tarkistetaan, että alkuperäisestä blogi listasta puuttuu blogi

})

test('blog likes can be modified succesfully', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToModify = blogsAtStart[0]

    const modifiedBlog = {
        title: blogToModify.title,
        author: blogToModify.author,
        url: blogToModify.url,
        likes: 20000
    }

    await api
        .put(`/api/blogs/${blogToModify.id}`)
        .send(modifiedBlog)
        .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlog = blogsAtEnd.find(blog => blog.id === blogToModify.id)//Katsotaan, että kyseessä on sama blogi

    
    assert.strictEqual(updatedBlog.likes, 20000) 
})

describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })
        
        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'Miikka',
            name: 'Mikka Rautio',
            password: 'tosisalainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

        const username = usersAtEnd.map(u => u.username)
        assert(username.includes(newUser.username))
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen' 
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('expected `username` to be unique'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

})


after(async () => {
  await mongoose.connection.close()
})