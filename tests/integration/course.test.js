// eslint-disable-next-line node/no-unpublished-require
const request = require('supertest');
const app = require('../../src/app');

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
    expect(res.body.course.id).toBe(courseId);
  });

  test('POST /courses should create a new course', async () => {
    const res = await request(app)
      .post('/courses')
      .send({ title: 'New Course', teacher: 'Test course' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('New Course');
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

  test('DELETE /courses/:id should delete a course successfully', async () => {
    const res = await request(app)
      .delete('/courses/1');
    expect(res.statusCode).toBe(204);
  });

  test('DELETE /courses/:id should return 404 when deleting non-existent course', async () => {
    const res = await request(app)
      .delete('/courses/999');
    expect(res.statusCode).toBe(404);
  });

  test('DELETE /courses/:id should handle course with enrolled students', async () => {
    const courses = await request(app).get('/courses');
    const courseId = courses.body.courses[0].id;
    await request(app).post(`/courses/${courseId}/students/1`);
    const res = await request(app).delete(`/courses/${courseId}`);
    expect(res.statusCode).toBe(204);
  });
});
