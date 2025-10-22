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

    })

})