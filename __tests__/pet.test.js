const axios = require('axios');
const { matchers } = require('jest-json-schema');
const FormData = require('form-data');
const fs = require('fs');
const { baseURL } = require('../config');

expect.extend(matchers);

describe('Pet API Tests', () => {
	let petId;

	afterAll(() => {
		jest.clearAllMocks();
		jest.clearAllTimers();
	});

	it('POST /pet - Positive: Add a new pet', async () => {
		const response = await axios.post(`${baseURL}/pet`, {
			id: 1234,
			name: 'Doggie',
			status: 'available',
		});

		expect(response.status).toBe(200);

		petId = response.data.id;

		expect(response.data).toHaveProperty('name', 'Doggie');
		expect(response.data).toHaveProperty('status', 'available');
	});

	it('GET /pet/{petId} - Positive: Get pet by ID', async () => {
		const response = await axios.get(`${baseURL}/pet/${petId}`);
		expect(response.status).toBe(200);
		expect(response.data).toHaveProperty('name', 'Doggie');
	});

	it('GET /pet/{petId} - Negative: Get non-existent pet', async () => {
		try {
			await axios.get(`${baseURL}/pet/0`);
		} catch (error) {
			expect(error.response.status).toBe(404);
		}
	});

	it('PUT /pet - Positive: Update pet', async () => {
		const response = await axios.put(`${baseURL}/pet`, {
			id: petId,
			name: 'UpdatedDoggie',
			status: 'sold',
		});
		expect(response.status).toBe(200);
		expect(response.data).toHaveProperty('name', 'UpdatedDoggie');
	});

	it('Response time and headers validation', async () => {
		const startTime = Date.now();

		const response = await axios.get(`${baseURL}/pet/${petId}`);

		const endTime = Date.now();

		const responseTime = endTime - startTime;

		console.log('Response time for get pet:', responseTime, 'ms');

		expect(response.headers).toHaveProperty('content-type');
		expect(response.headers['content-type']).toContain('application/json');

		expect(responseTime).toBeLessThan(500);
	});

	it('Validate JSON schema', async () => {
		const response = await axios.get(`${baseURL}/pet/${petId}`);

		const petSchema = {
			type: 'object',
			properties: {
				id: { type: 'integer' },
				category: {
					type: 'object',
					properties: {
						id: { type: 'integer' },
						name: { type: 'string' },
					},
					required: ['id', 'name'],
				},
				name: { type: 'string' },
				photoUrls: {
					type: 'array',
					items: { type: 'string' },
				},
				status: { type: 'string' },
				tags: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							id: { type: 'integer' },
							name: { type: 'string' },
						},
						required: ['id', 'name'],
					},
				},
			},
			required: ['id', 'name', 'status'],
		};

		expect(response.data).toMatchSchema(petSchema);
	});

	it('POST /pet/{petId}/uploadImage -  Upload an image', async () => {
		const form = new FormData();
		const filePath = './uploads/JEST-final.png';

		if (!fs.existsSync(filePath)) {
			throw new Error(`File ${filePath} does not exist`);
		}

		form.append('file', fs.createReadStream(filePath));

		const response = await axios.post(
			`${baseURL}/pet/${petId}/uploadImage`,
			form,
			{
				headers: {
					...form.getHeaders(),
				},
			}
		);

		expect(response.status).toBe(200);
		expect(response.data).toHaveProperty('message');
		expect(response.data).toHaveProperty('code', 200);
	});

	it('POST /pet/{petId}/uploadImage - Negative: Upload an image', async () => {
		try {
			const response = await axios.post(
				`https://petstore.swagger.io/v2/pet/${petId}/uploadImage`,
				{
					id: petId,
					additionalMetadata: 'test',
				}
			);

			throw new Error('Request should have failed but succeeded');
		} catch (error) {
			expect(error.response.status).toBe(415);
			expect(error.response.data).toHaveProperty('code', 415);
		}
	});

	it('DELETE /pet/{petId} - Positive: Delete pet', async () => {
		const response = await axios.delete(`${baseURL}/pet/${petId}`);
		expect(response.status).toBe(200);
	});

	it('DELETE /pet/{petId} - Negative: Delete pet', async () => {
		try {
			await axios.delete(`${baseURL}/pet/000`);

			throw new Error('Request failed with status code 404');
		} catch (error) {
			expect(error.response.status).toBe(404);
			expect(error.response.statusText).toBe('Not Found');
		}
	});
});
