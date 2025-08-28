const BlogForm = ({
    handleSubmit,
    handleFieldChange,
    author,
    title,
    url
}) => {
    return (
        <div>
            <form onSubmit={handleSubmit}>
            <h2>Create new</h2>
            <div>
                Author:
                <input
                value={author}
                name='author'
                onChange={handleFieldChange}
                placeholder='Author'
            />
            </div>
            <div>
                Title:
                <input
                value={title}
                name='title'
                onChange={handleFieldChange}
                placeholder='Title'
            />
            </div>
            <div>
                Url:
                <input
                value={url}
                name='url'
                onChange={handleFieldChange}
                placeholder='URL'
            />
            </div>
            <button type='submit'>Save</button>
            </form>
        </div>
    )
}

export default BlogForm