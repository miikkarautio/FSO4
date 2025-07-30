const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
    var total = 0

    blogs.forEach(blog => {
        total = total + blog.likes 
    });

    return total
}

const favoriteBlog = (blogs) => {
    var bestBlog = null

    for(i = 0; i < blogs.length; i++){
        const blog = blogs[i]
        if(!bestBlog || blog.likes > bestBlog.likes){
            bestBlog = blog
        }
    }

    return bestBlog

}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}