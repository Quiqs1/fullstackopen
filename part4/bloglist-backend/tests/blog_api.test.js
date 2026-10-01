const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
    { title: 'React patterns', author: 'Michael Chan', url: 'https://reactpatterns.com/', likes: 7 },
    { title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html', likes: 5 }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    for (let blog of initialBlogs) {
        let blogObject = new Blog(blog)
        await blogObject.save()
    }
})

test('blogs are returned as json and have the correct amount', async () => {
    const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, initialBlogs.length)
})

test('unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    const firstBlog = response.body[0]

    assert('id' in firstBlog)
    assert(!('_id' in firstBlog))
})

test('a valid blog can be added', async () => {
    const newBlog = {
        title: 'Async/await simplifies testing',
        author: 'Full Stack Open',
        url: 'https://fullstackopen.com',
        likes: 10
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length + 1)

    const titles = response.body.map(r => r.title)
    assert(titles.includes('Async/await simplifies testing'))
})

test('if likes property is missing, it defaults to 0', async () => {
    const newBlog = {
        title: 'Blog without likes',
        author: 'No Likes Author',
        url: 'http://nolikes.com'
    }

    const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

    assert.strictEqual(response.body.likes, 0)
})

test('if title is missing, responds with 400 Bad Request', async () => {
    const newBlog = { author: 'No title', url: 'http://notitle.com' }
    await api.post('/api/blogs').send(newBlog).expect(400)
})

test('if url is missing, responds with 400 Bad Request', async () => {
    const newBlog = { title: 'No url', author: 'No url author' }
    await api.post('/api/blogs').send(newBlog).expect(400)
})

test('succeeds with status code 204 if id is valid when deleting a blog', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToDelete = blogsAtStart.body[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

    const blogsAtEnd = await api.get('/api/blogs')

    assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length - 1)

    const titles = blogsAtEnd.body.map(r => r.title)
    assert(!titles.includes(blogToDelete.title))
})

test('succeeds in updating the likes of a blog', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToUpdate = blogsAtStart.body[0]

    const updatedBlogData = {
        ...blogToUpdate,
        likes: blogToUpdate.likes + 10 // Le sumamos 10 likes
    }

    const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlogData)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)
})

after(async () => {
    await mongoose.connection.close()
})