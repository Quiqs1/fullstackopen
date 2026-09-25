const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return null

    let favorite = blogs[0]
    for (let i = 1; i < blogs.length; i++) {
        if (blogs[i].likes > favorite.likes) {
            favorite = blogs[i]
        }
    }

    return {
        title: favorite.title,
        author: favorite.author,
        likes: favorite.likes
    }
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return null

    const authorCounts = {}
    blogs.forEach(blog => {
        authorCounts[blog.author] = (authorCounts[blog.author] || 0) + 1
    })

    let topAuthor = ''
    let maxBlogs = 0

    for (const author in authorCounts) {
        if (authorCounts[author] > maxBlogs) {
            topAuthor = author
            maxBlogs = authorCounts[author]
        }
    }

    return {
        author: topAuthor,
        blogs: maxBlogs
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) return null

    const authorLikes = {}
    blogs.forEach(blog => {
        authorLikes[blog.author] = (authorLikes[blog.author] || 0) + blog.likes
    })

    let topAuthor = ''
    let maxLikes = 0

    for (const author in authorLikes) {
        if (authorLikes[author] > maxLikes) {
            topAuthor = author
            maxLikes = authorLikes[author]
        }
    }

    return {
        author: topAuthor,
        likes: maxLikes
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}