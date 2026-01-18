# HoyaDevsFinalProject
Final project for the Hoya Developers bootcamp. A website for taking attendance, hosted on Vercel. 

## App overview
Website allowing professors to track student attendance. It allows for the creation of multiple classes, which can then be accessed from the home page. In the specific page for each class, you can register students, take attendance for a specific day, and view previous attendance records on a calendar. 

## Key design decisions/assumptions
Built using JS, CSS, and HTML. I didn't use react.

## How data is stored
All data is stored with Javascript arrays. There are three of them. One that stores a list of classes, one that stores a list of students (each of which has a classID as a member) and one that stores instances of taken attendance (also with a classID member to check which class the attendance belongs to).

## Any extra features implemented
I did the multiple classes extra feature. 

## How to run
Visit https://hoya-devs-final-project-6u304zosi-peter-clancys-projects.vercel.app/
