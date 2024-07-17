

-- Drop existing schema if it exists
DROP SCHEMA IF EXISTS public CASCADE;

-- Create new schema
CREATE SCHEMA public;

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create user_type ENUM if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
    CREATE TYPE user_type AS ENUM ('STUDENT', 'TUTOR', 'ADMIN', 'STAFF', 'NA');
  END IF;
END $$;

-- Drop existing tables
DROP TABLE IF EXISTS "student_subject";
DROP TABLE IF EXISTS "subject_tutor";
DROP TABLE IF EXISTS "staff";
DROP TABLE IF EXISTS "tutor";
DROP TABLE IF EXISTS "student";
DROP TABLE IF EXISTS "grade";
DROP TABLE IF EXISTS "subject";
DROP TABLE IF EXISTS "classroom";
DROP TABLE IF EXISTS "timetable";

-- Create users table
CREATE TABLE IF NOT EXISTS "student" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  contact VARCHAR(255) NOT NULL,
  grade VARCHAR(255) NOT NULL,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS "tutor" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  contact VARCHAR(255) NOT NULL,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS "staff" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  firstname VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  contact VARCHAR(255) NOT NULL,
  salary INT NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS "subject" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE CHECK (name = UPPER(name))
);

CREATE TABLE IF NOT EXISTS "grade" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "classroom" (
  id SERIAL PRIMARY KEY,
  capacity INT NOT NULL DEFAULT 10,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "subject_tutor" (
  id SERIAL PRIMARY KEY,
  subjectid INTEGER REFERENCES subject(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  tutorid INTEGER REFERENCES tutor(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  gradeid INTEGER REFERENCES grade(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
  fees INT NOT NULL DEFAULT 10
);

CREATE TABLE IF NOT EXISTS "student_subject" (
    id SERIAL PRIMARY KEY,
    studentid INTEGER NOT NULL,
    subjecttutorid INTEGER NOT NULL,
    FOREIGN KEY (studentid) REFERENCES student(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (subjecttutorid) REFERENCES subject_tutor(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS timetable (
    id SERIAL PRIMARY KEY,
    timeslot VARCHAR(255) NOT NULL,
    timeslotid VARCHAR(255) NOT NULL,
    classroomid INTEGER NOT NULL,
    monday INT,
    tuesday INT,
    wednesday INT,
    thursday INT,
    friday INT,
    saturday INT,
    sunday INT,
    FOREIGN KEY (classroomid) REFERENCES classroom(id) ON UPDATE CASCADE ON DELETE CASCADE
);



-- Insert records into student table
INSERT INTO "student" (username, email, password, firstname, lastname, contact, grade)
VALUES
  ('student1', 'student1@gmail.com', crypt('123', gen_salt('bf', 10)), 'John', 'Doe', '123456789', 'Grade 10'),
  ('student2', 'student2@gmail.com', crypt('123', gen_salt('bf', 10)), 'Jane', 'Smith', '987654321', 'Grade 11'),
  ('student3', 'student3@gmail.com', crypt('123', gen_salt('bf', 10)), 'Michael', 'Johnson', '555123456', 'Grade 9'),
  ('student4', 'student4@gmail.com', crypt('123', gen_salt('bf', 10)), 'Emily', 'Brown', '777888999', 'Grade 12'),
  ('student5', 'student5@gmail.com', crypt('123', gen_salt('bf', 10)), 'David', 'Lee', '111222333', 'Grade 11');


-- Insert records into tutor table
INSERT INTO "tutor" (username, email, password, title, firstname, lastname, contact)
VALUES
  ('tutor1', 'tutor1@gmail.com', crypt('123', gen_salt('bf', 10)), 'Professor', 'John', 'Smith', '555111222'),
  ('tutor2', 'tutor2@gmail.com', crypt('123', gen_salt('bf', 10)), 'Instructor', 'Jane', 'Doe', '777888999'),
  ('tutor3', 'tutor3@gmail.com', crypt('123', gen_salt('bf', 10)), 'Teacher', 'Michael', 'Johnson', '333444555'),
  ('tutor4', 'tutor4@gmail.com', crypt('123', gen_salt('bf', 10)), 'Lecturer', 'Emily', 'Brown', '999888777'),
  ('tutor5', 'tutor5@gmail.com', crypt('123', gen_salt('bf', 10)), 'Educator', 'David', 'Lee', '111222333');


-- Insert records into staff table
INSERT INTO "staff" (username, email, password, title, firstname, lastname, position, contact, salary)
VALUES
  ('staff1', 'staff1@gmail.com', crypt('123', gen_salt('bf', 10)), 'Manager', 'John', 'Smith', 'HR Manager', '555111222',122222),
  ('staff2', 'staff2@gmail.com', crypt('123', gen_salt('bf', 10)), 'Supervisor', 'Jane', 'Doe', 'IT Supervisor', '777888999',123232),
  ('staff3', 'staff3@gmail.com', crypt('123', gen_salt('bf', 10)), 'Coordinator', 'Michael', 'Johnson', 'Admin Coordinator', '333444555',234234),
  ('staff4', 'staff4@gmail.com', crypt('123', gen_salt('bf', 10)), 'Assistant', 'Emily', 'Brown', 'Executive Assistant', '999888777',234234),
  ('staff5', 'staff5@gmail.com', crypt('123', gen_salt('bf', 10)), 'Director', 'David', 'Lee', 'Technical Director', '111222333',2342344);


-- Insert records into subject table
INSERT INTO "subject" (name)
VALUES
  ('MATHEMATICS'),
  ('PHYSICS'),
  ('CHEMISTRY'),
  ('BIOLOGY'),
  ('ENGLISH');


-- Insert records into grade table
INSERT INTO "grade" (name)
VALUES
  ('Grade 9'),
  ('Grade 10'),
  ('Grade 11'),
  ('Grade 12'),
  ('Grade 13');

-- Insert records into classroom table
INSERT INTO "classroom" (name, capacity)
VALUES
  ('Classroom A', 30),
  ('Classroom B', 25),
  ('Classroom C', 35),
  ('Classroom D', 20),
  ('Classroom E', 40);

-- Insert records into subject tutor table
INSERT INTO "subject_tutor" ( tutorid, subjectid, gradeid, fees)
VALUES
  (1,1,1, 3000),
  (1,1,1, 4000),
  (2,2,1, 5000),
  (3,1,5, 2500);

INSERT INTO "student_subject" ( studentid, subjecttutorid)
VALUES
  (1,2),
  (2,4),
  (1,2),
  (2,3),
  (1,4),
  (3,4);

INSERT INTO "timetable" (timeslot, timeslotid,classroomid, monday, tuesday, wednesday, thursday, friday, saturday, sunday) VALUES 
('7.00-9.00',1,1,2,3,4,3,4,1,2),
('9.00-11.00',2,1,2,3,4,3,4,1,2),
('11.00-13.00',3,1,2,3,4,3,4,1,2),
('13.00-15.00',4,1,2,3,4,3,4,1,2),
('15.00-17.00',5,1,2,3,4,3,4,1,2),
('17.00-19.00',6,1,2,3,4,3,4,1,2),
('19.00-21.00',7,1,2,3,4,3,4,1,2);