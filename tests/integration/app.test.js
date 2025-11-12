// eslint-disable-next-line node/no-unpublished-require
const request = require('supertest');
const app = require('../../src/app');

describe('Student-Course API integration', () => {
  beforeEach(() => {
    require('../../src/services/storage').reset();
    require('../../src/services/storage').seed();
  });

  test('GET /students should return seeded students', async () => {
    const res = await request(app).get('/students');
    expect(res.statusCode).toBe(200);
    expect(res.body.students.length).toBe(3);
    expect(res.body.students[0].name).toBe('Alice');
  });

  test('GET /students/:id should return a specific student', async () => {
    const res = await request(app).get('/students/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
  });

  test('POST /students should create a new student', async () => {
    const res = await request(app)
      .post('/students')
      .send({ name: 'David', email: 'david@example.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('David');
  });

  test('POST /students should not allow duplicate email', async () => {
    const res = await request(app)
      .post('/students')
      .send({ name: 'Eve', email: 'alice@example.com' });
    expect(res.statusCode).toBe(400);
  });

  test('PUT /students/:id should update a student', async () => {
    const res = await request(app)
      .put('/students/1')
      .send({ name: 'Alice Updated', email: 'alice.updated@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Alice Updated');
  });

  test('DELETE /students/:id should delete a student', async () => {
    const res = await request(app).delete('/students/1');
    expect(res.statusCode).toBe(204);
  });

  test('DELETE /courses/:id should delete a course even if students are enrolled', async () => {
    const courses = await request(app).get('/courses');
    const courseId = courses.body.courses[0].id;
    await request(app).post(`/courses/${courseId}/students/1`);
    const res = await request(app).delete(`/courses/${courseId}`);
    expect(res.statusCode).toBe(204);
  });
});

describe('Course API integration', () => {

  beforeEach(() => {
    require('../../src/services/storage').reset();
    require('../../src/services/storage').seed();
  });

  test('GET /courses should return seeded courses', async () => {
    const res = await request(app).get('/courses');
    expect(res.statusCode).toBe(200);
    expect(res.body.courses.length).toBeGreaterThan(0);
  });

  test('GET /courses/:id should return a specific course', async () => {
    const courses = await request(app).get('/courses');
    const courseId = courses.body.courses[0].id;
    const res = await request(app).get(`/courses/${courseId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(courseId);
  });

  test('POST /courses should create a new course', async () => {
    const res = await request(app)
      .post('/courses')
      .send({ name: 'New Course', description: 'Test course' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('New Course');
  });

  test('POST /courses/:courseId/students/:studentId should enroll a student', async () => {
    const courses = await request(app).get('/courses');
    const courseId = courses.body.courses[0].id;
    const res = await request(app).post(`/courses/${courseId}/students/1`);
    expect(res.statusCode).toBe(201);
  });

  test('DELETE /courses/:courseId/students/:studentId should unenroll a student', async () => {
    const courses = await request(app).get('/courses');
    const courseId = courses.body.courses[0].id;
    await request(app).post(`/courses/${courseId}/students/1`);
    const res = await request(app).delete(`/courses/${courseId}/students/1`);
    expect(res.statusCode).toBe(204);
  });
});
