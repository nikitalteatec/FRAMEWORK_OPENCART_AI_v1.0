import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import * as path from 'path';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';

const ajv = new Ajv({ allErrors: true, strict: false });

function getProductPayload(overrides: Record<string, any> = {}) {
    return {
        title: 'Playwright Product',
        price: 99.99,
        description: 'Product created by the Playwright API test suite.',
        image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
        category: 'electronics',
        ...overrides,
    };
}

function getUserPayload(overrides: Record<string, any> = {}) {
    return {
        email: 'playwright@example.com',
        username: 'playwright_user',
        password: 'securePass123',
        name: {
            firstname: 'Playwright',
            lastname: 'Tester',
        },
        address: {
            city: 'Austin',
            street: 'Test Street',
            number: 123,
            zipcode: '78701',
            geolocation: {
                lat: '30.2672',
                long: '-97.7431',
            },
        },
        phone: '123-456-7890',
        ...overrides,
    };
}

function getCartPayload(overrides: Record<string, any> = {}) {
    return {
        userId: 1,
        products: [
            { productId: 1, quantity: 2 },
            { productId: 2, quantity: 1 },
        ],
        ...overrides,
    };
}

test.describe('FakeStore Auth API', () => {
    test('Successful login returns a token @master @sanity @regression @api', async ({ request }) => {
        const response = await request.post(`${Routes.BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: {
                username: 'mor_2314',
                password: '83r5^_',
            },
        });

        expect(response.status(), 'Login should return status 201').toBe(201);
        const body = await response.json();
        expect(body.token, 'Response should contain a token').toBeTruthy();
        expect(typeof body.token, 'Token should be a non-empty string').toBe('string');
        expect(body.token.length, 'Token should be non-empty').toBeGreaterThan(0);
    });

    test('Invalid login returns the expected authentication error @master @sanity @regression @api', async ({ request }) => {
        const response = await request.post(`${Routes.BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: {
                username: 'invalid-user',
                password: 'wrong-password',
            },
        });

        expect(response.status(), 'Invalid login should return status 401').toBe(401);
        const bodyText = await response.text();
        expect(bodyText, 'Response should include the login error message').toContain('username or password is incorrect');
    });
});

test.describe('FakeStore Products API', () => {
    test('Get all products returns a non-empty array @master @sanity @regression @api', async ({ request }) => {
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_ALL_PRODUCTS}`);

        expect(response.status(), 'Get all products should return status 200').toBe(200);
        const products = await response.json();
        expect(Array.isArray(products), 'Response should be an array').toBeTruthy();
        expect(products.length, 'Array should contain at least one product').toBeGreaterThan(0);
        const product = products[0];
        expect(product.id).toBeDefined();
        expect(product.title).toBeDefined();
        expect(product.price).toBeDefined();
        expect(product.category).toBeDefined();
        expect(product.image).toBeDefined();
    });

    test('Get product by ID returns the requested product @master @sanity @regression @api', async ({ request }) => {
        const productId = 1;
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_PRODUCT_BY_ID.replace('{id}', String(productId))}`);

        expect(response.status(), 'Get product by Id should return status 200').toBe(200);
        const product = await response.json();
        expect(product.id, 'Returned product id should match the requested id').toBe(productId);
        expect(product.title).toBeTruthy();
        expect(product.price).toBeTruthy();
        expect(product.category).toBeTruthy();
    });

    test('Get products with limit returns the requested count @master @sanity @regression @api', async ({ request }) => {
        const limit = 2;
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_PRODUCTS_WITH_LIMIT.replace('{limit}', String(limit))}`);

        expect(response.status(), 'Get products with limit should return status 200').toBe(200);
        const products = await response.json();
        expect(Array.isArray(products), 'Response should be an array').toBeTruthy();
        expect(products.length, 'Response length should match the requested limit').toBe(limit);
    });

    test('Sort products in ascending order @master @sanity @regression @api', async ({ request }) => {
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_PRODUCTS_SORTED.replace('{order}', 'asc')}`);

        expect(response.status(), 'Ascending sort request should return status 200').toBe(200);
        const products = await response.json();
        const ids = products.map((product: any) => product.id);
        expect(ids, 'Product ids should be in ascending order').toEqual([...ids].sort((a, b) => a - b));
    });

    test('Sort products in descending order @master @sanity @regression @api', async ({ request }) => {
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_PRODUCTS_SORTED.replace('{order}', 'desc')}`);

        expect(response.status(), 'Descending sort request should return status 200').toBe(200);
        const products = await response.json();
        const ids = products.map((product: any) => product.id);
        expect(ids, 'Product ids should be in descending order').toEqual([...ids].sort((a, b) => b - a));
    });

    test('Get all categories returns a non-empty category list @master @sanity @regression @api', async ({ request }) => {
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_ALL_CATEGORIES}`);

        expect(response.status(), 'Get all categories should return status 200').toBe(200);
        const categories = await response.json();
        expect(Array.isArray(categories), 'Response should be an array').toBeTruthy();
        expect(categories.length, 'Category list should not be empty').toBeGreaterThan(0);
    });

    test('Get products by category returns only the requested category @master @sanity @regression @api', async ({ request }) => {
        const category = 'electronics';
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_PRODUCTS_BY_CATEGORY.replace('{category}', category)}`);

        expect(response.status(), 'Get products by category should return status 200').toBe(200);
        const products = await response.json();
        expect(Array.isArray(products), 'Response should be an array').toBeTruthy();
        expect(products.length, 'Category response should not be empty').toBeGreaterThan(0);
        products.forEach((product: any) => {
            expect(product.category, `Product should belong to the ${category} category`).toBe(category);
        });
    });

    test('Create product returns a valid product object @master @sanity @regression @api', async ({ request }) => {
        const payload = getProductPayload();
        const response = await request.post(`${Routes.BASE_URL}${Routes.CREATE_PRODUCT}`, {
            data: payload,
        });

        expect(response.status(), 'Create product should return status 201').toBe(201);
        const product = await response.json();
        expect(product.id, 'Created product should include an id').toBeDefined();
        expect(product.title).toBe(payload.title);
        expect(product.price).toBe(payload.price);
        expect(product.description).toBe(payload.description);
        expect(product.category).toBe(payload.category);
        const validateProduct = ajv.compile(DataProvider.readJson(path.resolve(__dirname, '../../api/schemas/product_api_schema.json')));
        expect(validateProduct(product), `Created product should match the schema: ${JSON.stringify(validateProduct.errors)}`).toBeTruthy();
    });

    test('Update product reflects the requested changes @master @sanity @regression @api', async ({ request }) => {
        const productId = 1;
        const payload = getProductPayload({
            title: 'Updated Playwright Product',
            price: 199.99,
            description: 'Updated description via API request.',
            category: 'jewelery',
        });

        const response = await request.put(`${Routes.BASE_URL}${Routes.UPDATE_PRODUCT.replace('{id}', String(productId))}`, {
            data: payload,
        });

        expect(response.status(), 'Update product should return status 200').toBe(200);
        const product = await response.json();
        expect(product.id, 'Updated product id should match the requested id').toBe(productId);
        expect(product.title).toBe(payload.title);
        expect(product.price).toBe(payload.price);
        expect(product.description).toBe(payload.description);
        expect(product.category).toBe(payload.category);
    });

    test('Delete product returns a successful delete response @master @sanity @regression @api', async ({ request }) => {
        const productId = 1;
        const response = await request.delete(`${Routes.BASE_URL}${Routes.DELETE_PRODUCT.replace('{id}', String(productId))}`);

        expect(response.status(), 'Delete product should return status 200').toBe(200);
        const responseText = await response.text();
        expect(responseText === '' || responseText === '[]' || responseText === '{}' || responseText.includes(String(productId)), 'Delete response should be empty or include the deleted product id').toBeTruthy();
    });

    test('Product response matches the expected schema @master @sanity @regression @api', async ({ request }) => {
        const productId = 1;
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_PRODUCT_BY_ID.replace('{id}', String(productId))}`);

        expect(response.status(), 'Get product by id for schema validation should return status 200').toBe(200);
        const product = await response.json();
        const validateProduct = ajv.compile(DataProvider.readJson(path.resolve(__dirname, '../../api/schemas/product_api_schema.json')));
        expect(validateProduct(product), `Product schema should validate: ${JSON.stringify(validateProduct.errors)}`).toBeTruthy();
    });
});

test.describe('FakeStore Users API', () => {
    test('Get all users returns a non-empty array @master @sanity @regression @api', async ({ request }) => {
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_ALL_USERS}`);

        expect(response.status(), 'Get all users should return status 200').toBe(200);
        const users = await response.json();
        expect(Array.isArray(users), 'Response should be an array').toBeTruthy();
        expect(users.length, 'User list should not be empty').toBeGreaterThan(0);
    });

    test('Get user by ID returns the requested user @master @sanity @regression @api', async ({ request }) => {
        const userId = 1;
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_USER_BY_ID.replace('{id}', String(userId))}`);

        expect(response.status(), 'Get user by id should return status 200').toBe(200);
        const user = await response.json();
        expect(user.id, 'Returned user id should match the requested id').toBe(userId);
        expect(user.email).toBeTruthy();
        expect(user.username).toBeTruthy();
    });

    test('Get users with limit returns the requested count @master @sanity @regression @api', async ({ request }) => {
        const limit = 2;
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_USERS_WITH_LIMIT.replace('{limit}', String(limit))}`);

        expect(response.status(), 'Get users with limit should return status 200').toBe(200);
        const users = await response.json();
        expect(Array.isArray(users), 'Response should be an array').toBeTruthy();
        expect(users.length, 'User response should match the requested limit').toBe(limit);
    });

    test('Sort users in ascending order @master @sanity @regression @api', async ({ request }) => {
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_USERS_SORTED.replace('{order}', 'asc')}`);

        expect(response.status(), 'Ascending user sort should return status 200').toBe(200);
        const users = await response.json();
        const ids = users.map((user: any) => user.id);
        expect(ids, 'User ids should be sorted in ascending order').toEqual([...ids].sort((a, b) => a - b));
    });

    test('Sort users in descending order @master @sanity @regression @api', async ({ request }) => {
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_USERS_SORTED.replace('{order}', 'desc')}`);

        expect(response.status(), 'Descending user sort should return status 200').toBe(200);
        const users = await response.json();
        const ids = users.map((user: any) => user.id);
        expect(ids, 'User ids should be sorted in descending order').toEqual([...ids].sort((a, b) => b - a));
    });

    test('Create user returns a valid user ID @master @sanity @regression @api', async ({ request }) => {
        const payload = getUserPayload();
        const response = await request.post(`${Routes.BASE_URL}${Routes.CREATE_USER}`, {
            data: payload,
        });

        expect(response.status(), 'Create user should return status 201').toBe(201);
        const body = await response.json();
        expect(body.id, 'Returned user should include an id').toBeDefined();
        expect(body.id).toBeGreaterThan(0);
    });

    test('Update user reflects the request changes @master @sanity @regression @api', async ({ request }) => {
        const userId = 1;
        const updatedPayload = getUserPayload({
            username: 'updated_playwright_user',
            email: 'updated_playwright@example.com',
            phone: '555-987-6543',
            name: {
                firstname: 'Updated',
                lastname: 'User',
            },
        });

        const response = await request.put(`${Routes.BASE_URL}${Routes.UPDATE_USER.replace('{id}', String(userId))}`, {
            data: updatedPayload,
        });

        expect(response.status(), 'Update user should return status 200').toBe(200);
        const user = await response.json();
        expect(user.email).toBe(updatedPayload.email);
        expect(user.username).toBe(updatedPayload.username);
        expect(user.phone).toBe(updatedPayload.phone);
        expect(user.name.firstname).toBe(updatedPayload.name.firstname);
        expect(user.name.lastname).toBe(updatedPayload.name.lastname);
    });

    test('Delete user responds successfully @master @sanity @regression @api', async ({ request }) => {
        const userId = 1;
        const response = await request.delete(`${Routes.BASE_URL}${Routes.DELETE_USER.replace('{id}', String(userId))}`);

        expect(response.status(), 'Delete user should return status 200').toBe(200);
        const responseText = await response.text();
        expect(responseText.length, 'Delete response should be valid and contain a payload or be empty').toBeGreaterThanOrEqual(0);
    });

    test('User response matches the expected schema @master @sanity @regression @api', async ({ request }) => {
        const userId = 1;
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_USER_BY_ID.replace('{id}', String(userId))}`);

        expect(response.status(), 'Get user by id for schema validation should return status 200').toBe(200);
        const user = await response.json();
        const validateUser = ajv.compile(DataProvider.readJson(path.resolve(__dirname, '../../api/schemas/user_api_schema.json')));
        expect(validateUser(user), `User schema should validate: ${JSON.stringify(validateUser.errors)}`).toBeTruthy();
    });
});

test.describe('FakeStore Carts API', () => {
    test('Get all carts returns a non-empty array @master @sanity @regression @api', async ({ request }) => {
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_ALL_CARTS}`);

        expect(response.status(), 'Get all carts should return status 200').toBe(200);
        const carts = await response.json();
        expect(Array.isArray(carts), 'Response should be an array').toBeTruthy();
        expect(carts.length, 'Cart list should not be empty').toBeGreaterThan(0);
    });

    test('Get cart by ID returns the requested cart @master @sanity @regression @api', async ({ request }) => {
        const cartId = 1;
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_CART_BY_ID.replace('{id}', String(cartId))}`);

        expect(response.status(), 'Get cart by id should return status 200').toBe(200);
        const cart = await response.json();
        expect(cart.id, 'Returned cart id should match the requested id').toBe(cartId);
        expect(cart.userId).toBeDefined();
        expect(Array.isArray(cart.products), 'Products should be an array').toBeTruthy();
    });

    test('Get carts by date range returns carts within the requested period @master @sanity @regression @api', async ({ request }) => {
        const startDate = '2020-01-01';
        const endDate = '2020-12-31';
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_CARTS_BY_DATE_RANGE.replace('{startdate}', startDate).replace('{enddate}', endDate)}`);

        expect(response.status(), 'Get carts by date range should return status 200').toBe(200);
        const carts = await response.json();
        expect(Array.isArray(carts), 'Response should be an array').toBeTruthy();
        expect(carts.length, 'Cart range response should not be empty').toBeGreaterThan(0);
        carts.forEach((cart: any) => {
            expect(cart.date >= startDate, 'Returned cart date should not be before the start date').toBeTruthy();
            expect(cart.date <= endDate + 'T23:59:59.999Z', 'Returned cart date should not be after the end date').toBeTruthy();
        });
    });

    test('Get user cart returns carts belonging to the requested user @master @sanity @regression @api', async ({ request }) => {
        const userId = 2;
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_USER_CART.replace('{userId}', String(userId))}`);

        expect(response.status(), 'Get carts for user should return status 200').toBe(200);
        const carts = await response.json();
        expect(Array.isArray(carts), 'Response should be an array').toBeTruthy();
        carts.forEach((cart: any) => {
            expect(cart.userId, 'Every returned cart should belong to the requested user').toBe(userId);
        });
    });

    test('Get carts with limit returns the requested count @master @sanity @regression @api', async ({ request }) => {
        const limit = 2;
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_CARTS_WITH_LIMIT.replace('{limit}', String(limit))}`);

        expect(response.status(), 'Get carts with limit should return status 200').toBe(200);
        const carts = await response.json();
        expect(Array.isArray(carts), 'Response should be an array').toBeTruthy();
        expect(carts.length, 'Cart count should match the requested limit').toBe(limit);
    });

    test('Sort carts in ascending order @master @sanity @regression @api', async ({ request }) => {
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_CARTS_SORTED.replace('{order}', 'asc')}`);

        expect(response.status(), 'Ascending cart sort should return status 200').toBe(200);
        const carts = await response.json();
        const ids = carts.map((cart: any) => cart.id);
        expect(ids, 'Cart ids should be sorted in ascending order').toEqual([...ids].sort((a, b) => a - b));
    });

    test('Sort carts in descending order @master @sanity @regression @api', async ({ request }) => {
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_CARTS_SORTED.replace('{order}', 'desc')}`);

        expect(response.status(), 'Descending cart sort should return status 200').toBe(200);
        const carts = await response.json();
        const ids = carts.map((cart: any) => cart.id);
        expect(ids, 'Cart ids should be sorted in descending order').toEqual([...ids].sort((a, b) => b - a));
    });

    test('Create cart returns a valid cart object @master @sanity @regression @api', async ({ request }) => {
        const payload = getCartPayload();
        const response = await request.post(`${Routes.BASE_URL}${Routes.CREATE_CART}`, {
            data: payload,
        });

        expect(response.status(), 'Create cart should return status 201').toBe(201);
        const cart = await response.json();
        expect(cart.id, 'Created cart should include an id').toBeDefined();
        expect(cart.userId).toBe(payload.userId);
        expect(Array.isArray(cart.products), 'Products should be an array').toBeTruthy();
        expect(cart.products).toEqual(payload.products);
    });

    test('Update cart reflects the requested quantity change @master @sanity @regression @api', async ({ request }) => {
        const cartId = 1;
        const payload = getCartPayload({
            userId: 1,
            products: [
                { productId: 1, quantity: 5 },
            ],
        });

        const response = await request.put(`${Routes.BASE_URL}${Routes.UPDATE_CART.replace('{id}', String(cartId))}`, {
            data: payload,
        });

        expect(response.status(), 'Update cart should return status 200').toBe(200);
        const cart = await response.json();
        expect(cart.id, 'Updated cart should preserve the requested cart id').toBe(cartId);
        expect(cart.products).toEqual(payload.products);
    });

    test('Delete cart responds successfully @master @sanity @regression @api', async ({ request }) => {
        const cartId = 1;
        const response = await request.delete(`${Routes.BASE_URL}${Routes.DELETE_CART.replace('{id}', String(cartId))}`);

        expect(response.status(), 'Delete cart should return status 200').toBe(200);
        const cart = await response.json();
        expect(cart.id, 'Deleted cart should include the deleted cart id').toBe(cartId);
    });

    test('Cart response matches the expected schema @master @sanity @regression @api', async ({ request }) => {
        const cartId = 1;
        const response = await request.get(`${Routes.BASE_URL}${Routes.GET_CART_BY_ID.replace('{id}', String(cartId))}`);

        expect(response.status(), 'Get cart by id for schema validation should return status 200').toBe(200);
        const cart = await response.json();
        const validateCart = ajv.compile(DataProvider.readJson(path.resolve(__dirname, '../../api/schemas/cart_api_schema.json')));
        expect(validateCart(cart), `Cart schema should validate: ${JSON.stringify(validateCart.errors)}`).toBeTruthy();
    });
});

test.describe('FakeStore API end-to-end workflows', () => {
    test('Product CRUD workflow succeeds using the same product ID @master @sanity @regression @api', async ({ request }) => {
        const createPayload = getProductPayload({ title: 'Workflow Product' });
        const createResponse = await request.post(`${Routes.BASE_URL}${Routes.CREATE_PRODUCT}`, { data: createPayload });

        expect(createResponse.status(), 'Create product workflow step should return status 201').toBe(201);
        const createdProduct = await createResponse.json();
        const createdProductId = createdProduct.id;

        const updatePayload = { ...createPayload, title: 'Updated Workflow Product', price: 149.99 };
        const updateResponse = await request.put(`${Routes.BASE_URL}${Routes.UPDATE_PRODUCT.replace('{id}', String(createdProductId))}`, {
            data: updatePayload,
        });

        expect(updateResponse.status(), 'Update product workflow step should return status 200').toBe(200);
        const updatedProduct = await updateResponse.json();
        expect(updatedProduct.id).toBe(createdProductId);
        expect(updatedProduct.title).toBe(updatePayload.title);
        expect(updatedProduct.price).toBe(updatePayload.price);

        const deleteResponse = await request.delete(`${Routes.BASE_URL}${Routes.DELETE_PRODUCT.replace('{id}', String(createdProductId))}`);
        expect(deleteResponse.status(), 'Delete product workflow step should return status 200').toBe(200);
    });

    test('User CRUD workflow succeeds using the same user ID @master @sanity @regression @api', async ({ request }) => {
        const createPayload = getUserPayload({ username: 'workflow_user' });
        const createResponse = await request.post(`${Routes.BASE_URL}${Routes.CREATE_USER}`, { data: createPayload });

        expect(createResponse.status(), 'Create user workflow step should return status 201').toBe(201);
        const createdUser = await createResponse.json();
        const createdUserId = createdUser.id;

        const updatePayload = { ...createPayload, username: 'workflow_user_updated', email: 'workflow_updated@example.com' };
        const updateResponse = await request.put(`${Routes.BASE_URL}${Routes.UPDATE_USER.replace('{id}', String(createdUserId))}`, {
            data: updatePayload,
        });

        expect(updateResponse.status(), 'Update user workflow step should return status 200').toBe(200);
        const updatedUser = await updateResponse.json();
        expect(updatedUser.username).toBe(updatePayload.username);
        expect(updatedUser.email).toBe(updatePayload.email);
        expect(updatedUser.name.firstname).toBe(updatePayload.name.firstname);
        expect(updatedUser.name.lastname).toBe(updatePayload.name.lastname);

        const deleteResponse = await request.delete(`${Routes.BASE_URL}${Routes.DELETE_USER.replace('{id}', String(createdUserId))}`);
        expect(deleteResponse.status(), 'Delete user workflow step should return status 200').toBe(200);
    });

    test('Cart CRUD workflow succeeds using the same cart ID @master @sanity @regression @api', async ({ request }) => {
        const createPayload = getCartPayload({ userId: 2, products: [{ productId: 9, quantity: 2 }] });
        const createResponse = await request.post(`${Routes.BASE_URL}${Routes.CREATE_CART}`, { data: createPayload });

        expect(createResponse.status(), 'Create cart workflow step should return status 201').toBe(201);
        const createdCart = await createResponse.json();
        const createdCartId = createdCart.id;
        expect(createdCart.userId).toBe(createPayload.userId);
        expect(createdCart.products).toEqual(createPayload.products);

        const updatePayload = { ...createPayload, products: [{ productId: 9, quantity: 5 }] };
        const updateResponse = await request.put(`${Routes.BASE_URL}${Routes.UPDATE_CART.replace('{id}', String(createdCartId))}`, {
            data: updatePayload,
        });

        expect(updateResponse.status(), 'Update cart workflow step should return status 200').toBe(200);
        const updatedCart = await updateResponse.json();
        expect(updatedCart.id).toBe(createdCartId);
        expect(updatedCart.products).toEqual(updatePayload.products);

        const deleteResponse = await request.delete(`${Routes.BASE_URL}${Routes.DELETE_CART.replace('{id}', String(createdCartId))}`);
        expect(deleteResponse.status(), 'Delete cart workflow step should return status 200').toBe(200);
    });
});
