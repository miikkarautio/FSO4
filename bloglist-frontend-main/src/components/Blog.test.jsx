import { render, screen } from '@testing-library/react'
import Blog from './Blog'
import { beforeEach, describe, expect } from 'vitest'
import Toggalable from './Togglable'
import userEvent from '@testing-library/user-event'


test('Check if blog title & author is visible', () => {
    const blog = {
        title: "Uusi",
        author: "Testimyös",
        url: "Url-testi",
        likes: 1000,
        user: { username: "testuser" }
    }

    const user = { username: "testuser" }

    render(<Blog blog={blog} user={user} />)

    screen.getByText('Uusi')
    screen.getByText('Testimyös')
    const url = screen.queryByText("Url-testi")
    const likes = screen.queryByText(/Likes 1000/)

    expect(url).not.toBeVisible()
    expect(likes).not.toBeVisible()

    const viewButton = screen.getByText('View')
    expect(viewButton).toBeVisible()
})


describe('<Togglable />', () => {
    beforeEach(() => {
        render(
            <Toggalable buttonLabel="View...">
                <div>togglable content</div>
            </Toggalable>
        )
    })

    test('togglable content is shown when button is clicked', async () => {
        const userEventSetup = userEvent.setup()
        const button = screen.getByText('View...')
        await userEventSetup.click(button)

        const element = screen.getByText('togglable content')
        expect(element).toBeVisible()
    })
})

test('Check if url, likes and user is shown when toggled', async () => {
    const blog = {
        title: "Uusi",
        author: "Testimyös",
        url: "Url-testi",
        likes: 1000,
        user: { username: "testuser" }
    }

    const user = { username: "testuser" }

    render(<Blog blog={blog} user={user} />)

    const userEventSetup = userEvent.setup()
    const button = screen.getByText('View')
    await userEventSetup.click(button)

    const url = screen.getByText('Url-testi')
    const likes = screen.getByText(/Likes 1000/)
    const username = screen.getByText('testuser')

    expect(url).toBeVisible()
    expect(likes).toBeVisible()
    expect(username).toBeVisible()
})

test('Check if like is pressed two times both are registered', async () => {
    const blog = {
        title: "Uusi",
        author: "Testimyös",
        url: "Url-testi",
        likes: 1000,
        user: { username: "testuser" }
    }

    const user = { username: "testuser" }

    const mockHandler = vi.fn()

    render(
        <Blog blog={blog} user={user} addLike={mockHandler}/>
    )

    const userEventSetup = userEvent.setup()
    const button = screen.getByText('Like')
    await userEventSetup.click(button) // Press button two times
    await userEventSetup.click(button)


    expect(mockHandler.mock.calls).toHaveLength(2) //Check if two presses

})


