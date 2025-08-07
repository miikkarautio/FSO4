const Blog = require('../models/blog')
const User = require('../models/user')

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

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON()) 
}

module.exports = {
    initialBlogs,
    blogsInDb,
    usersInDb
}