import { render, screen } from '@testing-library/react'
import Blog from './Blog'
import { expect } from 'vitest'


test('Check if blog title & author is visible', () => {
    const blog = {
        title: "Uusi",
        author: "Testimyös",
        url: "Url-testi",
        likes: 1000
    }

    render(<Blog blog={blog} />)

    screen.getByText('Uusi')
    screen.getByText('Testimyös')
    const url = screen.queryByText("Url-testi") 
    const likes = screen.queryByText(/Likes 1000/) 

    expect(url).not.toBeVisible()
    expect(likes).not.toBeVisible()

    const viewButton = screen.getByText('View')
    expect(viewButton).toBeVisible()

})


