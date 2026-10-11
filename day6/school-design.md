# School Database Design

## 1. Table Descriptions

### Students

The `students` table stores information about students. Each student has a unique `student_id`, a name, and an email address. The student ID is the primary key, while the email is required and must be unique.

### Courses

The `courses` table stores information about courses offered by the school. Each course has a unique `course_id`, a course name, and an optional description. The course ID is the primary key.

### Enrolments

The `enrolments` table records which students are enrolled in which courses. It also stores each student's grade for a particular course. The table has its own primary key, `enrolment_id`, and foreign keys referencing the students and courses tables.

The combination of `student_id` and `course_id` must be unique to prevent the same student from enrolling in the same course more than once.

## 2. Relationships

### One-to-Many Relationships

The relationship between students and enrolments is one-to-many because one student can have multiple enrolment records, while each enrolment belongs to one student.

The relationship between courses and enrolments is also one-to-many because one course can have multiple enrolment records, while each enrolment refers to one course.

### Many-to-Many Relationship

Students and courses have a many-to-many relationship. A student can enrol in multiple courses, and a course can contain multiple students.

A join table, `enrolments`, is needed to represent this relationship in a relational database. It connects students and courses through foreign keys and stores additional information, such as grades, for each student-course combination.

## 3. Recommended Index

I would add an index on `enrolments.course_id` to improve queries that retrieve students enrolled in a particular course and queries that group enrolments by course.

Example:

```sql
CREATE INDEX idx_enrolments_course_id
ON enrolments(course_id);
```

This index can improve data retrieval when the database contains many enrolments. It requires additional storage and may add overhead to insertions and updates.

## 4. SQL or NoSQL?

I would choose a relational SQL database for this school system because students, courses, enrolments, and grades have clear relationships. SQL supports primary keys, foreign keys, unique constraints, and structured queries that help maintain data integrity. JOIN operations make it straightforward to retrieve the courses taken by a student or the students enrolled in a course. A NoSQL database can be useful for flexible or less structured data, but a relational database is a natural fit for this system because its data is structured and its relationships are important.
