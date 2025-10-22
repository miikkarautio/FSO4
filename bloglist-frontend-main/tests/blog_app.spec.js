import { test, expect } from '@playwright/test'

test.describe('Blog app', () => {
    test.beforeEach(async ({ page, request }) => {
        await request.post('http://localhost:3003/api/testing/reset')
        await request.post('http://localhost:3003/api/users', {
            data: {
                name: 'Matti Luukkainen',
                username: 'mluukkai',
                password: 'salainen'
            }
        })

        await page.goto('http://localhost:5173')
    })

    test('Login form is shown', async ({ page }) => {
        const loginHeading = await page.getByRole('heading', { name: 'Login' })
        await expect(loginHeading).toBeVisible()

        const loginButton = await page.getByRole('button', { name: 'login' })
        await expect(loginButton).toBeVisible()
    })

    test.describe('Login', () => {
        test('succeeds with correct credentials', async ({ page }) => {
            await page.getByLabel('username').fill('mluukkai')
            await page.getByLabel('password').fill('salainen')
            await page.getByRole('button', { name: 'login' }).click()
            await expect(page.getByText('mluukkai is logged in')).toBeVisible()
        })

        test('fails with wrong credentials', async ({ page }) => {
            await page.getByLabel('username').fill('mluukkai')
            await page.getByLabel('password').fill('mluukkai')
            await page.getByRole('button', { name: 'login' }).click()
            await expect(page.getByText('wrong credentials')).toBeVisible()
        })
    })

    test.describe('When logged in', () => {
        test.beforeEach(async ({ page }) => {
            await page.getByLabel('username').fill('mluukkai')
            await page.getByLabel('password').fill('salainen')
            await page.getByRole('button', { name: 'login' }).click()
            await expect(page.getByText('mluukkai is logged in')).toBeVisible()
        })

        test('a new blog can be created', async ({ page }) => {
            await page.getByRole('button', { name: 'Add blog' }).click()
            await page.getByLabel('author').fill('author')
            await page.getByLabel('title').fill('title')
            await page.getByLabel('url').fill('url')
            await page.getByRole('button', { name: 'Save' }).click()
            await expect(page.getByText('a new blog title by author added')).toBeVisible()
        })

        test('a new blog can be liked', async ({ page }) => {
            await page.getByRole('button', { name: 'Add blog' }).click()
            await page.getByLabel('author').fill('author')
            await page.getByLabel('title').fill('title')
            await page.getByLabel('url').fill('url')
            await page.getByRole('button', { name: 'Save' }).click()
            await page.getByRole('button', { name: 'View' }).click()
            await page.getByRole('button', { name: 'Like' }).click()
            await expect(page.getByText('Likes 1')).toBeVisible()
        })

        test('user can delete a blog they created', async ({ page }) => {
            await page.getByRole('button', { name: 'Add blog' }).click()
            await page.getByLabel('author').fill('Test Author')
            await page.getByLabel('title').fill('Test Blog')
            await page.getByLabel('url').fill('http://test.com')
            await page.getByRole('button', { name: 'Save' }).click()
            await expect(page.getByText('a new blog Test Blog by Test Author added')).toBeVisible()

            await page.getByRole('button', { name: 'View' }).click()

            page.on('dialog', async dialog => {
                expect(dialog.message()).toContain("Delete blog Test Blog by Test Author?")
                await dialog.accept()
            })

            await page.getByRole('button', { name: 'Delete' }).click()
            await expect(page.getByText('Test Blog by Test Author has been deleted')).toBeVisible()
        })

        test('only the creator can see the delete button', async ({ page, request }) => {
            await page.getByRole('button', { name: 'Add blog' }).click()
            await page.getByLabel('author').fill('Test Author')
            await page.getByLabel('title').fill('Test Blog')
            await page.getByLabel('url').fill('http://test.com')
            await page.getByRole('button', { name: 'Save' }).click()
            await expect(page.getByText('a new blog Test Blog by Test Author added')).toBeVisible()

            await page.getByRole('button', { name: 'View' }).click()
            await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible()
            await page.getByRole('button', { name: 'Hide' }).click()

            await page.getByRole('button', { name: 'Logout' }).click()

            await request.post('http://localhost:3003/api/users', {
                data: {
                    name: 'Second User',
                    username: 'seconduser',
                    password: 'password'
                }
            })

            await page.getByLabel('username').fill('seconduser')
            await page.getByLabel('password').fill('password')
            await page.getByRole('button', { name: 'login' }).click()
            await expect(page.getByText('seconduser is logged in')).toBeVisible()

            await page.getByRole('button', { name: 'View' }).click()
            await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible()
        })

        test('blogs are sorted by likes in descending order', async ({ page }) => {

            await page.getByRole('button', { name: 'Add blog' }).click()
            await page.getByLabel('title').fill('First Blog')
            await page.getByLabel('author').fill('Author 1')
            await page.getByLabel('url').fill('http://first.com')
            await page.getByRole('button', { name: 'Save' }).click()
            await expect(page.getByText('a new blog First Blog by Author 1 added')).toBeVisible()


            await page.getByLabel('title').fill('Second Blog')
            await page.getByLabel('author').fill('Author 2')
            await page.getByLabel('url').fill('http://second.com')
            await page.getByRole('button', { name: 'Save' }).click()
            await expect(page.getByText('a new blog Second Blog by Author 2 added')).toBeVisible()

            const secondBlog = await page.getByText('Second Blog Author 2')
            await secondBlog.getByRole('button', { name: 'View' }).click()
            await page.getByRole('button', { name: 'Like' }).click()
            await expect(page.getByText('Likes 1')).toBeVisible()
            await page.getByRole('button', { name: 'Like' }).click()
            await expect(page.getByText('Likes 2')).toBeVisible()

            const blogElements = await page.locator('div').filter({ hasText: /View|Hide/ }).all()
            await expect(blogElements[0]).toContainText('Second Blog')
            await expect(blogElements[1]).toContainText('First Blog')
        })

    })

})