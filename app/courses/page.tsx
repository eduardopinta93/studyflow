import Link from 'next/link';

const courses = [
    {
        code: 'WDD 430',
        name: 'Web Full-Stack Development',
        instructor: 'Professor Smith',
        assignments: 3,
        upcoming: 1,
    },
    {
        code: 'CS 360',
        name: 'Database Management',
        instructor: 'Professor Jones',
        assignments: 5,
        upcoming: 2,
    },
    {
        code: 'ENG 210',
        name: 'Academic Research',
        instructor: 'Professor Williams',
        assignments: 4,
        upcoming: 1,
    },
];

export default function CoursesPage() {
    return (
        <section className="courses-page">
            <div className="courses-heading">
                <div>
                    <p className="page-eyebrow">Stay organized</p>
                    <h1>My Courses</h1>
                    <p>View and manage the classes connected to your academic workload.</p>
                </div>
                <Link className="primary-button" href="#add-course">
                    Add course
                </Link>
            </div>

            <div className="course-tools">
                <label htmlFor="course-search">Search courses</label>
                <input id="course-search" name="course-search" placeholder="Search by name or code" type="search" />
                <label htmlFor="course-sort">Sort courses</label>
                <select defaultValue="name" id="course-sort" name="course-sort">
                    <option value="name">Name</option>
                    <option value="code">Course code</option>
                    <option value="assignments">Assignment count</option>
                </select>
            </div>

            <div className="course-grid">
                {courses.map((course) => (
                    <article className="course-card" key={course.code}>
                        <div className="course-card-heading">
                            <div>
                                <p className="course-code">{course.code}</p>
                                <h2>{course.name}</h2>
                            </div>
                            <span className="course-status">Active</span>
                        </div>
                        <p className="course-instructor">{course.instructor}</p>
                        <div className="course-summary">
                            <span>{course.assignments} assignments</span>
                            <span>{course.upcoming} upcoming</span>
                        </div>
                        <div className="course-actions">
                            <Link href={`/courses/${course.code.toLowerCase().replace(' ', '-')}`}>View course</Link>
                            <button type="button">Edit</button>
                            <button type="button">Delete</button>
                        </div>
                    </article>
                ))}
            </div>

            <div className="add-course-placeholder" id="add-course">
                <h2>Need to add another class?</h2>
                <p>The course form will go here when course data is connected to the database.</p>
            </div>
        </section>
    );
}
